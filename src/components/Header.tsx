"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, User, Settings, Calculator, ListTodo, X, Trash2, Plus, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showTodoList, setShowTodoList] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [todos, setTodos] = useState<{id: number; text: string; done: boolean}[]>([]);
  const [todoInput, setTodoInput] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
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
        {/* Calculator */}
        <button onClick={() => setShowCalculator(!showCalculator)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg" title="Calculator">
          <Calculator size={20} />
        </button>
        {/* Todo List */}
        <button onClick={() => setShowTodoList(!showTodoList)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg" title="Todo List">
          <ListTodo size={20} />
        </button>
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

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
