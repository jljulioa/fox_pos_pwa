"use client";

import { useState, useEffect } from "react";
import {
  Truck, Search, Plus, FileText, Hash, Calendar, DollarSign, Loader2, ArrowLeft,
  X, Box, CheckCircle2, PackagePlus, ArrowRight, AlertCircle, Eye, CreditCard, ChevronRight
} from "lucide-react";
import { purchaseService } from "@/services/purchaseService";
import { inventoryService } from "@/services/inventoryService";
import { cn } from "@/lib/utils";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageError, setPageError] = useState<string | null>(null);

  // View States: list, new_purchase, view_purchase
  const [currentView, setCurrentView] = useState<"list" | "new_purchase" | "view_purchase">("list");
  
  // New Purchase State
  const [submitting, setSubmitting] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    invoice_number: "",
    supplier_name: "",
    invoice_date: new Date().toISOString().split("T")[0],
  });
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [payment, setPayment] = useState({
    amount: "0",
    method: "transfer",
    notes: ""
  });

  // View Purchase State
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [newPaymentMethod, setNewPaymentMethod] = useState("transfer");

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    setPageError(null);
    try {
      const [purchasesData, productsData] = await Promise.all([
        purchaseService.fetchPurchases(),
        inventoryService.fetchProducts()
      ]);
      setPurchases(purchasesData.data || []);
      setProducts(productsData.data || []);
    } catch (err: any) {
      console.error(err);
      setPageError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const openNewPurchase = () => {
    setNewPurchase({
      invoice_number: `INV-${Math.floor(Math.random() * 100000)}`,
      supplier_name: "",
      invoice_date: new Date().toISOString().split("T")[0],
    });
    setCartItems([]);
    setPayment({ amount: "0", method: "transfer", notes: "" });
    setCurrentView("new_purchase");
  };

  const addProductToCart = (product: any) => {
    const exists = cartItems.find(item => item.product_id === product.id);
    if (exists) {
      setCartItems(cartItems.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1, total_cost: (item.quantity + 1) * item.cost_price }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        quantity: 1,
        cost_price: product.cost || 0,
        total_cost: product.cost || 0
      }]);
    }
    setProductSearch("");
  };

  const updateCartItem = (productId: string, field: string, value: string) => {
    setCartItems(cartItems.map(item => {
      if (item.product_id === productId) {
        const numValue = parseFloat(value) || 0;
        const newItem = { ...item, [field]: numValue };
        if (field === "quantity" || field === "cost_price") {
          newItem.total_cost = newItem.quantity * newItem.cost_price;
        }
        return newItem;
      }
      return item;
    }));
  };

  const removeCartItem = (productId: string) => {
    setCartItems(cartItems.filter(item => item.product_id !== productId));
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.total_cost, 0);

  const handleCreatePurchase = async () => {
    if (!newPurchase.invoice_number || !newPurchase.supplier_name) return alert("Please fill invoice string and supplier name.");
    if (cartItems.length === 0) return alert("Please add at least one product.");
    setSubmitting(true);
    
    const paymentAmountNum = parseFloat(payment.amount) || 0;
    const balanceDue = cartTotal - paymentAmountNum;
    let paymentStatus = "unpaid";
    if (balanceDue <= 0) paymentStatus = "paid";
    else if (paymentAmountNum > 0) paymentStatus = "partial";

    try {
      await purchaseService.createPurchase({
        invoice_number: newPurchase.invoice_number,
        supplier_name: newPurchase.supplier_name,
        invoice_date: newPurchase.invoice_date,
        total_amount: cartTotal,
        balance_due: balanceDue > 0 ? balanceDue : 0,
        payment_status: paymentStatus
      }, cartItems, {
        amount: paymentAmountNum,
        payment_method: payment.method,
        notes: payment.notes
      });
      await fetchInitialData();
      setCurrentView("list");
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPayment = async () => {
    const amt = parseFloat(newPaymentAmount) || 0;
    if (amt <= 0) return;
    setSubmitting(true);
    try {
      await purchaseService.addPayment({
        purchases_id: selectedPurchase.id,
        amount: amt,
        payment_method: newPaymentMethod,
        notes: "Additional payment"
      });
      await fetchInitialData();
      
      // Update local selected purchase viewing state
      const { data } = await purchaseService.fetchPurchases();
      if (data) {
        setPurchases(data);
        const updated = data.find((p: any) => p.id === selectedPurchase.id);
        if (updated) setSelectedPurchase(updated);
      }
      setNewPaymentAmount("");
    } catch (err: any) {
      alert("Error adding payment: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPurchases = purchases.filter(p => 
    p.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku?.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 5); // Limit search results to 5

  if (currentView === "new_purchase") {
    return (
      <div className="flex flex-col h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-4rem)] lg:-m-4 gap-0 overflow-hidden bg-[#F8F9FA]">
        <header className="p-6 lg:p-10 border-b border-primary/5 bg-white shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView("list")} className="p-3 bg-secondary/50 rounded-2xl hover:bg-secondary text-primary transition-all">
              <ArrowLeft size={20} strokeWidth={1.5} />
            </button>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-primary uppercase">Register Purchase</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Stock Intake & Supplier Invoice</p>
            </div>
          </div>
          <button 
            disabled={submitting}
            onClick={handleCreatePurchase}
            className="bg-primary text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} strokeWidth={1.5} />}
            Commit Purchase
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-primary/5">
              <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2"><FileText size={18} /> Invoice Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-2">Invoice Number</label>
                  <div className="relative">
                    <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
                    <input value={newPurchase.invoice_number} onChange={e => setNewPurchase({...newPurchase, invoice_number: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-secondary/20 rounded-2xl border-none font-bold text-primary focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-2">Supplier Name</label>
                  <div className="relative">
                    <Truck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
                    <input value={newPurchase.supplier_name} onChange={e => setNewPurchase({...newPurchase, supplier_name: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-secondary/20 rounded-2xl border-none font-bold text-primary focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-2">Date Received</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
                    <input type="date" value={newPurchase.invoice_date} onChange={e => setNewPurchase({...newPurchase, invoice_date: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-secondary/20 rounded-2xl border-none font-bold text-primary focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-primary/5">
               <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2"><PackagePlus size={18} /> Received Items</h2>
               <div className="relative mb-6">
                 <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" />
                 <input 
                   placeholder="Search product to add..." 
                   value={productSearch} 
                   onChange={e => setProductSearch(e.target.value)} 
                   className="w-full pl-14 pr-6 py-4 bg-secondary/20 rounded-3xl border-none font-bold text-primary focus:ring-2 focus:ring-primary/20"
                 />
                 {productSearch && (
                   <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-primary/10 overflow-hidden z-10">
                     {filteredProducts.map(p => (
                       <button key={p.id} onClick={() => addProductToCart(p)} className="flex items-center justify-between w-full p-4 hover:bg-secondary/30 text-left transition-colors border-b last:border-0 border-primary/5">
                         <div>
                           <div className="font-bold text-primary">{p.name}</div>
                           <div className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">SKU: {p.sku} | Stock: {p.stock}</div>
                         </div>
                         <Plus size={18} className="text-primary" />
                       </button>
                     ))}
                     {filteredProducts.length === 0 && <div className="p-4 text-sm text-center text-muted-foreground">No matching products found.</div>}
                   </div>
                 )}
               </div>

               {cartItems.length > 0 ? (
                 <div className="space-y-3">
                   {cartItems.map(item => (
                     <div key={item.product_id} className="grid grid-cols-12 gap-4 items-center p-4 bg-secondary/10 rounded-2xl border border-primary/5">
                       <div className="col-span-4">
                         <div className="font-bold text-sm text-primary uppercase truncate">{item.name}</div>
                         <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{item.sku}</div>
                       </div>
                       <div className="col-span-3">
                         <div className="text-[9px] font-black uppercase text-primary/40 tracking-widest mb-1">Quantity</div>
                         <input type="number" min="1" value={item.quantity} onChange={e => updateCartItem(item.product_id, "quantity", e.target.value)} className="w-full py-2 px-3 text-center bg-white rounded-xl border-none text-sm font-bold" />
                       </div>
                       <div className="col-span-3">
                         <div className="text-[9px] font-black uppercase text-primary/40 tracking-widest mb-1">Unit Cost</div>
                         <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-black text-primary/30">$</span>
                            <input type="number" min="0" step="0.01" value={item.cost_price} onChange={e => updateCartItem(item.product_id, "cost_price", e.target.value)} className="w-full pl-6 pr-3 py-2 text-right bg-white rounded-xl border-none text-sm font-bold" />
                         </div>
                       </div>
                       <div className="col-span-1 text-right">
                         <div className="text-[9px] font-black uppercase tracking-widest text-primary/40 mb-1">Total</div>
                         <div className="font-bold text-sm text-primary">${item.total_cost.toFixed(2)}</div>
                       </div>
                       <div className="col-span-1 text-right">
                         <button onClick={() => removeCartItem(item.product_id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><X size={16} strokeWidth={2} /></button>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="py-10 text-center text-muted-foreground opacity-50 flex flex-col items-center">
                   <Box size={40} className="mb-4" strokeWidth={1} />
                   <p className="text-sm font-bold uppercase tracking-widest">No items added yet</p>
                 </div>
               )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-accent/5 rounded-[2rem] p-8 border border-accent/10">
              <h2 className="text-sm font-black text-accent uppercase tracking-widest mb-6">Purchase Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold text-primary">
                  <span>Total Items</span>
                  <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} Units</span>
                </div>
                <div className="h-px bg-accent/20 my-4" />
                <div className="flex justify-between items-center text-accent">
                  <span className="text-sm font-black uppercase tracking-widest mt-1">Total Cost</span>
                  <span className="text-3xl font-black italic tracking-tighter">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-primary/5">
              <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2"><CreditCard size={18} /> Initial Payment</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-2">Amount Paid</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
                    <input type="number" step="0.01" value={payment.amount} onChange={e => setPayment({...payment, amount: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-secondary/20 rounded-2xl border-none font-bold text-primary focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-2">Payment Method</label>
                  <select value={payment.method} onChange={e => setPayment({...payment, method: e.target.value})} className="w-full px-4 py-3 bg-secondary/20 rounded-2xl border-none font-bold text-primary focus:ring-2 focus:ring-primary/20 appearance-none">
                    <option value="cash">Cash</option>
                    <option value="transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (currentView === "view_purchase" && selectedPurchase) {
    return (
      <div className="flex flex-col h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-4rem)] lg:-m-4 gap-0 overflow-hidden bg-[#F8F9FA]">
        <header className="p-6 lg:p-10 border-b border-primary/5 bg-white shrink-0 flex items-center gap-4">
          <button onClick={() => setCurrentView("list")} className="p-3 bg-secondary/50 rounded-2xl hover:bg-secondary text-primary transition-all">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-primary uppercase">Purchase Invoice</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Ref: {selectedPurchase.invoice_number}</p>
            </div>
            <div className={cn(
              "px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest border",
              selectedPurchase.payment_status === "paid" ? "bg-green-50 text-green-600 border-green-200" :
              selectedPurchase.payment_status === "partial" ? "bg-orange-50 text-orange-600 border-orange-200" : "bg-red-50 text-red-600 border-red-200"
            )}>
              {selectedPurchase.payment_status}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
             <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-primary/5 grid grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Supplier</div>
                  <div className="font-bold text-primary text-lg">{selectedPurchase.supplier_name}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Received Date</div>
                  <div className="font-bold text-primary">{new Date(selectedPurchase.invoice_date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Logged At</div>
                  <div className="font-bold text-primary">{new Date(selectedPurchase.created_at).toLocaleString()}</div>
                </div>
             </div>

             <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-primary/5">
                <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-6">Items Brought In</h2>
                <div className="space-y-4">
                  {selectedPurchase.purchase_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center p-4 bg-secondary/10 rounded-2xl border border-primary/5">
                       <div>
                          <div className="font-bold text-primary uppercase">{item.products?.name}</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{item.products?.sku} • {item.quantity} Units @ ${Number(item.cost_price).toFixed(2)}</div>
                       </div>
                       <div className="text-right">
                          <div className="font-black text-primary italic text-lg">${Number(item.total_cost).toFixed(2)}</div>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
          
          <div className="space-y-6">
             <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-primary/5 space-y-4">
                <div className="flex justify-between text-sm font-bold text-primary">
                  <span>Total Amount</span>
                  <span>${Number(selectedPurchase.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-green-600">
                  <span>Paid So Far</span>
                  <span>${(Number(selectedPurchase.total_amount) - Number(selectedPurchase.balance_due)).toFixed(2)}</span>
                </div>
                <div className="h-px bg-primary/10 my-4" />
                <div className="flex justify-between items-center text-red-600">
                  <span className="text-sm font-black uppercase tracking-widest mt-1">Due Balance</span>
                  <span className="text-3xl font-black italic tracking-tighter">${Number(selectedPurchase.balance_due).toFixed(2)}</span>
                </div>
             </div>

             {Number(selectedPurchase.balance_due) > 0 && (
               <div className="bg-accent/5 border border-accent/20 rounded-[2rem] p-6 space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-widest text-accent mb-4">Add Payment</h3>
                 <input type="number" step="0.01" value={newPaymentAmount} onChange={e => setNewPaymentAmount(e.target.value)} placeholder="Amount..." className="w-full bg-white px-4 py-3 rounded-xl border-none font-bold text-primary focus:ring-2 focus:ring-accent" />
                 <select value={newPaymentMethod} onChange={e => setNewPaymentMethod(e.target.value)} className="w-full bg-white px-4 py-3 rounded-xl border-none font-bold text-primary focus:ring-2 focus:ring-accent">
                    <option value="cash">Cash</option>
                    <option value="transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                 </select>
                 <button disabled={submitting} onClick={handleAddPayment} className="w-full py-4 text-white bg-accent hover:bg-accent/90 focus:ring-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2">
                   {submitting ? <Loader2 size={16} className="animate-spin" /> : <DollarSign size={16} />} Record Payment
                 </button>
               </div>
             )}

             <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-primary/5">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Payment History</h3>
                <div className="space-y-3">
                  {selectedPurchase.purchases_payments?.length === 0 && <span className="text-xs text-muted-foreground italic font-semibold">No payments yet.</span>}
                  {selectedPurchase.purchases_payments?.map((pay: any) => (
                    <div key={pay.id} className="flex justify-between items-center p-3 text-sm bg-secondary/10 rounded-xl">
                      <div className="font-bold text-primary">{new Date(pay.payment_date).toLocaleDateString()} <span className="text-[9px] uppercase tracking-widest font-black ml-1 text-primary/40">({pay.payment_method})</span></div>
                      <div className="font-black italic text-green-600">${Number(pay.amount).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </main>
      </div>
    );
  }

  // --- List View ---
  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-4rem)] lg:-m-4 gap-0 overflow-hidden bg-[#F8F9FA]">
      <header className="p-6 lg:p-10 space-y-8 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Truck size={24} strokeWidth={1.5} />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-primary">Purchases</h1>
            </div>
            <p className="text-muted-foreground font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              Supplier Invoices & Intake
            </p>
          </div>
          <button
            onClick={openNewPurchase}
            className="bg-primary text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
          >
            <Plus size={18} strokeWidth={1.5} />
            Register Purchase
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={20} strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search by invoice number or supplier..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-3xl bg-white shadow-sm border-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold italic text-primary"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 lg:p-10 pb-10 custom-scrollbar">
        {pageError && (
          <div className="mb-8 p-6 bg-red-50 text-red-600 rounded-[2.5rem] border border-red-100 flex items-center gap-5 shadow-sm">
            <AlertCircle size={24} strokeWidth={1.5} />
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest mb-1">System Error</p>
              <p className="text-xs font-bold opacity-80">{pageError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
             [1, 2, 3, 4].map(i => <div key={i} className="h-64 rounded-[2.5rem] bg-white animate-pulse shadow-sm" />)
          ) : filteredPurchases.length === 0 ? (
             <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-40">
               <Truck size={80} strokeWidth={1} className="mb-6 text-primary" />
               <h3 className="text-xl font-black uppercase tracking-widest">No Purchases Logged</h3>
             </div>
          ) : (
             filteredPurchases.map(purchase => (
               <div key={purchase.id} className="group relative bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-primary/5 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                     <div className="space-y-1.5">
                       <h3 className="text-xl font-black text-primary uppercase italic tracking-tight">{purchase.supplier_name}</h3>
                       <div className="flex items-center gap-2">
                         <span className="px-3 py-1 bg-primary/5 text-primary text-[9px] font-black rounded-full uppercase tracking-widest border border-primary/10">
                           {purchase.invoice_number}
                         </span>
                         <span className={cn(
                           "px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest border",
                           purchase.payment_status === "paid" ? "bg-green-50 text-green-600 border-green-200" :
                           purchase.payment_status === "partial" ? "bg-orange-50 text-orange-600 border-orange-200" : "bg-red-50 text-red-600 border-red-200"
                         )}>
                           {purchase.payment_status}
                         </span>
                       </div>
                     </div>
                     <button onClick={() => { setSelectedPurchase(purchase); setCurrentView("view_purchase"); }} className="p-4 bg-secondary/50 rounded-2xl hover:bg-primary hover:text-white transition-all text-primary">
                       <ChevronRight size={18} strokeWidth={2} />
                     </button>
                  </div>
                  <div className="flex-1 space-y-2 mb-6 text-sm">
                    <div className="flex justify-between font-bold text-muted-foreground"><span>Date</span> <span className="text-primary">{new Date(purchase.invoice_date).toLocaleDateString()}</span></div>
                    <div className="flex justify-between font-bold text-muted-foreground"><span>Items Count</span> <span className="text-primary">{purchase.purchase_items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0}</span></div>
                  </div>
                  <div className="pt-4 border-t border-primary/5 flex justify-between items-center w-full">
                     <div>
                       <div className="text-[9px] font-black uppercase tracking-widest text-primary/40 mb-1">Total Due</div>
                       <div className="text-lg font-black italic text-primary">${Number(purchase.total_amount).toFixed(2)}</div>
                     </div>
                     <div className="text-right">
                       <div className="text-[9px] font-black uppercase tracking-widest text-red-400 mb-1">Unpaid Balance</div>
                       <div className="text-lg font-black italic text-red-500">${Number(purchase.balance_due).toFixed(2)}</div>
                     </div>
                  </div>
               </div>
             ))
          )}
        </div>
      </main>
    </div>
  );
}
