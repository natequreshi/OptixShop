"use client";

import { X, Edit2, Printer } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Package } from "lucide-react";

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

const statusColors: Record<string, string> = {
  completed: "bg-green-50 text-green-700",
  pending: "bg-yellow-50 text-yellow-700",
  cancelled: "bg-red-50 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
  paid: "bg-green-50 text-green-700",
  partial: "bg-yellow-50 text-yellow-700",
  unpaid: "bg-red-50 text-red-700",
  draft: "bg-gray-50 text-gray-600",
};

export default function ViewSaleModal({
  sale: s,
  onClose,
  onEdit,
  onPrint,
}: {
  sale: Sale;
  onClose: () => void;
  onEdit: () => void;
  onPrint: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sale Invoice</h2>
            <p className="text-sm text-gray-500 font-mono mt-1">{s.invoiceNo}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Edit2 size={14} /> Edit
            </button>
            <button
              onClick={onPrint}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Printer size={14} /> Print
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Customer</p>
              <p className="text-sm font-medium text-gray-900">{s.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Date</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(s.saleDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Items</p>
              <p className="text-sm font-medium text-gray-900">{s.itemCount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Payment Status</p>
              <p className="text-sm font-medium text-gray-900">{s.paymentStatus}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Sale Status</p>
              <span
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full font-medium",
                  statusColors[s.status]
                )}
              >
                {s.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Payment Status</p>
              <span
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full font-medium",
                  statusColors[s.paymentStatus]
                )}
              >
                {s.paymentStatus}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Package size={16} /> Items ({s.items.length})
            </h3>
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-xs text-gray-600 uppercase">
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Discount</th>
                    <th className="px-4 py-3 text-right">Tax</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {s.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800 flex items-center gap-2">
                        <Package size={14} className="text-gray-400" />{" "}
                        {item.productName}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        {item.discount > 0 ? `-${formatCurrency(item.discount)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(item.taxAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-bold text-primary-600">
                  {formatCurrency(s.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Paid Amount</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(s.paidAmount)}
                </span>
              </div>
              {s.balanceAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Balance</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(s.balanceAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
