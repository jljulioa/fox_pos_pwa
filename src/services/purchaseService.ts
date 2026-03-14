import { supabase } from "@/lib/supabase";

export const purchaseService = {
  async fetchPurchases() {
    return await supabase
      .from("purchases")
      .select("*, purchase_items(*, products(name, sku)), purchases_payments(*)")
      .order("created_at", { ascending: false });
  },

  async createPurchase(purchase: any, items: any[], payment: any) {
    // 1. Insert Purchase
    const { data: purchaseData, error: purchaseError } = await supabase
      .from("purchases")
      .insert(purchase)
      .select()
      .single();

    if (purchaseError) throw purchaseError;
    const purchaseId = purchaseData.id;

    // 2. Insert Items
    const itemsToInsert = items.map(item => ({
      purchase_id: purchaseId,
      product_id: item.product_id,
      quantity: item.quantity,
      cost_price: item.cost_price,
      total_cost: item.total_cost
    }));

    if (itemsToInsert.length > 0) {
      const { error: itemsError } = await supabase.from("purchase_items").insert(itemsToInsert);
      if (itemsError) throw itemsError;
    }

    // 3. Process Payment if any
    if (payment && payment.amount > 0) {
      const { error: paymentError } = await supabase.from("purchases_payments").insert({
        purchases_id: purchaseId,
        amount: payment.amount,
        payment_method: payment.payment_method,
        notes: payment.notes
      });
      if (paymentError) throw paymentError;
    }

    // 4. Update Inventory & Log Transactions
    for (const item of items) {
      // Get current stock
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("stock, name")
        .eq("id", item.product_id)
        .single();
        
      if (!productError && productData) {
        const stockBefore = productData.stock;
        const stockAfter = stockBefore + item.quantity;
        
        // Update product stock and update cost to the latest purchase cost
        // We use an RPC to bypass the auto-trigger which generates "MANUAL" transactions
        await supabase.rpc("set_stock_skip_trigger", { 
          p_product_id: item.product_id, 
          p_new_stock: stockAfter, 
          p_cost: item.cost_price 
        });

        // Insert inventory transaction
        await supabase.from("inventory_transactions").insert({
          product_id: item.product_id,
          product_name: productData.name,
          transaction_type: "purchase",
          quantity_change: item.quantity,
          stock_before: stockBefore,
          stock_after: stockAfter,
          related_document_id: purchase.invoice_number,
          notes: `Restock from invoice ${purchase.invoice_number}`
        });
      }
    }

    return purchaseData;
  },

  async addPayment(paymentData: any) {
    // Adds a payment and updates the purchase balance
    const { data: purchaseData } = await supabase
      .from("purchases")
      .select("balance_due, payment_status")
      .eq("id", paymentData.purchases_id)
      .single();

    if (!purchaseData) throw new Error("Purchase not found");

    const newBalance = Number(purchaseData.balance_due) - Number(paymentData.amount);
    const newStatus = newBalance <= 0 ? 'paid' : 'partial';

    // Insert payment
    const { error: paymentError } = await supabase.from("purchases_payments").insert({
        purchases_id: paymentData.purchases_id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        notes: paymentData.notes
    });
    if (paymentError) throw paymentError;

    // Update purchase
    const { error: updateError } = await supabase
      .from("purchases")
      .update({ balance_due: Math.max(0, newBalance), payment_status: newStatus })
      .eq("id", paymentData.purchases_id);
      
    if (updateError) throw updateError;
    
    return true;
  }
};
