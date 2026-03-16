import { useState, useEffect, useCallback } from "react";
import { posService } from "@/services/posService";

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
            const { data, error } = await posService.fetchProducts(query);
            if (error) throw error;
            setProducts(data || []);
        } catch (err: any) {
            console.error("Error fetching products:", err);
            setError("Failed to fetch products");
        }
    }, []);

    const fetchOpenSales = useCallback(async () => {
        try {
            const { data, error } = await posService.fetchOpenSales();
            if (error) throw error;
            setOpenSales(data || []);
        } catch (err: any) {
            console.error("Error fetching open sales:", err);
            setError("Failed to fetch open tickets");
        }
    }, []);

    const fetchCustomers = useCallback(async () => {
        try {
            const { data, error } = await posService.fetchCustomers();
            if (error) throw error;
            setCustomers(data || []);
        } catch (err) {
            console.error("Error fetching customers:", err);
        }
    }, []);

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const [productsResult, customersResult, salesResult] = await Promise.all([
                posService.fetchProducts(""),
                posService.fetchCustomers(),
                posService.fetchOpenSales()
            ]);
            
            if (productsResult.data) setProducts(productsResult.data || []);
            if (customersResult.data) setCustomers(customersResult.data || []);
            
            const sales = salesResult.data || [];
            setOpenSales(sales);
            
            if (sales.length > 0) {
                const sale = sales[0];
                setCurrentSale(sale);
                const { data: items } = await posService.fetchSaleItems(sale.id);
                if (items) {
                    const formattedCart = items.map(item => ({
                        ...item.products,
                        quantity: item.quantity,
                        sale_item_id: item.id,
                        tax_rate: item.products.product_categories?.taxes?.rate || 0
                    })).filter(item => !!item.id);
                    setCart(formattedCart);
                } else {
                    setCart([]);
                }
            } else {
                const DEFAULT_CUSTOMER_ID = '22222222-2222-2222-2222-222222222222';
                const { data: userData } = await posService.getAdminUser();
                const { data: newSale } = await posService.createSale(DEFAULT_CUSTOMER_ID, userData?.id);
                if (newSale) {
                    setOpenSales([newSale]);
                    setCurrentSale(newSale);
                    setCart([]);
                }
            }
        } catch (err: any) {
            console.error("Error initializing POS:", err);
            setError("Failed to initialize POS");
        }
        setLoading(false);
    }, []);


    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const selectSale = async (sale: any) => {
        try {
            setError(null);
            setCurrentSale(sale);
            const { data: items, error: itemsError } = await posService.fetchSaleItems(sale.id);
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
            const { data: userData } = await posService.getAdminUser();
            const { data: newSale, error: insertError } = await posService.createSale(DEFAULT_CUSTOMER_ID, userData?.id);
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
            const { error: updateError } = await posService.updateSaleCustomer(currentSale.id, customerId);
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

        await posService.updateSaleTotal(saleId, totalAmount);
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
                const { error: updateError } = await posService.updateSaleItem(currentSale.id, product.id, {
                    quantity: newQty,
                    total_price: product.price * newQty,
                    tax_amount: (product.price * newQty) * (taxRate / 100)
                });
                if (updateError) throw updateError;
                const newCart = cart.map(item => item.id === product.id ? { ...item, quantity: newQty } : item);
                setCart(newCart);
                syncCartWithDB(newCart, currentSale.id);
            } else {
                const { data: newItem, error: insertError } = await posService.insertSaleItem(
                    currentSale.id,
                    product.id,
                    1,
                    product.price,
                    product.price,
                    product.price * (taxRate / 100)
                );
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
            const { error: updateError } = await posService.updateSaleItem(currentSale.id, productId, {
                quantity: newQty,
                total_price: item.price * newQty,
                tax_amount: (item.price * newQty) * (taxRate / 100)
            });
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
            const { error: deleteError } = await posService.deleteSaleItem(currentSale.id, productId);
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
            const { error: rpcError } = await posService.finalizeSale(currentSale.id, paymentMethod);
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
            const { error: updateError } = await posService.updateSaleItem(currentSale.id, productId, {
                unit_price: newPrice,
                total_price: newPrice * item.quantity,
                tax_amount: (newPrice * item.quantity) * (taxRate / 100)
            });
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
