"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, CreditCard,
  Banknote, Smartphone, User, X, Receipt, Package, Calendar, Clock
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Product {
  id: string; sku: string; name: string; sellingPrice: number;
  taxRate: number; productType: string; stock: number; imageUrl: string | null;
  categoryId?: string | null; brandId?: string | null;
  colorVariants?: {color: string; image: string; sku: string}[];
  colors?: string | null;
}

interface CartItem extends Product {
  qty: number;
  discount: number;
  cartItemId: string;
  selectedVariantIdx?: number;
  selectedVariantSku?: string;
}

interface Customer {
  id: string; customerNo: string; firstName: string; lastName: string;
  phone: string; loyaltyPoints: number;
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product, variantIdx?: number) => void }) {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const hasVariants = product.colorVariants && product.colorVariants.length > 0;
  const displayImage = hasVariants && product.colorVariants![selectedVariantIdx]?.image 
    ? product.colorVariants![selectedVariantIdx].image 
    : product.imageUrl;

  return (
    <button onClick={() => onAddToCart(product, selectedVariantIdx)}
      className="card p-0 text-left hover:border-primary-300 hover:shadow-md transition group overflow-hidden flex flex-col">
      <div className="w-full aspect-square bg-gray-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        {displayImage ? (
          <img src={displayImage} alt={product.name} className="w-full h-full object-contain" />
        ) : (
          <Package size={32} className="text-gray-300" />
        )}
      </div>
      <div className="p-2 flex-1 flex flex-col justify-between">
        <div className="mb-1">
          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-primary-700">{product.name}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">SKU: {product.sku}</p>
          
          {/* Color Variants/Colors Display */}
          {hasVariants ? (
            <div className="flex gap-1.5 mt-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
              {product.colorVariants!.map((variant, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVariantIdx(idx);
                  }}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 overflow-hidden transition-all hover:scale-110",
                    selectedVariantIdx === idx ? "border-primary-500 ring-2 ring-primary-200" : "border-gray-300"
                  )}
                  title={variant.color}
                >
                  {variant.image ? (
                    <img src={variant.image} alt={variant.color} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-gray-600">{variant.color.substring(0, 2)}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : product.colors ? (
            <div className="flex gap-1 mt-1 flex-wrap">
              {product.colors.split(',').slice(0, 4).map((color, idx) => {
                const colorName = color.trim().toLowerCase();
                const colorMap: Record<string, string> = {
                  black: '#000000', white: '#FFFFFF', red: '#EF4444', blue: '#3B82F6',
                  green: '#10B981', yellow: '#F59E0B', orange: '#F97316', purple: '#A855F7',
                  pink: '#EC4899', gray: '#6B7280', grey: '#6B7280', brown: '#92400E',
                  gold: '#D4AF37', silver: '#C0C0C0', bronze: '#CD7F32', navy: '#1E3A8A',
                  maroon: '#7F1D1D', teal: '#14B8A6', cyan: '#06B6D4', lime: '#84CC16',
                  indigo: '#6366F1', violet: '#8B5CF6', rose: '#F43F5E', amber: '#F59E0B',
                  emerald: '#059669', sky: '#0EA5E9', slate: '#64748B'
                };
                const bgColor = colorMap[colorName] || '#9CA3AF';
                return (
                  <div
                    key={idx}
                    className="w-5 h-5 rounded-full border-2 border-gray-200 shadow-sm"
                    style={{ backgroundColor: bgColor }}
                    title={color.trim()}
                  />
                );
              })}
              {product.colors.split(',').length > 4 && (
                <span className="text-[9px] text-gray-500 font-medium self-center">+{product.colors.split(',').length - 4}</span>
              )}
            </div>
          ) : null}
        </div>
        <div className="space-y-1 border-t border-gray-100 dark:border-gray-700 pt-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Price</span>
            <span className="text-xs font-bold text-primary-600">{formatCurrency(product.sellingPrice)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Stock</span>
            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", product.stock <= 0 ? "bg-red-50 text-red-600" : product.stock <= 10 ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700")}>{product.stock}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function POSPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [custSearch, setCustSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountTendered, setAmountTendered] = useState("");
  const [loading, setLoading] = useState(false);
  const [manualSubtotal, setManualSubtotal] = useState<number | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState(0);
  const [customerSales, setCustomerSales] = useState<any[]>([]);
  const [showCustomerSales, setShowCustomerSales] = useState(false);
  const [loadingCustomerSales, setLoadingCustomerSales] = useState(false);
  const [cashDenominations, setCashDenominations] = useState<{[key: number]: number}>({});  const [transactionId, setTransactionId] = useState("");  const [taxEnabled, setTaxEnabled] = useState(true);
  const [printTemplate, setPrintTemplate] = useState<"80mm" | "modern" | "classic" | "minimal">("80mm");
  const [currency, setCurrency] = useState("Rs.");
  const [showDenominations, setShowDenominations] = useState(true);
  const [storeName, setStoreName] = useState('OPTICS SHOP');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeCity, setStoreCity] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then((data) => {
      setProducts(data.map((p: any) => ({
        id: p.id, sku: p.sku, name: p.name, sellingPrice: p.sellingPrice,
        taxRate: p.taxRate, productType: p.productType,
        stock: p.inventory?.quantity ?? 0,
        imageUrl: p.imageUrl || null,
        categoryId: p.categoryId || null,
        brandId: p.brandId || null,
        colorVariants: p.colorVariants ? JSON.parse(p.colorVariants) : [],
        colors: p.colors || null,
      })));
    });
    fetch("/api/customers").then(r => r.json()).then(setCustomers);
    fetch("/api/categories").then(r => r.json()).then(setCategories);
    fetch("/api/brands").then(r => r.json()).then(setBrands);
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

  const filteredProducts = products.filter(p => {
    const searchLower = search.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchLower) ||
      p.sku.toLowerCase().includes(searchLower) ||
      (p.colorVariants && p.colorVariants.some(v => v.sku.toLowerCase().includes(searchLower)));
    const matchesCategory = !selectedCategory || (p as any).categoryId === selectedCategory;
    const matchesBrand = !selectedBrand || (p as any).brandId === selectedBrand;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const filteredCustomers = customers.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(custSearch.toLowerCase()) ||
    c.phone?.includes(custSearch)
  );

  function addToCart(product: Product, variantIdx?: number) {
    // Create unique cart item ID including variant
    const variantSku = variantIdx !== undefined && product.colorVariants?.[variantIdx] 
      ? product.colorVariants[variantIdx].sku 
      : product.sku;
    const cartItemId = `${product.id}-${variantSku}`;
    
    setCart(prev => {
      const existing = prev.find(i => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map(i => i.cartItemId === cartItemId ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { 
        ...product, 
        qty: 1, 
        discount: 0,
        cartItemId,
        selectedVariantIdx: variantIdx,
        selectedVariantSku: variantSku
      }];
    });
  }

  function updateQty(cartItemId: string, delta: number) {
    setCart(prev => prev.map(i => i.cartItemId === cartItemId ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  }

  function removeItem(cartItemId: string) {
    setCart(prev => prev.filter(i => i.cartItemId !== cartItemId));
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
        setManualSubtotal(null); setDiscountPercent(0); setDiscountValue(0); setDiscountType('percent');
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
          .separator { border-top: 1px solid #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin: 3px 0; }
          .items { margin: 10px 0; }
          .item-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 10px; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 4px; }
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
        <div class="row">
          <span>Customer:</span>
          <span>${selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 'Walk-in Customer'}</span>
        </div>
        
        <div class="separator"></div>
        
        <div class="items">
          <div class="item-header">
            <span style="flex:1">Item</span>
            <span style="width:30px;text-align:center">Qty</span>
            <span style="width:60px;text-align:right">Rs.</span>
          </div>
          ${cart.map(item => `
            <div class="item">
              <span style="flex:1">${item.name}</span>
              <span style="width:30px;text-align:center">${item.qty}</span>
              <span style="width:60px;text-align:right">${formatCurrency(item.sellingPrice * item.qty)}</span>
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
        ${(() => { const tendered = denominationsTotal > 0 ? denominationsTotal : parseFloat(amountTendered); return tendered < grandTotal ? `
        <div class="row bold" style="color:#c00">
          <span>Remaining:</span>
          <span>${formatCurrency(grandTotal - tendered)}</span>
        </div>
        ` : ''; })()}
        ` : ''}
        
        <div class="separator"></div>
        
        <div class="center" style="margin-top:6px">Thank you for shopping!</div>
        <div class="center bold">${storeName}</div>
        <div class="center" style="font-size:10px">Please visit again</div>
        
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
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input ref={searchRef} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="input pl-9 text-sm py-2" />
            </div>
            
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input text-sm py-2 w-auto min-w-[140px]">
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            
            <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="input text-sm py-2 w-auto min-w-[120px]">
              <option value="">All Brands</option>
              {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
            
            <button onClick={() => setShowAddProduct(true)} className="btn-primary flex items-center gap-2 py-2 px-4 whitespace-nowrap" title="Add New Product">
              <Plus size={18} /> Add Product
            </button>

            <button onClick={() => setShowCalendar(!showCalendar)} className="btn-secondary flex items-center gap-2 py-2 px-4 whitespace-nowrap relative" title="Business Calendar">
              <Calendar size={18} />
            </button>
            {showCalendar && (
              <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 p-4 w-80">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Business Calendar</h3>
                  <button onClick={() => setShowCalendar(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                </div>
                
                <div className="mb-4">
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input w-full text-sm" />
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <div className="text-xs text-gray-500 font-semibold uppercase mb-2">Upcoming Events</div>
                  <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                    <Clock size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-300">Stock Inventory Audit</p>
                      <p className="text-xs text-blue-700 dark:text-blue-400">Feb 20, 2026</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-sm">
                    <Clock size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-purple-900 dark:text-purple-300">Spring Sale Campaign</p>
                      <p className="text-xs text-purple-700 dark:text-purple-400">Mar 1, 2026</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-center py-3">Set events in Settings → Events Calendar</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3">
          {filteredProducts.slice(0, 50).map((p) => (
            <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
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
            <div className="relative"
              onMouseEnter={() => {
                setShowCustomerSales(true);
                if (!customerSales.length && !loadingCustomerSales) {
                  setLoadingCustomerSales(true);
                  fetch(`/api/sales?customerId=${selectedCustomer.id}`)
                    .then(r => r.json())
                    .then(data => {
                      const sales = Array.isArray(data) ? data.slice(0, 5) : data.sales ? data.sales.slice(0, 5) : [];
                      setCustomerSales(sales);
                      setLoadingCustomerSales(false);
                    })
                    .catch(err => {
                      console.error('Failed to fetch sales:', err);
                      setCustomerSales([]);
                      setLoadingCustomerSales(false);
                    });
                }
              }}
              onMouseLeave={() => setShowCustomerSales(false)}
            >
              <div className="flex items-center justify-between bg-primary-50 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-primary-700">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                    <p className="text-xs text-primary-500">{selectedCustomer.phone}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedCustomer(null); setCustomerSales([]); setShowCustomerSales(false); }} className="text-primary-400 hover:text-primary-600"><X size={16} /></button>
              </div>
              {showCustomerSales && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 p-3 min-h-16">
                  {loadingCustomerSales ? (
                    <p className="text-xs text-gray-500 py-2">Loading...</p>
                  ) : customerSales.length > 0 ? (
                    <>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent Purchases</p>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {customerSales.map((s: any) => (
                          <div key={s.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-gray-50 dark:bg-gray-700/50">
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">{s.invoiceNo}</span>
                              <span className="text-gray-400 ml-2">{new Date(s.saleDate).toLocaleDateString()}</span>
                            </div>
                            <span className="font-semibold text-primary-600">{formatCurrency(s.totalAmount)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500 py-2">No purchase history</p>
                  )}
                </div>
              )}
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
              <div key={item.cartItemId} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 font-mono">SKU: {item.selectedVariantSku || item.sku}</p>
                  <p className="text-xs text-gray-400">{formatCurrency(item.sellingPrice)} × {item.qty}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(item.cartItemId, -1)} className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200"><Minus size={12} /></button>
                  <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                  <button onClick={() => updateQty(item.cartItemId, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200"><Plus size={12} /></button>
                </div>
                <p className="text-sm font-semibold w-20 text-right">{formatCurrency(item.sellingPrice * item.qty)}</p>
                <button onClick={() => removeItem(item.cartItemId)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
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
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Discount</span>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden ml-1">
                <button type="button" onClick={() => { setDiscountType('percent'); setDiscountValue(0); setDiscountPercent(0); }} className={cn("px-1.5 py-0.5 text-[10px] font-medium transition", discountType === 'percent' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-gray-700')}>%</button>
                <button type="button" onClick={() => { setDiscountType('fixed'); setDiscountValue(0); setDiscountPercent(0); }} className={cn("px-1.5 py-0.5 text-[10px] font-medium transition", discountType === 'fixed' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-gray-700')}>Rs.</button>
              </div>
            </div>
            <input 
              type="number" 
              value={discountValue} 
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setDiscountValue(val);
                if (discountType === 'percent') {
                  setDiscountPercent(val);
                } else {
                  // Convert fixed to percentage
                  setDiscountPercent(subtotal > 0 ? (val / subtotal) * 100 : 0);
                }
              }}
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
              className="w-full py-3 text-base font-semibold flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Quick Add Product Modal */}
      {showAddProduct && (
        <QuickAddProductModal 
          onClose={() => setShowAddProduct(false)} 
          onProductAdded={(product) => {
            addToCart(product);
            setShowAddProduct(false);
            toast.success("Product added to cart!");
          }}
          categories={categories}
          brands={brands}
        />
      )}
    </div>
  );
}

/* Quick Add Product Modal */
function QuickAddProductModal({ onClose, onProductAdded, categories, brands }: { 
  onClose: () => void; 
  onProductAdded: (product: any) => void;
  categories: any[];
  brands: any[];
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    sellingPrice: "",
    categoryId: "",
    brandId: "",
    productType: "frame",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.sellingPrice) {
      toast.error("Name and price are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku || `SKU${Date.now()}`,
          sellingPrice: parseFloat(form.sellingPrice),
          costPrice: parseFloat(form.sellingPrice) * 0.7, // default cost
          categoryId: form.categoryId || null,
          brandId: form.brandId || null,
          productType: form.productType,
          taxRate: 18,
          isActive: true,
        }),
      });

      if (res.ok) {
        const product = await res.json();
        onProductAdded({
          id: product.id,
          sku: product.sku,
          name: product.name,
          sellingPrice: product.sellingPrice,
          taxRate: product.taxRate,
          productType: product.productType,
          stock: 0,
          imageUrl: null,
        });
      } else {
        toast.error("Failed to create product");
      }
    } catch (error) {
      toast.error("Error creating product");
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
              <Plus size={20} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-semibold">Quick Add Product</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Product Name *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className="input" placeholder="Enter product name" required />
          </div>

          <div>
            <label className="label">SKU (Optional)</label>
            <input value={form.sku} onChange={(e) => set("sku", e.target.value)} className="input" placeholder="Auto-generated if empty" />
          </div>

          <div>
            <label className="label">Selling Price *</label>
            <input type="number" step="0.01" value={form.sellingPrice} onChange={(e) => set("sellingPrice", e.target.value)} className="input" placeholder="0.00" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className="input">
                <option value="">— Select —</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Brand</label>
              <select value={form.brandId} onChange={(e) => set("brandId", e.target.value)} className="input">
                <option value="">— Select —</option>
                {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Product Type</label>
            <select value={form.productType} onChange={(e) => set("productType", e.target.value)} className="input">
              <option value="frame">Frame</option>
              <option value="lens">Lens</option>
              <option value="sunglasses">Sunglasses</option>
              <option value="contact_lens">Contact Lens</option>
              <option value="accessory">Accessory</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? "Adding..." : "Add & Use"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
