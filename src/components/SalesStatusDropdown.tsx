"use client";

import { useState, useRef, useEffect } from "react";
import { ShoppingBag, ChevronDown, Eye, Edit2, Printer, Trash2, RotateCw } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface SaleItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxAmount: number;
  total: number;
}

interface Sale {
  id: string;
  invoiceNo: string;
  customerName: string;
  saleDate: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  itemCount: number;
  items: SaleItem[];
  paidAmount: number;
  balanceAmount: number;
}

interface Props {
  recentSalesStatus: Sale[];
  pendingSalesStatus: Sale[];
  draftSalesStatus: Sale[];
  onViewSale: (sale: Sale) => void;
  onEditSale: (sale: Sale) => void;
  onPrintSale: (sale: Sale) => void;
  onRefresh?: () => Promise<void>;
}

export default function SalesStatusDropdown({
  recentSalesStatus,
  pendingSalesStatus,
  draftSalesStatus,
  onViewSale,
  onEditSale,
  onPrintSale,
  onRefresh,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"recent" | "pending" | "draft">("recent");
  const [showActions, setShowActions] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalSales = recentSalesStatus.length + pendingSalesStatus.length + draftSalesStatus.length;

  const salesByTab = {
    recent: recentSalesStatus,
    pending: pendingSalesStatus,
    draft: draftSalesStatus,
  };

  const currentSales = salesByTab[activeTab];

  const handleDelete = async (saleId: string, invoiceNo: string) => {
    if (!confirm(`Delete sale ${invoiceNo}? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/sales/${saleId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Sale deleted successfully");
        router.refresh();
        setShowActions(null);
      } else {
        toast.error("Failed to delete sale");
      }
    } catch (error) {
      toast.error("Error deleting sale");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
        toast.success("Sales data refreshed");
      }
    } catch (error) {
      toast.error("Failed to refresh sales");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-600 font-medium transition-colors relative"
      >
        <ShoppingBag size={18} />
        <span>Sales</span>
        {totalSales > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {totalSales}
          </span>
        )}
        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header with Tabs and Refresh Button */}
          <div className="flex border-b border-gray-200 items-stretch">
            <div className="flex flex-1 border-b border-gray-200">
              {/* Tabs */}
              <button
                onClick={() => setActiveTab("recent")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "recent"
                    ? "text-primary-600 border-b-2 border-primary-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Recent ({recentSalesStatus.length})
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "pending"
                    ? "text-primary-600 border-b-2 border-primary-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Pending ({pendingSalesStatus.length})
              </button>
              <button
                onClick={() => setActiveTab("draft")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "draft"
                    ? "text-primary-600 border-b-2 border-primary-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Draft ({draftSalesStatus.length})
              </button>
            </div>
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Refresh sales data"
            >
              <RotateCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Sales List */}
          <div className="max-h-96 overflow-y-auto">
            {currentSales.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No {activeTab} sales
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {currentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      onViewSale(sale);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono font-semibold text-primary-600 truncate">
                          {sale.invoiceNo}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                          {sale.customerName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{formatDate(sale.saleDate)}</span>
                          <span className="text-xs font-semibold text-gray-900">
                            {formatCurrency(sale.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Action Dropdown */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActions(showActions === sale.id ? null : sale.id);
                          }}
                          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                          title="More actions"
                        >
                          <ChevronDown size={16} className="text-gray-500 rotate-90" />
                        </button>

                        {showActions === sale.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditSale(sale);
                                setShowActions(null);
                                setIsOpen(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors border-b border-gray-100"
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onPrintSale(sale);
                                setShowActions(null);
                                setIsOpen(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors border-b border-gray-100"
                            >
                              <Printer size={14} /> Print Invoice
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(sale.id, sale.invoiceNo);
                                setShowActions(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
