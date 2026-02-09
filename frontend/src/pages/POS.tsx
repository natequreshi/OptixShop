import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Minus, Trash2, User, X, CreditCard, Banknote, Smartphone, ShoppingBag, Percent, Tag } from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency, today } from '../utils/helpers';
import toast from 'react-hot-toast';

interface Product {
  id: string; sku: string; barcode: string; name: string; selling_price: number;
  cost_price: number; tax_rate: number; stock_quantity: number; product_type: string;
  brand_name: string; category_name: string;
}

interface CartItem extends Product {
  quantity: number;
  discount_pct: number;
  discount_amount: number;
  line_total: number;
}

interface Customer {
  id: string; customer_no: string; first_name: string; last_name: string; phone: string;
  loyalty_points: number; credit_balance: number;
}

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<{ data: Product[] }>('/products?limit=200&active=true')
      .then(res => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchTerm));
    const matchesType = typeFilter === 'all' || p.product_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, line_total: (item.quantity + 1) * item.selling_price * (1 - item.discount_pct / 100) }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, discount_pct: 0, discount_amount: 0, line_total: product.selling_price }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newQty = Math.max(0, item.quantity + delta);
      if (newQty === 0) return item;
      return { ...item, quantity: newQty, line_total: newQty * item.selling_price * (1 - item.discount_pct / 100) };
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const setItemDiscount = (id: string, pct: number) => {
    setCart(prev => prev.map(item => {
      if (item.id !== id) return item;
      return { ...item, discount_pct: pct, line_total: item.quantity * item.selling_price * (1 - pct / 100) };
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.line_total, 0);
  const discountAmount = subtotal * globalDiscount / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = cart.reduce((sum, item) => {
    const itemBase = item.line_total * (1 - globalDiscount / 100);
    return sum + itemBase * (item.tax_rate || 0) / 100;
  }, 0);
  const total = taxableAmount + taxAmount;
  const change = parseFloat(amountTendered || '0') - total;

  const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm) {
      const product = products.find(p => p.barcode === searchTerm || p.sku === searchTerm);
      if (product) {
        addToCart(product);
        setSearchTerm('');
      }
    }
  };

  const searchCustomers = async (term: string) => {
    setCustomerSearch(term);
    if (term.length >= 2) {
      try {
        const res = await api.get<{ data: Customer[] }>(`/customers?search=${term}&limit=5`);
        setCustomerResults(res.data);
      } catch { /* ignore */ }
    } else {
      setCustomerResults([]);
    }
  };

  const completeSale = async () => {
    if (cart.length === 0) return;

    try {
      const saleData = {
        customer_id: customer?.id || null,
        sale_date: today(),
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.selling_price,
          tax_rate: item.tax_rate,
          discount_pct: item.discount_pct,
        })),
        discount_amount: discountAmount,
        paid_amount: paymentMethod === 'credit' ? 0 : total,
        payment_method: paymentMethod,
        cashier_id: null,
      };

      const result = await api.post<{ invoice_no: string; total_amount: number }>('/sales', saleData);
      toast.success(`Sale completed! Invoice: ${result.invoice_no}`);
      
      // Reset
      setCart([]);
      setCustomer(null);
      setGlobalDiscount(0);
      setShowPayment(false);
      setAmountTendered('');
      setPaymentMethod('cash');
      searchRef.current?.focus();
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete sale');
    }
  };

  return (
    <div className="pos-layout">
      {/* Left: Product Browser */}
      <div className="pos-products">
        {/* Search & Filters */}
        <div style={{ marginBottom: 16 }}>
          <div className="input-group" style={{ maxWidth: 480, marginBottom: 12 }}>
            <div className="search-box" style={{ flex: 1, maxWidth: 'none' }}>
              <Search />
              <input
                ref={searchRef}
                type="text"
                className="form-input"
                placeholder="Scan barcode or search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={handleBarcodeScan}
                style={{ paddingLeft: 36 }}
              />
            </div>
          </div>
          <div className="filter-pills">
            {[
              { key: 'all', label: 'All' },
              { key: 'frame', label: 'Frames' },
              { key: 'lens', label: 'Lenses' },
              { key: 'contact_lens', label: 'Contacts' },
              { key: 'sunglasses', label: 'Sunglasses' },
              { key: 'accessory', label: 'Accessories' },
            ].map(f => (
              <button
                key={f.key}
                className={`filter-pill ${typeFilter === f.key ? 'active' : ''}`}
                onClick={() => setTypeFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="loading-center"><div className="spinner"></div></div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-tile" onClick={() => addToCart(product)}>
                <div className="product-tile-name">{product.name}</div>
                <div className="product-tile-sku">{product.sku} {product.brand_name && `• ${product.brand_name}`}</div>
                <div className="product-tile-price">{formatCurrency(product.selling_price)}</div>
                <div className={`product-tile-stock ${product.stock_quantity <= 5 ? 'low' : ''}`}>
                  Stock: {product.stock_quantity}
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <ShoppingBag size={40} />
                <h3>No products found</h3>
                <p>Try a different search term</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Cart */}
      <div className="pos-cart">
        <div className="pos-cart-header">
          <h3 style={{ fontWeight: 600, fontSize: 15 }}>Current Sale</h3>
          {cart.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => setCart([])}>
              <Trash2 size={14} /> Clear
            </button>
          )}
        </div>

        {/* Customer Selection */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
          {customer ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--primary-bg)', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={16} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{customer.first_name} {customer.last_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{customer.phone} • Pts: {customer.loyalty_points}</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setCustomer(null)}><X size={14} /></button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div className="search-box" style={{ maxWidth: 'none' }}>
                <User />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search customer (or walk-in)..."
                  value={customerSearch}
                  onChange={e => searchCustomers(e.target.value)}
                  onFocus={() => setShowCustomerSearch(true)}
                  style={{ paddingLeft: 36 }}
                />
              </div>
              {showCustomerSearch && customerResults.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-lg)', zIndex: 10, maxHeight: 200, overflow: 'auto' }}>
                  {customerResults.map(c => (
                    <div key={c.id} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}
                      onClick={() => { setCustomer(c); setShowCustomerSearch(false); setCustomerSearch(''); setCustomerResults([]); }}>
                      <div style={{ fontWeight: 500 }}>{c.first_name} {c.last_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.phone} • {c.customer_no}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="pos-cart-items">
          {cart.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <ShoppingBag size={36} />
              <h3>Cart is empty</h3>
              <p>Click products or scan barcode to add items</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="pos-cart-item">
                <div className="pos-cart-item-info">
                  <div className="pos-cart-item-name">{item.name}</div>
                  <div className="pos-cart-item-meta">
                    {formatCurrency(item.selling_price)} each
                    {item.discount_pct > 0 && <span style={{ color: 'var(--success)', marginLeft: 4 }}>-{item.discount_pct}%</span>}
                  </div>
                </div>
                <div className="pos-cart-item-qty">
                  <button onClick={() => updateQuantity(item.id, -1)}>−</button>
                  <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                </div>
                <div className="pos-cart-item-price">{formatCurrency(item.line_total)}</div>
                <button className="btn btn-ghost" style={{ padding: 4 }} onClick={() => removeFromCart(item.id)}>
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <>
            <div className="pos-cart-summary">
              <div className="pos-summary-row">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {globalDiscount > 0 && (
                <div className="pos-summary-row" style={{ color: 'var(--success)' }}>
                  <span>Discount ({globalDiscount}%)</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="pos-summary-row">
                <span>Tax (GST)</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="pos-summary-row total">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                <Percent size={14} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="number"
                  className="form-input"
                  placeholder="Discount %"
                  value={globalDiscount || ''}
                  onChange={e => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                  style={{ width: 80, padding: '4px 8px', fontSize: 12 }}
                />
              </div>
            </div>

            <div className="pos-cart-actions">
              {!showPayment ? (
                <>
                  <button className="btn btn-secondary flex-1" onClick={() => setCart([])}>Hold</button>
                  <button className="btn btn-primary flex-1 btn-lg" onClick={() => setShowPayment(true)}>
                    Pay {formatCurrency(total)}
                  </button>
                </>
              ) : (
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 12 }}>
                    {[
                      { method: 'cash', icon: Banknote, label: 'Cash' },
                      { method: 'card', icon: CreditCard, label: 'Card' },
                      { method: 'upi', icon: Smartphone, label: 'UPI' },
                      { method: 'credit', icon: Tag, label: 'Credit (Udhaar)' },
                    ].map(p => (
                      <button
                        key={p.method}
                        className={`btn ${paymentMethod === p.method ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setPaymentMethod(p.method)}
                        style={{ justifyContent: 'center' }}
                      >
                        <p.icon size={14} /> {p.label}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'cash' && (
                    <div style={{ marginBottom: 12 }}>
                      <input
                        type="number"
                        className="form-input form-input-lg"
                        placeholder="Amount tendered..."
                        value={amountTendered}
                        onChange={e => setAmountTendered(e.target.value)}
                        autoFocus
                      />
                      {change > 0 && (
                        <div style={{ marginTop: 6, fontSize: 14, fontWeight: 600, color: 'var(--success)' }}>
                          Change: {formatCurrency(change)}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary flex-1" onClick={() => setShowPayment(false)}>Back</button>
                    <button
                      className="btn btn-success flex-1 btn-lg"
                      onClick={completeSale}
                      disabled={paymentMethod === 'credit' && !customer}
                    >
                      Complete Sale
                    </button>
                  </div>
                  {paymentMethod === 'credit' && !customer && (
                    <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 6 }}>Select a customer for credit sale</div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
