"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, User, Settings, Calculator, ListTodo, X, Trash2, Plus, Menu, ShoppingCart, FileText, AlertTriangle, XCircle, Package, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  count: number;
  color: string;
  route: string;
}

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showTodoList, setShowTodoList] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [todos, setTodos] = useState<{id: number; text: string; done: boolean}[]>([]);
  const [todoInput, setTodoInput] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<{productName: string; sku: string; quantity: number}[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          setNotifCount(data.totalCount || 0);
          setTotalSales(data.totalSales || 0);
          setLowStockItems(data.lowStockItems || []);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        
        <div>
          <h2 className="text-sm font-medium text-gray-400 dark:text-gray-500">Welcome back,</h2>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {session?.user?.name ?? "User"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* New Sale */}
        <button onClick={() => router.push("/pos")} className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="New Sale">
          <ShoppingCart size={20} />
        </button>
        {/* New Customer */}
        <button onClick={() => router.push("/customers")} className="p-2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" title="New Customer">
          <User size={20} />
        </button>
        {/* Open Register */}
        <button onClick={() => router.push("/register")} className="p-2 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg" title="Open Register">
          <CreditCard size={20} />
        </button>
        {/* Add Product */}
        <button onClick={() => router.push("/products")} className="p-2 text-gray-400 dark:text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg" title="Add Product">
          <Package size={20} />
        </button>
        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
        {/* Calculator */}
        <button onClick={() => setShowCalculator(!showCalculator)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg" title="Calculator">
          <Calculator size={20} />
        </button>
        {/* Todo List */}
        <button onClick={() => setShowTodoList(!showTodoList)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg" title="Todo List">
          <ListTodo size={20} />
        </button>
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
            <Bell size={20} />
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                {notifCount > 99 ? "99+" : notifCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Notifications</h3>
                  <p className="text-xs text-gray-400">Total Sales: {totalSales}</p>
                </div>
                {notifCount > 0 && (
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {notifCount} alert{notifCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">All caught up!</p>
                    <p className="text-xs text-gray-300 dark:text-gray-600">No pending alerts</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => { setShowNotifications(false); router.push(n.route); }}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-left border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                    >
                      <div className={cn("mt-0.5 p-2 rounded-lg",
                        n.color === "red" && "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
                        n.color === "yellow" && "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
                        n.color === "blue" && "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                        n.color === "orange" && "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
                      )}>
                        {n.id === "pending-sales" && <ShoppingCart size={16} />}
                        {n.id === "draft-sales" && <FileText size={16} />}
                        {n.id === "unpaid-sales" && <CreditCard size={16} />}
                        {n.id === "low-stock" && <Package size={16} />}
                        {n.id === "cancelled-sales" && <XCircle size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{n.title}</p>
                          <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded-full",
                            n.color === "red" && "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
                            n.color === "yellow" && "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
                            n.color === "blue" && "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                            n.color === "orange" && "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
                          )}>{n.count}</span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{n.message}</p>
                      </div>
                    </button>
                  ))
                )}

                {lowStockItems.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Low Stock Items</p>
                    <div className="space-y-1.5">
                      {lowStockItems.slice(0, 5).map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-300 truncate mr-2">{item.productName}</span>
                          <span className={cn("font-mono font-bold px-1.5 py-0.5 rounded",
                            item.quantity === 0 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          )}>
                            {item.quantity} left
                          </span>
                        </div>
                      ))}
                      {lowStockItems.length > 5 && (
                        <p className="text-xs text-gray-400 text-center">+{lowStockItems.length - 5} more...</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                <button
                  onClick={() => { setShowNotifications(false); router.push("/dashboard"); }}
                  className="w-full text-center text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  View Dashboard →
                </button>
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
    </header>
  );
}
