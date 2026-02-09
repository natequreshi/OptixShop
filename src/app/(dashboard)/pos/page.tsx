"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, CreditCard,
  Banknote, Smartphone, User, X, Receipt, Package, Calculator, ListTodo
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Product {
  id: string; sku: string; name: string; sellingPrice: number;
  taxRate: number; productType: string; stock: number; imageUrl: string | null;
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
  const [showCalculator, setShowCalculator] = useState(false);
  const [showTodoList, setShowTodoList] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [todos, setTodos] = useState<{id: number; text: string; done: boolean}[]>([]);
  const [todoInput, setTodoInput] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then((data) => {
      setProducts(data.map((p: any) => ({
        id: p.id, sku: p.sku, name: p.name, sellingPrice: p.sellingPrice,
        taxRate: p.taxRate, productType: p.productType,
        stock: p.inventory?.quantity ?? 0,
        imageUrl: p.imageUrl || null,
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
    <div className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
      {/* Header with Calculator and Todo */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Point of Sale</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCalculator(!showCalculator)} className="btn-secondary flex items-center gap-2" title="Calculator">
            <Calculator size={18} /> Calculator
          </button>
          <button onClick={() => setShowTodoList(!showTodoList)} className="btn-secondary flex items-center gap-2" title="Todo List">
            <ListTodo size={18} /> Todo List
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
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
              className="card p-0 text-left hover:border-primary-300 hover:shadow-md transition group overflow-hidden flex flex-col h-fit"
            >
              <div className="w-full aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <Package size={32} className="text-gray-300" />
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-primary-700">{p.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">SKU: {p.sku}</p>
                </div>
                <div className="space-y-1.5 border-t border-gray-100 dark:border-gray-700 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Price</span>
                    <span className="text-sm font-bold text-primary-600">{formatCurrency(p.sellingPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Stock</span>
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", p.stock <= 0 ? "bg-red-50 text-red-600" : p.stock <= 10 ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700")}>{p.stock} units</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">No products found</div>
          )}
          {products.length > 0 && filteredProducts.length === 0 && search && (
            <div className="col-span-full text-center py-6 text-gray-500 text-sm">No products match "{search}"</div>
          )}
          {products.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">Loading products...</div>
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

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowCalculator(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-80 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Calculator</h3>
              <button onClick={() => setShowCalculator(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4 text-right">
              <div className="text-2xl font-mono font-bold dark:text-white">{calcDisplay}</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map((btn) => (
                <button key={btn} onClick={() => {
                  if (btn === '=') {
                    try { setCalcDisplay(eval(calcDisplay).toString()); } catch { setCalcDisplay('Error'); }
                  } else if (calcDisplay === '0' || calcDisplay === 'Error') {
                    setCalcDisplay(btn);
                  } else {
                    setCalcDisplay(calcDisplay + btn);
                  }
                }} className={cn("py-3 rounded-lg font-medium transition", 
                  btn === '=' ? "bg-primary-600 text-white hover:bg-primary-700" : 
                  "bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 dark:text-white"
                )}>{btn}</button>
              ))}
              <button onClick={() => setCalcDisplay('0')} className="col-span-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium">Clear</button>
            </div>
          </div>
        </div>
      )}

      {/* Todo List Modal */}
      {showTodoList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowTodoList(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-96 max-h-[600px] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold dark:text-white">Todo List</h3>
              <button onClick={() => setShowTodoList(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex gap-2">
                <input value={todoInput} onChange={(e) => setTodoInput(e.target.value)} onKeyDown={(e) => {
                  if (e.key === 'Enter' && todoInput.trim()) {
                    setTodos([...todos, { id: Date.now(), text: todoInput.trim(), done: false }]);
                    setTodoInput('');
                  }
                }} placeholder="Add new todo..." className="input flex-1" />
                <button onClick={() => {
                  if (todoInput.trim()) {
                    setTodos([...todos, { id: Date.now(), text: todoInput.trim(), done: false }]);
                    setTodoInput('');
                  }
                }} className="btn-primary"><Plus size={18} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {todos.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No todos yet. Add one above!</p>
              ) : (
                todos.map((todo) => (
                  <div key={todo.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group">
                    <input type="checkbox" checked={todo.done} onChange={() => setTodos(todos.map(t => t.id === todo.id ? {...t, done: !t.done} : t))}
                      className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                    <span className={cn("flex-1 text-sm dark:text-gray-200", todo.done && "line-through text-gray-400")}>{todo.text}</span>
                    <button onClick={() => setTodos(todos.filter(t => t.id !== todo.id))}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition"><Trash2 size={14} /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
