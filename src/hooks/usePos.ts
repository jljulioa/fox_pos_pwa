import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function usePos() {
    const [products, setProducts] = useState<any[]>([]);
    const [openSales, setOpenSales] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [currentSale, setCurrentSale] = useState<any | null>(null);
    const [cart, setCart] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit_card">("cash");
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async (query: string = "") => {
        try {
            let supabaseQuery = supabase
                .from("products")
                .select("*, product_categories(id, name, taxes(id, name, rate))")
                .gt("stock", 0)
                .order("name");

            if (query) {
                supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
            }

            // Fetch top 12 for performance
            supabaseQuery = supabaseQuery.limit(12);

            const { data, error } = await supabaseQuery;
            if (error) throw error;
            setProducts(data || []);
        } catch (err: any) {
            console.error("Error fetching products:", err);
            setError("Failed to fetch products");
        }
    }, []);

    const fetchOpenSales = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("sales")
                .select(`id, sale_ref, status, customer_id, total_amount, created_at, customers ( name, id )`)
                .eq("status", "open")
                .order("created_at", { ascending: false });
            if (error) throw error;
            setOpenSales(data || []);
        } catch (err: any) {
            console.error("Error fetching open sales:", err);
            setError("Failed to fetch open tickets");
        }
    }, []);

    const fetchCustomers = useCallback(async () => {
        try {
            const { data, error } = await supabase.from("customers").select("id, name").order("name");
            if (error) throw error;
            setCustomers(data || []);
        } catch (err) {
            console.error("Error fetching customers:", err);
        }
    }, []);

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchProducts(), fetchOpenSales(), fetchCustomers()]);
        setLoading(false);
    }, [fetchProducts, fetchOpenSales, fetchCustomers]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const selectSale = async (sale: any) => {
        try {
            setError(null);
            setCurrentSale(sale);
            const { data: items, error: itemsError } = await supabase
                .from("sale_items")
                .select("*, products(*, product_categories(*, taxes(*)))")
                .eq("sale_id", sale.id);
            if (itemsError) throw itemsError;
            if (items) {
                const formattedCart = items.map(item => ({
                    ...item.products,
                    quantity: item.quantity,
                    sale_item_id: item.id,
                    tax_rate: item.products.product_categories?.taxes?.rate || 0
                })).filter(item => !!item.id);
                setCart(formattedCart);
            }
        } catch (err: any) {
            console.error("Error selecting sale:", err);
            setError("Failed to load ticket items");
        }
    };

    const createNewSale = async () => {
        try {
            setError(null);
            const DEFAULT_CUSTOMER_ID = '22222222-2222-2222-2222-222222222222';
            const { data: userData } = await supabase.from("users").select("id").eq("email", "admin@foxpos.com").single();
            const { data: newSale, error: insertError } = await supabase
                .from("sales")
                .insert({ status: 'open', customer_id: DEFAULT_CUSTOMER_ID, cashier_id: userData?.id, total_amount: 0, payment_method: 'cash' })
                .select("*, customers(name)")
                .single();
            if (insertError) throw insertError;
            if (newSale) {
                setOpenSales(prev => [newSale, ...prev]);
                selectSale(newSale);
            }
        } catch (err: any) {
            console.error("Error creating new sale:", err);
            setError("Failed to create new ticket");
        }
    };

    const updateSaleCustomer = async (customerId: string) => {
        if (!currentSale) return;
        try {
            const { error: updateError } = await supabase.from("sales").update({ customer_id: customerId }).eq("id", currentSale.id);
            if (updateError) throw updateError;
            const customerName = customers.find(c => c.id === customerId)?.name || 'Walk-in';
            setCurrentSale((prev: any) => ({ ...prev, customer_id: customerId, customers: { name: customerName } }));
            fetchOpenSales();
        } catch (err) {
            console.error("Error updating customer:", err);
            setError("Failed to update customer");
        }
    };

    const syncCartWithDB = async (updatedCart: any[], saleId: string) => {
        const subtotal = updatedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalTax = updatedCart.reduce((sum, item) => {
            const rate = item.product_categories?.taxes?.rate || item.tax_rate || 0;
            return sum + (item.price * item.quantity * (rate / 100));
        }, 0);
        const totalAmount = subtotal + totalTax;

        await supabase.from("sales").update({ total_amount: totalAmount }).eq("id", saleId);
        fetchOpenSales();
    };

    const addToCart = async (product: any) => {
        if (!currentSale) {
            setError("Select a ticket first");
            return;
        }
        try {
            const taxRate = product.product_categories?.taxes?.rate || 0;
            const existing = cart.find(item => item.id === product.id);
            if (existing) {
                const newQty = existing.quantity + 1;
                const { error: updateError } = await supabase
                    .from("sale_items")
                    .update({
                        quantity: newQty,
                        total_price: product.price * newQty,
                        tax_amount: (product.price * newQty) * (taxRate / 100)
                    })
                    .match({ sale_id: currentSale.id, product_id: product.id });
                if (updateError) throw updateError;
                const newCart = cart.map(item => item.id === product.id ? { ...item, quantity: newQty } : item);
                setCart(newCart);
                syncCartWithDB(newCart, currentSale.id);
            } else {
                const { data: newItem, error: insertError } = await supabase
                    .from("sale_items")
                    .insert({
                        sale_id: currentSale.id,
                        product_id: product.id,
                        quantity: 1,
                        unit_price: product.price,
                        total_price: product.price,
                        tax_amount: product.price * (taxRate / 100)
                    })
                    .select().single();
                if (insertError) throw insertError;
                if (newItem) {
                    const newCart = [...cart, { ...product, quantity: 1, sale_item_id: newItem.id, tax_rate: taxRate }];
                    setCart(newCart);
                    syncCartWithDB(newCart, currentSale.id);
                }
            }
        } catch (err: any) {
            console.error("Add to cart error:", err);
            setError("Failed to update cart in database");
        }
    };

    const updateQuantity = async (productId: string, delta: number) => {
        const item = cart.find(i => i.id === productId);
        if (!item || !currentSale) return;
        try {
            const taxRate = item.product_categories?.taxes?.rate || item.tax_rate || 0;
            const newQty = Math.max(1, item.quantity + delta);
            const { error: updateError } = await supabase
                .from("sale_items")
                .update({
                    quantity: newQty,
                    total_price: item.price * newQty,
                    tax_amount: (item.price * newQty) * (taxRate / 100)
                })
                .match({ sale_id: currentSale.id, product_id: productId });
            if (updateError) throw updateError;
            const newCart = cart.map(i => i.id === productId ? { ...i, quantity: newQty } : i);
            setCart(newCart);
            syncCartWithDB(newCart, currentSale.id);
        } catch (err: any) {
            console.error("Update quantity error:", err);
            setError("Failed to update item quantity");
        }
    };

    const removeFromCart = async (productId: string) => {
        if (!currentSale) return;
        try {
            const { error: deleteError } = await supabase.from("sale_items").delete().match({ sale_id: currentSale.id, product_id: productId });
            if (deleteError) throw deleteError;
            const newCart = cart.filter(i => i.id !== productId);
            setCart(newCart);
            syncCartWithDB(newCart, currentSale.id);
        } catch (err: any) {
            console.error("Remove from cart error:", err);
            setError("Failed to remove item from database");
        }
    };

    const handleCheckout = async () => {
        if (cart.length === 0 || !currentSale) return;
        setProcessing(true);
        try {
            const { error: rpcError } = await supabase.rpc('finalize_sale_and_log_stock', { p_sale_id: currentSale.id, p_payment_method: paymentMethod });
            if (rpcError) throw rpcError;
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setCart([]);
                setCurrentSale(null);
                fetchInitialData();
                setProcessing(false);
            }, 2000);
        } catch (err: any) {
            console.error("Checkout failed:", err);
            setError("Finalizing transaction failed. Check database logs.");
            setProcessing(false);
        }
    };

    const updateItemPrice = async (productId: string, newPrice: number) => {
        const item = cart.find(i => i.id === productId);
        if (!item || !currentSale) return;
        try {
            const taxRate = item.product_categories?.taxes?.rate || item.tax_rate || 0;
            const { error: updateError } = await supabase
                .from("sale_items")
                .update({
                    unit_price: newPrice,
                    total_price: newPrice * item.quantity,
                    tax_amount: (newPrice * item.quantity) * (taxRate / 100)
                })
                .match({ sale_id: currentSale.id, product_id: productId });
            if (updateError) throw updateError;
            const newCart = cart.map(i => i.id === productId ? { ...i, price: newPrice } : i);
            setCart(newCart);
            syncCartWithDB(newCart, currentSale.id);
        } catch (err: any) {
            console.error("Update price error:", err);
            setError("Failed to update item price");
        }
    };

    return {
        products,
        openSales,
        customers,
        currentSale,
        cart,
        searchTerm,
        setSearchTerm,
        loading,
        processing,
        paymentMethod,
        setPaymentMethod,
        showSuccess,
        error,
        setError,
        fetchProducts,
        selectSale,
        createNewSale,
        updateSaleCustomer,
        addToCart,
        updateQuantity,
        updateItemPrice,
        removeFromCart,
        handleCheckout,
        fetchInitialData
    };
}
