"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, CreditCard,
  Banknote, Smartphone, User, X, Receipt
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Product {
  id: string; sku: string; name: string; sellingPrice: number;
  taxRate: number; productType: string; stock: number;
}

interface CartItem extends Product {
  qty: number;
  discount: number;
}

interface Customer {
  id: string; customerNo: string; firstName: string; lastName: string;
  phone: string; loyaltyPoints: number;
}

export default function POSPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [custSearch, setCustSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountTendered, setAmountTendered] = useState("");
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then((data) => {
      setProducts(data.map((p: any) => ({
        id: p.id, sku: p.sku, name: p.name, sellingPrice: p.sellingPrice,
        taxRate: p.taxRate, productType: p.productType,
        stock: p.inventory?.quantity ?? 0,
      })));
    });
    fetch("/api/customers").then(r => r.json()).then(setCustomers);
    searchRef.current?.focus();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(custSearch.toLowerCase()) ||
    c.phone?.includes(custSearch)
  );

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1, discount: 0 }];
    });
  }

  function updateQty(id: string, delta: number) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  }

  function removeItem(id: string) {
    setCart(prev => prev.filter(i => i.id !== id));
  }

  const subtotal = cart.reduce((s, i) => s + i.sellingPrice * i.qty, 0);
  const totalDiscount = cart.reduce((s, i) => s + i.discount * i.qty, 0);
  const taxableAmount = subtotal - totalDiscount;
  const taxAmount = cart.reduce((s, i) => {
    const lineTotal = (i.sellingPrice - i.discount) * i.qty;
    return s + lineTotal * (i.taxRate / 100);
  }, 0);
  const grandTotal = taxableAmount + taxAmount;
  const change = amountTendered ? Math.max(0, +amountTendered - grandTotal) : 0;

  async function completeSale() {
    if (cart.length === 0) return toast.error("Cart is empty");
    setLoading(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer?.id || null,
          paymentMethod,
          amountTendered: +amountTendered || grandTotal,
          items: cart.map(i => ({
            productId: i.id,
            quantity: i.qty,
            unitPrice: i.sellingPrice,
            discount: i.discount,
            taxRate: i.taxRate,
          })),
        }),
      });
      if (res.ok) {
        toast.success("Sale completed!");
        setCart([]); setSelectedCustomer(null);
        setShowPayment(false); setAmountTendered("");
      } else {
        toast.error("Sale failed");
      }
    } catch {
      toast.error("Error processing sale");
    }
    setLoading(false);
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input ref={searchRef} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products by name or SKU..." className="input pl-10 text-base" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
          {filteredProducts.slice(0, 50).map((p) => (
            <button key={p.id} onClick={() => addToCart(p)}
              className="card p-3 text-left hover:border-primary-300 hover:shadow-md transition group"
            >
              <p className="text-sm font-medium text-gray-800 truncate group-hover:text-primary-700">{p.name}</p>
              <p className="text-xs text-gray-400 font-mono">{p.sku}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-bold text-primary-600">{formatCurrency(p.sellingPrice)}</span>
                <span className={cn("text-xs", p.stock <= 0 ? "text-red-500" : "text-gray-400")}>Stk: {p.stock}</span>
              </div>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">No products found</div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-[380px] flex flex-col card">
        {/* Customer Selection */}
        <div className="p-4 border-b border-gray-100">
          {selectedCustomer ? (
            <div className="flex items-center justify-between bg-primary-50 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <User size={16} className="text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-primary-700">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                  <p className="text-xs text-primary-500">{selectedCustomer.phone}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-primary-400 hover:text-primary-600"><X size={16} /></button>
            </div>
          ) : (
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={custSearch} onChange={(e) => setCustSearch(e.target.value)} placeholder="Search customer..." className="input pl-9 text-sm" />
              {custSearch && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto z-10">
                  {filteredCustomers.slice(0, 5).map(c => (
                    <button key={c.id} onClick={() => { setSelectedCustomer(c); setCustSearch(""); }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    >
                      {c.firstName} {c.lastName} <span className="text-gray-400">· {c.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{formatCurrency(item.sellingPrice)} × {item.qty}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200"><Minus size={12} /></button>
                  <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200"><Plus size={12} /></button>
                </div>
                <p className="text-sm font-semibold w-20 text-right">{formatCurrency(item.sellingPrice * item.qty)}</p>
                <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          {totalDiscount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Discount</span><span className="text-red-600">-{formatCurrency(totalDiscount)}</span></div>}
          <div className="flex justify-between text-sm"><span className="text-gray-500">Tax</span><span>{formatCurrency(taxAmount)}</span></div>
          <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-2">
            <span>Total</span><span className="text-primary-600">{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {/* Pay Button */}
        <div className="p-4 border-t border-gray-100">
          {!showPayment ? (
            <button onClick={() => setShowPayment(true)} disabled={cart.length === 0}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
            >
              <CreditCard size={20} /> Pay {formatCurrency(grandTotal)}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                {[{ m: "cash", icon: Banknote, label: "Cash" }, { m: "card", icon: CreditCard, label: "Card" }, { m: "upi", icon: Smartphone, label: "UPI" }].map(({ m, icon: Icon, label }) => (
                  <button key={m} onClick={() => setPaymentMethod(m)}
                    className={cn("flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition",
                      paymentMethod === m ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}><Icon size={16} /> {label}</button>
                ))}
              </div>
              {paymentMethod === "cash" && (
                <div>
                  <label className="label text-xs">Amount Tendered</label>
                  <input type="number" value={amountTendered} onChange={(e) => setAmountTendered(e.target.value)} className="input" placeholder={grandTotal.toFixed(2)} />
                  {change > 0 && <p className="text-sm text-green-600 mt-1">Change: {formatCurrency(change)}</p>}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => setShowPayment(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={completeSale} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Receipt size={16} /> {loading ? "Processing..." : "Complete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
