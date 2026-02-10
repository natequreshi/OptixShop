"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, CreditCard,
  Banknote, Smartphone, User, X, Receipt, Package
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
  const [manualSubtotal, setManualSubtotal] = useState<number | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [cashDenominations, setCashDenominations] = useState<{[key: number]: number}>({});  const [transactionId, setTransactionId] = useState("");  const [taxEnabled, setTaxEnabled] = useState(true);
  const [printTemplate, setPrintTemplate] = useState<"80mm" | "modern" | "classic" | "minimal">("80mm");
  const [currency, setCurrency] = useState("Rs.");
  const [showDenominations, setShowDenominations] = useState(true);
  const [storeName, setStoreName] = useState('OPTICS SHOP');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeCity, setStoreCity] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
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
    fetch("/api/settings").then(r => r.json()).then((settings: Record<string, string>) => {
      setTaxEnabled(settings['tax_enabled'] === 'true');
      setPrintTemplate((settings['print_template'] as any) || '80mm');
      setCurrency(settings['currency'] || 'Rs.');
      setShowDenominations(settings['pos_show_denominations'] !== 'false');
      setStoreName(settings['store_name'] || 'OPTICS SHOP');
      setStoreAddress(settings['store_address'] || '');
      setStorePhone(settings['store_phone'] || '');
      setStoreCity(settings['store_city'] || '');
      setLogoUrl(settings['logo_url'] || '');
    });
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

  const subtotal = manualSubtotal !== null ? manualSubtotal : cart.reduce((s, i) => s + i.sellingPrice * i.qty, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const afterDiscount = subtotal - discountAmount;
  const itemDiscounts = cart.reduce((s, i) => s + i.discount * i.qty, 0);
  const taxableAmount = afterDiscount - itemDiscounts;
  const taxAmount = taxEnabled ? cart.reduce((s, i) => {
    const lineTotal = (i.sellingPrice - i.discount) * i.qty;
    const lineAfterGlobalDiscount = lineTotal * (1 - discountPercent / 100);
    return s + lineAfterGlobalDiscount * (i.taxRate / 100);
  }, 0) : 0;
  const grandTotal = taxableAmount + taxAmount;
  const denominationsTotal = Object.entries(cashDenominations).reduce((sum, [denom, count]) => sum + (Number(denom) * count), 0);
  const change = amountTendered ? Math.max(0, +amountTendered - grandTotal) : denominationsTotal > 0 ? Math.max(0, denominationsTotal - grandTotal) : 0;

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
          transactionId: transactionId || undefined,
          amountTendered: +amountTendered || denominationsTotal || grandTotal,
          discountPercent,
          taxEnabled: taxEnabled,
          items: cart.map(i => ({
            productId: i.id,
            quantity: i.qty,
            unitPrice: i.sellingPrice,
            discount: i.discount,
            taxRate: taxEnabled ? i.taxRate : 0,
          })),
        }),
      });
      if (res.ok) {
        const saleData = await res.json();
        toast.success("Sale completed!");
        
        // Print thermal receipt
        printThermalReceipt(saleData);
        
        setCart([]); setSelectedCustomer(null);
        setShowPayment(false); setAmountTendered("");
        setManualSubtotal(null); setDiscountPercent(0);
        setCashDenominations({});
        setTransactionId("");
        router.refresh();
      } else {
        toast.error("Failed to complete sale");
      }
    } catch (err) {
      toast.error("Error completing sale");
    }
    setLoading(false);
  }

  function printThermalReceipt(saleData: any) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt</title>
        <style>
          @media print {
            @page { margin: 0; size: 80mm auto; }
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            padding: 10mm 5mm;
            font-size: 11px;
            line-height: 1.4;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .large { font-size: 14px; }
          .separator { border-top: 1px dashed #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin: 3px 0; }
          .items { margin: 10px 0; }
          .item { display: flex; justify-content: space-between; margin: 3px 0; }
          .total-row { font-size: 13px; font-weight: bold; margin-top: 8px; }
        </style>
      </head>
      <body>
        ${logoUrl ? `<div class="center"><img src="${logoUrl}" alt="" style="max-height:35px;margin:0 auto 4px;"></div>` : ''}
        <div class="center large bold">${storeName}</div>
        ${storeAddress ? `<div class="center" style="font-size:10px">${storeAddress}${storeCity ? ', ' + storeCity : ''}</div>` : ''}
        ${storePhone ? `<div class="center" style="font-size:10px">${storePhone}</div>` : ''}
        <div class="separator"></div>
        
        <div class="row">
          <span>Receipt #:</span>
          <span class="bold">${saleData.invoiceNo || 'N/A'}</span>
        </div>
        <div class="row">
          <span>Date:</span>
          <span>${new Date().toLocaleString()}</span>
        </div>
        ${selectedCustomer ? `
        <div class="row">
          <span>Customer:</span>
          <span>${selectedCustomer.firstName} ${selectedCustomer.lastName}</span>
        </div>
        ` : ''}
        
        <div class="separator"></div>
        
        <div class="items">
          ${cart.map(item => `
            <div class="item">
              <span>${item.name} x${item.qty}</span>
              <span>${formatCurrency(item.sellingPrice * item.qty)}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="separator"></div>
        
        <div class="row">
          <span>Subtotal:</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
        ${discountAmount > 0 ? `
        <div class="row">
          <span>Discount (${discountPercent}%):</span>
          <span>-${formatCurrency(discountAmount)}</span>
        </div>
        ` : ''}
        ${taxEnabled ? `
        <div class="row">
          <span>Tax:</span>
          <span>${formatCurrency(taxAmount)}</span>
        </div>
        ` : ''}
        
        <div class="separator"></div>
        
        <div class="row total-row">
          <span>TOTAL:</span>
          <span>${formatCurrency(grandTotal)}</span>
        </div>
        
        <div class="row">
          <span>Payment Method:</span>
          <span class="bold">${paymentMethod.toUpperCase().replace('_', ' ')}</span>
        </div>
        ${transactionId ? `
        <div class="row">
          <span>Transaction ID:</span>
          <span class="bold">${transactionId}</span>
        </div>
        ` : ''}
        ${paymentMethod === 'cash' && (denominationsTotal > 0 || parseFloat(amountTendered) > 0) ? `
        <div class="row">
          <span>Cash Tendered:</span>
          <span>${formatCurrency(denominationsTotal > 0 ? denominationsTotal : parseFloat(amountTendered))}</span>
        </div>
        ${change > 0 ? `
        <div class="row">
          <span>Change:</span>
          <span>${formatCurrency(change)}</span>
        </div>
        ` : ''}
        ` : ''}
        
        <div class="separator"></div>
        
        <div class="center">Thank you for shopping!</div>
        <div class="center">Please visit again</div>
        
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 500);
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-auto lg:h-[calc(100vh-8rem)] w-full overflow-x-hidden">
      {/* Products Panel */}
      <div className="w-full lg:flex-1 flex flex-col min-h-[400px] lg:min-h-0">
        <div className="mb-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input ref={searchRef} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products by name or SKU..." className="input pl-10 text-base" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3">
          {filteredProducts.slice(0, 50).map((p) => (
            <button key={p.id} onClick={() => addToCart(p)}
              className="card p-0 text-left hover:border-primary-300 hover:shadow-md transition group overflow-hidden flex flex-col">
              <div className="w-full aspect-square bg-gray-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <Package size={32} className="text-gray-300" />
                )}
              </div>
              <div className="p-2 flex-1 flex flex-col justify-between">
                <div className="mb-1">
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-primary-700">{p.name}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">SKU: {p.sku}</p>
                </div>
                <div className="space-y-1 border-t border-gray-100 dark:border-gray-700 pt-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">Price</span>
                    <span className="text-xs font-bold text-primary-600">{formatCurrency(p.sellingPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">Stock</span>
                    <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", p.stock <= 0 ? "bg-red-50 text-red-600" : p.stock <= 10 ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700")}>{p.stock}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="w-full text-center py-12 text-gray-400">No products found</div>
          )}
          {products.length > 0 && filteredProducts.length === 0 && search && (
            <div className="w-full text-center py-6 text-gray-500 text-sm">No products match "{search}"</div>
          )}
          {products.length === 0 && (
            <div className="w-full text-center py-12 text-gray-400">Loading products...</div>
          )}
          </div>
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col card order-first lg:order-last shrink-0">
        {/* Customer Selection */}
        <div className="p-3 sm:p-4 border-b border-gray-100">
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
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Subtotal</span>
            <input 
              type="number" 
              value={manualSubtotal !== null ? manualSubtotal : subtotal.toFixed(2)} 
              onChange={(e) => setManualSubtotal(e.target.value === '' ? null : parseFloat(e.target.value))}
              className="input text-sm w-24 text-right p-1" 
              step="0.01"
            />
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Discount %</span>
            <input 
              type="number" 
              value={discountPercent} 
              onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
              className="input text-sm w-24 text-right p-1" 
              step="0.1"
              placeholder="0"
            />
          </div>
          {discountAmount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Discount Amount</span><span className="text-red-600">-{formatCurrency(discountAmount)}</span></div>}
          
          {taxEnabled && <div className="flex justify-between text-sm"><span className="text-gray-500">Tax</span><span>{formatCurrency(taxAmount)}</span></div>}
          <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-2">
            <span>Total</span><span className="text-primary-600">Rs. {grandTotal.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
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
                {[{ m: "cash", icon: Banknote, label: "Cash" }, { m: "card", icon: CreditCard, label: "Card" }, { m: "bank_transfer", icon: Smartphone, label: "Bank Transfer" }].map(({ m, icon: Icon, label }) => (
                  <button key={m} onClick={() => setPaymentMethod(m)}
                    className={cn("flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition",
                      paymentMethod === m ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}><Icon size={16} /> {label}</button>
                ))}
              </div>
              {paymentMethod === "cash" && (
                <div className="space-y-3">
                  {showDenominations && (
                    <div>
                      <label className="label text-xs">Cash Denominations</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[2000, 1000, 500, 200, 100, 50, 20, 10].map(denom => (
                          <div key={denom} className="flex flex-col items-center">
                            <span className="text-xs text-gray-500 mb-1">{currency}{denom}</span>
                            <input
                              type="number"
                              min="0"
                              value={cashDenominations[denom] || 0}
                              onChange={(e) => setCashDenominations({...cashDenominations, [denom]: parseInt(e.target.value) || 0})}
                              className="input text-xs text-center w-full p-1"
                            />
                          </div>
                        ))}
                      </div>
                      {denominationsTotal > 0 && (
                        <p className="text-sm text-blue-600 mt-2">Total Cash: {currency} {denominationsTotal.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="label text-xs">Amount Tendered</label>
                    <input type="number" value={amountTendered} onChange={(e) => setAmountTendered(e.target.value)} className="input" placeholder={grandTotal.toFixed(0)} />
                    {change > 0 && <p className="text-sm text-green-600 mt-1">Change: {currency} {change.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>}
                  </div>
                </div>
              )}
              <div>
                <label className="label text-xs">Transaction ID (Optional)</label>
                <input 
                  type="text" 
                  value={transactionId} 
                  onChange={(e) => setTransactionId(e.target.value)} 
                  className="input text-sm" 
                  placeholder="Enter transaction reference" 
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowPayment(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={completeSale} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
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
