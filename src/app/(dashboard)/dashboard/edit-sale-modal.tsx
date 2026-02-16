"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import toast from "react-hot-toast";

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

export default function EditSaleModal({
  sale,
  onClose,
  onSaved,
}: {
  sale: Sale;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [paidAmount, setPaidAmount] = useState(sale.paidAmount.toString());
  const [status, setStatus] = useState(sale.status);

  const balance = Math.max(0, sale.totalAmount - parseFloat(paidAmount || "0"));

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`/api/sales/${sale.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paidAmount: parseFloat(paidAmount),
          status,
        }),
      });
      if (res.ok) {
        toast.success("Sale updated");
        onSaved();
      } else {
        toast.error("Failed to update sale");
      }
    } catch {
      toast.error("Error updating sale");
    }
    setLoading(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit Sale — {sale.invoiceNo}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="label">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input"
            >
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div>
            <label className="label">Paid Amount</label>
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="input"
            />
            <p className="text-xs text-gray-400 mt-1">
              Total: {formatCurrency(sale.totalAmount)} · Balance:{" "}
              <span
                className={cn(balance > 0 ? "text-red-600 font-medium" : "")}
              >
                {formatCurrency(balance)}
              </span>
            </p>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
