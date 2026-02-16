"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, User, Settings, Calculator, ListTodo, X, Trash2, Plus, ShoppingCart, UserPlus, CreditCard, Package, Menu, DollarSign, Calendar, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import SalesStatusDropdown from "@/components/SalesStatusDropdown";
import ViewSaleModal from "@/app/(dashboard)/dashboard/view-sale-modal";
import EditSaleModal from "@/app/(dashboard)/dashboard/edit-sale-modal";
import PrintInvoiceModal from "@/app/(dashboard)/dashboard/print-invoice-modal";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTodoList, setShowTodoList] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [todos, setTodos] = useState<{id: number; text: string; done: boolean}[]>([]);
  const [todoInput, setTodoInput] = useState("");
  
  // Customer form
  const [customerForm, setCustomerForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  
  // Product form
  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    stock: "",
    imageUrl: "",
    colors: "",
  });
  
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);
  const [registerSessions, setRegisterSessions] = useState<any[]>([]);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const [recentSalesStatus, setRecentSalesStatus] = useState<any[]>([]);
  const [pendingSalesStatus, setPendingSalesStatus] = useState<any[]>([]);
  const [draftSalesStatus, setDraftSalesStatus] = useState<any[]>([]);
  const [viewingSale, setViewingSale] = useState<any | null>(null);
  const [editingSale, setEditingSale] = useState<any | null>(null);
  const [printingSale, setPrintingSale] = useState<any | null>(null);
  
  const ref = useRef<HTMLDivElement>(null);
  const registerRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (registerRef.current && !registerRef.current.contains(e.target as Node)) setShowRegisterDropdown(false);
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) setShowCalendar(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Fetch register sessions, tax settings, and sales data
  useEffect(() => {
    async function fetchData() {
      try {
        const [regRes, taxRes, recentRes, pendingRes, draftRes] = await Promise.all([
          fetch("/api/register?limit=7"),
          fetch("/api/settings"),
          fetch("/api/sales?status=completed&limit=5"),
          fetch("/api/sales?status=pending&limit=5"),
          fetch("/api/sales?status=draft&limit=5")
        ]);
        
        if (regRes.ok) {
          const data = await regRes.json();
          setRegisterSessions(data.slice(0, 7));
        }
        
        if (taxRes.ok) {
          const settings = await taxRes.json();
          const taxEnabled = settings.tax_enabled === "true";
          const rate = parseFloat(settings.tax_rate || "0");
          setTaxRate(taxEnabled ? rate : 0);
        }
        
        if (recentRes.ok) setRecentSalesStatus(await recentRes.json());
        if (pendingRes.ok) setPendingSalesStatus(await pendingRes.json());
        if (draftRes.ok) setDraftSalesStatus(await draftRes.json());
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    }
    fetchData();
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        )}
        
        <div>
          <h2 className="text-sm font-medium text-gray-400 dark:text-gray-500">Welcome back,</h2>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {session?.user?.name ?? "User"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Action Icons - Colorful */}
        <button 
          onClick={() => router.push("/pos")}
          className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          title="New Sale (POS)"
        >
          <ShoppingCart size={20} />
        </button>
        
        <button 
          onClick={() => setShowNewCustomer(true)}
          className="p-2 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
          title="New Customer"
        >
          <UserPlus size={20} />
        </button>
        
        <button 
          onClick={() => setShowNewProduct(true)}
          className="p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
          title="New Product"
        >
          <Package size={20} />
        </button>
        
        {/* Register Icon with Dropdown */}
        <div ref={registerRef} className="relative">
          <button 
            onClick={() => setShowRegisterDropdown(!showRegisterDropdown)}
            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          >
            <DollarSign size={20} />
          </button>
          
          {/* Register Dropdown */}
          {showRegisterDropdown && (
            <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Register Sessions (Last 7 Days)</h3>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {registerSessions.length === 0 ? (
                  <div className="p-6 text-center">
                    <CreditCard size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">No register sessions found</p>
                    <button
                      onClick={() => {
                        setShowRegisterDropdown(false);
                        router.push("/register");
                      }}
                      className="mt-3 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                    >
                      Open Register Now
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {registerSessions.map((session: any) => (
                      <div key={session.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-semibold",
                              session.status === "open"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            )}>
                              {session.status}
                            </span>
                            <span className="text-xs text-gray-500">{session.user?.fullName || 'User'}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-400">Opened</p>
                            <p className="font-medium text-gray-700 dark:text-gray-300">
                              {new Date(session.openedAt).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Opening Cash</p>
                            <p className="font-medium text-gray-700 dark:text-gray-300">
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR' }).format(session.openingCash)}
                            </p>
                          </div>
                          {session.closedAt && (
                            <>
                              <div>
                                <p className="text-gray-400">Closed</p>
                                <p className="font-medium text-gray-700 dark:text-gray-300">
                                  {new Date(session.closedAt).toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Closing Cash</p>
                                <p className="font-medium text-gray-700 dark:text-gray-300">
                                  {session.closingCash !== null
                                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR' }).format(session.closingCash)
                                    : "—"}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                <button
                  onClick={() => {
                    setShowRegisterDropdown(false);
                    router.push("/register");
                  }}
                  className="w-full text-center text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  View All Register Sessions →
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Sales Dropdown */}
        <div className="relative">
          <SalesStatusDropdown
            recentSalesStatus={recentSalesStatus}
            pendingSalesStatus={pendingSalesStatus}
            draftSalesStatus={draftSalesStatus}
            onViewSale={(sale) => setViewingSale(sale)}
            onEditSale={(sale) => setEditingSale(sale)}
            onPrintSale={(sale) => setPrintingSale(sale)}
          />
        </div>
        
        {/* Calendar */}
        <button onClick={() => setShowCalendar(!showCalendar)} className="p-2 text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors" title="Calendar">
          <Calendar size={20} />
        </button>
        
        {/* Calculator */}
        <button onClick={() => setShowCalculator(!showCalculator)} className="p-2 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Calculator">
          <Calculator size={20} />
        </button>
        
        {/* Todo List */}
        <button onClick={() => setShowTodoList(!showTodoList)} className="p-2 text-cyan-500 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors" title="Todo List">
          <ListTodo size={20} />
        </button>
        
        {/* Notifications */}
        <div ref={notificationRef} className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-colors" title="Notifications">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                <div className="p-6 text-center">
                  <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">No notifications yet</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full flex items-center justify-center text-sm font-semibold">
              {(session?.user?.name ?? "U").charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{session?.user?.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{(session?.user as any)?.role}</p>
            </div>
            <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />
          </button>

          {open && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-50">
              <button onClick={() => { setOpen(false); router.push("/profile"); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <User size={16} /> Profile
              </button>
              <button onClick={() => { setOpen(false); router.push("/settings"); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Settings size={16} /> Settings
              </button>
              <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
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
              <button onClick={() => setCalcDisplay('0')} className="col-span-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 font-medium">Clear</button>
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
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"><Trash2 size={14} /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {showNewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setShowNewCustomer(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold dark:text-white">Add New Customer</h3>
              <button onClick={() => setShowNewCustomer(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">First Name *</label>
                  <input 
                    type="text" 
                    value={customerForm.firstName}
                    onChange={(e) => setCustomerForm({...customerForm, firstName: e.target.value})}
                    className="input" 
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input 
                    type="text" 
                    value={customerForm.lastName}
                    onChange={(e) => setCustomerForm({...customerForm, lastName: e.target.value})}
                    className="input" 
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="label">Phone *</label>
                <input 
                  type="tel" 
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                  className="input" 
                  placeholder="+92-300-1234567"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input 
                  type="email" 
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                  className="input" 
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t border-gray-100 dark:border-gray-700">
              <button 
                onClick={() => setShowNewCustomer(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (!customerForm.firstName || !customerForm.phone) {
                    toast.error("First name and phone are required");
                    return;
                  }
                  setSavingCustomer(true);
                  try {
                    const res = await fetch("/api/customers", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(customerForm),
                    });
                    if (res.ok) {
                      toast.success("Customer added successfully!");
                      setCustomerForm({ firstName: "", lastName: "", phone: "", email: "" });
                      setShowNewCustomer(false);
                      router.refresh();
                    } else {
                      const data = await res.json();
                      toast.error(data.error || "Failed to add customer");
                    }
                  } catch (err) {
                    toast.error("Network error");
                  }
                  setSavingCustomer(false);
                }}
                disabled={savingCustomer}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50"
              >
                {savingCustomer ? "Saving..." : "Add Customer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Product Modal */}
      {showNewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setShowNewProduct(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold dark:text-white">Add New Product</h3>
              <button onClick={() => setShowNewProduct(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="label">Product Name *</label>
                <input 
                  type="text" 
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  className="input" 
                  placeholder="Ray-Ban Aviator"
                />
              </div>
              
              {/* Image Upload Section */}
              <div className="space-y-2">
                <label className="label">Product Image</label>
                
                {/* Image Preview */}
                {productForm.imageUrl && (
                  <div className="relative w-24 h-24 border-2 border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                    <img 
                      src={productForm.imageUrl} 
                      alt="Product preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Image";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setProductForm({...productForm, imageUrl: ""})}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                
                {/* Upload Button and URL Input */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("Image size should be less than 5MB");
                          return;
                        }

                        setUploadingProductImage(true);
                        const formData = new FormData();
                        formData.append("file", file);

                        try {
                          const res = await fetch("/api/upload-image", {
                            method: "POST",
                            body: formData,
                          });
                          
                          if (res.ok) {
                            const data = await res.json();
                            setProductForm({...productForm, imageUrl: data.url});
                            toast.success("Image uploaded");
                          } else {
                            toast.error("Upload failed");
                          }
                        } catch (err) {
                          toast.error("Upload error");
                        }
                        setUploadingProductImage(false);
                      }}
                      className="hidden"
                      id="product-image-upload"
                      disabled={uploadingProductImage}
                    />
                    <label
                      htmlFor="product-image-upload"
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition text-sm",
                        uploadingProductImage && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Package size={14} />
                      {uploadingProductImage ? "Uploading..." : "Upload"}
                    </label>
                    <span className="text-xs text-gray-400">or enter URL below</span>
                  </div>
                  
                  <input 
                    type="url"
                    value={productForm.imageUrl} 
                    onChange={(e) => setProductForm({...productForm, imageUrl: e.target.value})} 
                    className="input text-sm" 
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">SKU *</label>
                  <input 
                    type="text" 
                    value={productForm.sku}
                    onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                    className="input" 
                    placeholder="RB-001"
                  />
                </div>
                <div>
                  <label className="label">Category</label>
                  <input 
                    type="text" 
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    className="input" 
                    placeholder="Sunglasses"
                  />
                </div>
              </div>
              <div>
                <label className="label">Colors (comma-separated)</label>
                <input 
                  type="text" 
                  value={productForm.colors}
                  onChange={(e) => setProductForm({...productForm, colors: e.target.value})}
                  className="input" 
                  placeholder="Black, Gold, Silver"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Price *</label>
                  <input 
                    type="number" 
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    className="input" 
                    placeholder="5000"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="label">Stock Quantity *</label>
                  <input 
                    type="number" 
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                    className="input" 
                    placeholder="10"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t border-gray-100 dark:border-gray-700">
              <button 
                onClick={() => setShowNewProduct(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (!productForm.name || !productForm.sku || !productForm.price || !productForm.stock) {
                    toast.error("All fields except category are required");
                    return;
                  }
                  setSavingProduct(true);
                  try {
                    const res = await fetch("/api/products", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: productForm.name,
                        sku: productForm.sku,
                        category: productForm.category || "Uncategorized",
                        sellingPrice: parseFloat(productForm.price),
                        stockQuantity: parseInt(productForm.stock),
                        imageUrl: productForm.imageUrl || "",
                        colors: productForm.colors || "",
                        taxRate: taxRate,
                      }),
                    });
                    if (res.ok) {
                      toast.success("Product added successfully!");
                      setProductForm({ name: "", sku: "", category: "", price: "", stock: "", imageUrl: "", colors: "" });
                      setShowNewProduct(false);
                      router.refresh();
                    } else {
                      const data = await res.json();
                      toast.error(data.error || "Failed to add product");
                    }
                  } catch (err) {
                    toast.error("Network error");
                  }
                  setSavingProduct(false);
                }}
                disabled={savingProduct}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition disabled:opacity-50"
              >
                {savingProduct ? "Saving..." : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales Modals */}
      {viewingSale && (
        <ViewSaleModal 
          sale={viewingSale} 
          onClose={() => setViewingSale(null)}
          onEdit={() => {
            setEditingSale(viewingSale);
            setViewingSale(null);
          }}
          onPrint={() => {
            setPrintingSale(viewingSale);
            setViewingSale(null);
          }}
        />
      )}
      {editingSale && (
        <EditSaleModal 
          sale={editingSale} 
          onClose={() => setEditingSale(null)}
          onSaved={() => {
            setEditingSale(null);
            toast.success("Sale updated successfully");
            window.location.reload();
          }}
        />
      )}
      {printingSale && (
        <PrintInvoiceModal sale={printingSale} onClose={() => setPrintingSale(null)} />
      )}
    </header>
  );
}
