"use client";

import { useState, useEffect } from "react";
import {
  Truck, Search, Plus, FileText, Hash, Calendar, DollarSign, Loader2, ArrowLeft,
  X, Box, CheckCircle2, PackagePlus, AlertCircle, CreditCard, ChevronRight
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
    if (!newPurchase.invoice_number || !newPurchase.supplier_name) return alert("Please fill invoice number and supplier name.");
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
  ).slice(0, 6);

  // ─── NEW PURCHASE VIEW ────────────────────────────────────────────────────────
  if (currentView === "new_purchase") {
    return (
      <div className="md:px-3 md:py-3 flex flex-col h-full gap-4 overflow-hidden md:bg-white rounded-[var(--sidebar-radius)] md:shadow-glass">
        <header className="px-5 py-5 border-b border-primary/5 glass shrink-0 shadow-glass z-20 rounded-[var(--sidebar-radius)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView("list")} className="p-2.5 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600 transition-all">
              <ArrowLeft size={18} strokeWidth={2} />
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase italic leading-none">Register Purchase</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Stock Intake & Supplier Invoice</p>
            </div>
          </div>
          <button
            disabled={submitting}
            onClick={handleCreatePurchase}
            className="h-10 px-6 bg-primary text-white rounded-[var(--ui-radius-md)] font-black flex items-center gap-2.5 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all text-[11px] uppercase tracking-widest italic disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} strokeWidth={2.5} />}
            Commit Purchase
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar grid grid-cols-1 xl:grid-cols-3 gap-5 min-h-0 pb-4">
          {/* Left: Invoice details + items */}
          <div className="xl:col-span-2 space-y-5">
            {/* Invoice Details */}
            <div className="bg-white rounded-[var(--ui-radius-xl)] p-6 shadow-sm border border-slate-200">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2 italic">
                <FileText size={14} /> Invoice Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Invoice No.</label>
                  <div className="relative">
                    <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      value={newPurchase.invoice_number}
                      onChange={e => setNewPurchase({...newPurchase, invoice_number: e.target.value})}
                      className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-[var(--ui-radius-md)] text-[12px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 italic uppercase tracking-widest"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Supplier Name</label>
                  <div className="relative">
                    <Truck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      value={newPurchase.supplier_name}
                      onChange={e => setNewPurchase({...newPurchase, supplier_name: e.target.value})}
                      className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-[var(--ui-radius-md)] text-[12px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Date Received</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      type="date"
                      value={newPurchase.invoice_date}
                      onChange={e => setNewPurchase({...newPurchase, invoice_date: e.target.value})}
                      className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-[var(--ui-radius-md)] text-[12px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-[var(--ui-radius-xl)] p-6 shadow-sm border border-slate-200">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2 italic">
                <PackagePlus size={14} /> Received Items
              </h2>
              <div className="relative mb-5">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  placeholder="Search product to add..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-[var(--ui-radius-md)] text-[12px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                />
                {productSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-[var(--ui-radius-lg)] shadow-2xl border border-slate-200 overflow-hidden z-20">
                    {filteredProducts.map(p => (
                      <button key={p.id} onClick={() => addProductToCart(p)} className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-50 text-left transition-colors border-b last:border-0 border-slate-100">
                        <div>
                          <div className="text-[12px] font-bold text-slate-800 uppercase italic">{p.name}</div>
                          <div className="text-[9px] font-black tracking-widest uppercase text-slate-400">SKU: {p.sku} | Stock: {p.stock}</div>
                        </div>
                        <Plus size={16} className="text-primary" />
                      </button>
                    ))}
                    {filteredProducts.length === 0 && <div className="p-4 text-[11px] font-bold text-center text-slate-400 italic">No matching products found.</div>}
                  </div>
                )}
              </div>

              {cartItems.length > 0 ? (
                <div className="space-y-2.5">
                  {/* Header row */}
                  <div className="grid grid-cols-12 gap-3 px-3 py-1">
                    <div className="col-span-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product</div>
                    <div className="col-span-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Qty</div>
                    <div className="col-span-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit Cost</div>
                    <div className="col-span-1 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Total</div>
                    <div className="col-span-1" />
                  </div>
                  {cartItems.map(item => (
                    <div key={item.product_id} className="grid grid-cols-12 gap-3 items-center p-3 bg-slate-50/80 rounded-[var(--ui-radius-md)] border border-slate-200/50 hover:border-primary/20 transition-colors">
                      <div className="col-span-4">
                        <div className="text-[12px] font-black text-slate-800 uppercase italic truncate">{item.name}</div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{item.sku}</div>
                      </div>
                      <div className="col-span-3">
                        <input type="number" min="1" value={item.quantity} onChange={e => updateCartItem(item.product_id, "quantity", e.target.value)} className="w-full h-8 text-center bg-white border border-slate-200 rounded-[var(--ui-radius-sm)] text-[12px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div className="col-span-3">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">$</span>
                          <input type="number" min="0" step="0.01" value={item.cost_price} onChange={e => updateCartItem(item.product_id, "cost_price", e.target.value)} className="w-full h-8 pl-5 pr-2 text-right bg-white border border-slate-200 rounded-[var(--ui-radius-sm)] text-[12px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                      </div>
                      <div className="col-span-1 text-right">
                        <div className="text-[12px] font-black italic text-slate-700">${item.total_cost.toFixed(2)}</div>
                      </div>
                      <div className="col-span-1 text-right">
                        <button onClick={() => removeCartItem(item.product_id)} className="w-7 h-7 flex items-center justify-center bg-rose-50 text-rose-400 rounded-md hover:bg-rose-500 hover:text-white transition-all">
                          <X size={13} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center flex flex-col items-center opacity-40">
                  <Box size={36} className="mb-3 text-slate-400" strokeWidth={1} />
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 italic">No items added yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary + Payment */}
          <div className="space-y-5">
            <div className="bg-slate-900 rounded-[var(--ui-radius-xl)] p-6 border border-slate-800">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 italic">Purchase Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-400">Total Items</span>
                  <span className="text-[13px] font-black text-white italic">{cartItems.reduce((sum, item) => sum + item.quantity, 0)} Units</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-400">Line Items</span>
                  <span className="text-[13px] font-black text-white italic">{cartItems.length} SKUs</span>
                </div>
                <div className="h-px bg-slate-700 my-3" />
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest italic">Total Cost</span>
                  <span className="text-2xl font-black italic text-primary tracking-tight">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[var(--ui-radius-xl)] p-6 shadow-sm border border-slate-200">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2 italic">
                <CreditCard size={14} /> Initial Payment
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Amount Paid</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input type="number" step="0.01" value={payment.amount} onChange={e => setPayment({...payment, amount: e.target.value})} className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-[var(--ui-radius-md)] text-[12px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Payment Method</label>
                  <select value={payment.method} onChange={e => setPayment({...payment, method: e.target.value})} className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-[var(--ui-radius-md)] text-[12px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                    <option value="cash">Cash</option>
                    <option value="transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {/* Balance Preview */}
                {parseFloat(payment.amount) > 0 && (
                  <div className={cn(
                    "p-3 rounded-[var(--ui-radius-md)] border text-center",
                    cartTotal - parseFloat(payment.amount) <= 0
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                      : "bg-amber-50 border-amber-200 text-amber-600"
                  )}>
                    <div className="text-[9px] font-black uppercase tracking-widest mb-0.5">Remaining Balance</div>
                    <div className="text-[18px] font-black italic">${Math.max(0, cartTotal - parseFloat(payment.amount)).toFixed(2)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── VIEW PURCHASE ────────────────────────────────────────────────────────────
  if (currentView === "view_purchase" && selectedPurchase) {
    return (
      <div className="md:px-3 md:py-3 flex flex-col h-full gap-4 overflow-hidden md:bg-white rounded-[var(--sidebar-radius)] md:shadow-glass">
        <header className="px-5 py-5 border-b border-primary/5 glass shrink-0 shadow-glass z-20 rounded-[var(--sidebar-radius)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView("list")} className="p-2.5 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600 transition-all">
              <ArrowLeft size={18} strokeWidth={2} />
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase italic leading-none">Purchase Invoice</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: {selectedPurchase.invoice_number}</p>
            </div>
          </div>
          <div className={cn(
            "px-4 py-1.5 rounded-md font-black text-[10px] uppercase tracking-widest border",
            selectedPurchase.payment_status === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
            selectedPurchase.payment_status === "partial" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-rose-50 text-rose-600 border-rose-200"
          )}>
            {selectedPurchase.payment_status}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar grid grid-cols-1 xl:grid-cols-3 gap-5 min-h-0 pb-4">
          <div className="xl:col-span-2 space-y-5">
            {/* Invoice Meta */}
            <div className="bg-white rounded-[var(--ui-radius-xl)] p-6 shadow-sm border border-slate-200 grid grid-cols-3 gap-5">
              <div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Supplier</div>
                <div className="text-[14px] font-black text-slate-800 uppercase italic">{selectedPurchase.supplier_name}</div>
              </div>
              <div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Received Date</div>
                <div className="text-[13px] font-bold text-slate-700">{new Date(selectedPurchase.invoice_date).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Logged At</div>
                <div className="text-[12px] font-bold text-slate-600">{new Date(selectedPurchase.created_at).toLocaleString()}</div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-[var(--ui-radius-xl)] p-6 shadow-sm border border-slate-200">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 italic">Items Brought In</h2>
              <div className="space-y-2.5">
                {selectedPurchase.purchase_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50/80 rounded-[var(--ui-radius-md)] border border-slate-100">
                    <div>
                      <div className="text-[13px] font-black text-slate-800 uppercase italic">{item.products?.name}</div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{item.products?.sku} • {item.quantity} Units @ ${Number(item.cost_price).toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[15px] font-black italic text-slate-800">${Number(item.total_cost).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: financials */}
          <div className="space-y-5">
            {/* Summary Card */}
            <div className="bg-white rounded-[var(--ui-radius-xl)] p-6 shadow-sm border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 italic">Total Amount</span>
                <span className="text-[14px] font-black italic text-slate-800">${Number(selectedPurchase.total_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-emerald-600 italic">Paid So Far</span>
                <span className="text-[14px] font-black italic text-emerald-600">${(Number(selectedPurchase.total_amount) - Number(selectedPurchase.balance_due)).toFixed(2)}</span>
              </div>
              <div className="h-px bg-slate-100 my-1" />
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-black text-rose-500 uppercase tracking-widest italic">Due Balance</span>
                <span className="text-2xl font-black italic text-rose-500">${Number(selectedPurchase.balance_due).toFixed(2)}</span>
              </div>
            </div>

            {/* Add Payment */}
            {Number(selectedPurchase.balance_due) > 0 && (
              <div className="bg-primary border border-primary/20 rounded-[var(--ui-radius-xl)] p-6 space-y-4">
                <h3 className="text-[10px] text-white font-bold uppercase tracking-widest text-slate-400">Add Payment</h3>
                <input
                  type="number" step="0.01" value={newPaymentAmount}
                  onChange={e => setNewPaymentAmount(e.target.value)}
                  placeholder="Amount..."
                  className="w-full h-9 px-3 bg-white border border-slate-200 text-slate-800 rounded-[var(--ui-radius-md)] text-[12px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-600"
                />
                <select
                  value={newPaymentMethod}
                  onChange={e => setNewPaymentMethod(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-slate-200 text-slate-800 rounded-[var(--ui-radius-md)] text-[12px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                >
                  <option value="cash">Cash</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                </select>
                <button
                  disabled={submitting}
                  onClick={handleAddPayment}
                  className="w-full h-10 text-white font-bold bg-slate-700 hover:bg-slate-800 rounded-[var(--ui-radius-md)] text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : <DollarSign size={15} />}
                  Record Payment
                </button>
              </div>
            )}

            {/* Payment History */}
            <div className="bg-white rounded-[var(--ui-radius-xl)] p-6 shadow-sm border border-slate-200">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 italic">Payment History</h3>
              <div className="space-y-2.5">
                {selectedPurchase.purchases_payments?.length === 0 && (
                  <span className="text-[11px] font-bold text-slate-400 italic">No payments yet.</span>
                )}
                {selectedPurchase.purchases_payments?.map((pay: any) => (
                  <div key={pay.id} className="flex justify-between items-center p-3 bg-slate-50/80 rounded-[var(--ui-radius-md)] border border-slate-100">
                    <div>
                      <div className="text-[11px] font-bold text-slate-700">{new Date(pay.payment_date).toLocaleDateString()}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{pay.payment_method}</div>
                    </div>
                    <div className="text-[14px] font-black italic text-emerald-600">${Number(pay.amount).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── LIST VIEW ────────────────────────────────────────────────────────────────
  const groupedPurchases = filteredPurchases.reduce((acc: Record<string, any[]>, purchase: any) => {
    const date = new Date(purchase.invoice_date);
    const monthYear = date.toLocaleString("default", { month: "long", year: "numeric" });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(purchase);
    return acc;
  }, {});

  return (
    <div className="md:px-3 md:py-3 flex flex-col h-full gap-4 overflow-hidden md:bg-white rounded-[var(--sidebar-radius)] md:shadow-glass">
      <header className="px-5 py-5 border-b border-primary/5 glass shrink-0 shadow-glass z-20 rounded-[var(--sidebar-radius)] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-[var(--ui-radius-lg)] shadow-inner">
              <Truck size={18} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase italic leading-none">Purchases Ledger</h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 italic ml-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Supplier Invoices & Intake • {filteredPurchases.length} Records
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full xl:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={14} />
            <input
              type="text"
              placeholder="Filter by invoice or supplier..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-9 pr-8 bg-slate-50 border border-slate-200 rounded-[var(--ui-radius-md)] text-[11px] font-bold italic tracking-widest text-slate-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                <X size={12} />
              </button>
            )}
          </div>
          <button
            onClick={openNewPurchase}
            className="h-8 px-3 bg-primary text-white rounded-[var(--ui-radius-md)] font-black flex items-center gap-2.5 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all text-[11px] uppercase tracking-widest shrink-0"
          >
            <Plus size={12} strokeWidth={2.5} />
            New
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 custom-scrollbar flex flex-col gap-7 pb-6 min-h-0">
        {pageError && (
          <div className="p-4 bg-rose-50 text-rose-600 rounded-[var(--ui-radius-lg)] border border-rose-100 flex items-center gap-4 shrink-0">
            <AlertCircle size={18} strokeWidth={2} />
            <div className="flex-1">
              <p className="text-[11px] font-black uppercase tracking-widest">System Error</p>
              <p className="text-[10px] font-bold opacity-80 mt-0.5">{pageError}</p>
            </div>
            <button onClick={fetchInitialData} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-rose-600 text-white rounded-md">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 rounded-[var(--ui-radius-xl)] bg-slate-100/60 animate-pulse border border-slate-200/50" />
            ))}
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30">
            <Truck size={64} strokeWidth={1} className="mb-4 text-slate-500" />
            <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-600 italic">No Purchases Logged</h3>
          </div>
        ) : (
          Object.entries(groupedPurchases).map(([monthYear, monthPurchases]) => (
            <div key={monthYear} className="space-y-3">
              {/* Month/Year heading */}
              <div className="flex items-center gap-3">
                <h2 className="text-[12px] font-black text-slate-700 uppercase italic tracking-[0.2em] flex items-center gap-2 bg-slate-100/80 px-4 py-2 rounded-lg border border-slate-200/80">
                  <Calendar size={13} className="text-primary" />
                  {monthYear}
                </h2>
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{monthPurchases.length} Invoice{monthPurchases.length !== 1 ? "s" : ""}</span>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {monthPurchases.map((purchase: any) => (
                  <div key={purchase.id} className="group bg-white rounded-[var(--ui-radius-xl)] p-5 border border-slate-200 hover:border-primary/20 hover:shadow-md transition-all duration-300 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <h3 className="text-[14px] font-black text-slate-800 uppercase italic tracking-tight truncate">{purchase.supplier_name}</h3>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black rounded-md uppercase tracking-widest border border-slate-200">
                            {purchase.invoice_number}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 text-[8px] font-black rounded-md uppercase tracking-widest border",
                            purchase.payment_status === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                            purchase.payment_status === "partial" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-rose-50 text-rose-600 border-rose-200"
                          )}>
                            {purchase.payment_status}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => { setSelectedPurchase(purchase); setCurrentView("view_purchase"); }}
                        className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-lg hover:bg-primary/10 hover:border-primary/20 text-slate-400 hover:text-primary transition-all ml-2 shrink-0"
                      >
                        <ChevronRight size={15} strokeWidth={2.5} />
                      </button>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-50/70 rounded-[var(--ui-radius-md)] border border-slate-100">
                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block mb-0.5">Date</span>
                        <span className="text-[11px] font-black italic text-slate-700">{new Date(purchase.invoice_date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block mb-0.5">Units</span>
                        <span className="text-[11px] font-black italic text-slate-700">{purchase.purchase_items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
                      <div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Total Value</div>
                        <div className="text-[16px] font-black italic text-slate-800 leading-none">${Number(purchase.total_amount).toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[8px] font-black uppercase tracking-widest text-rose-400 mb-0.5">Balance</div>
                        <div className="text-[13px] font-black italic text-rose-500 leading-none">${Number(purchase.balance_due).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
