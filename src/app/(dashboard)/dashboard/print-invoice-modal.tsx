"use client";

import { X, Printer } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

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

export default function PrintInvoiceModal({
  sale,
  onClose,
}: {
  sale: Sale;
  onClose: () => void;
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between print:hidden">
          <h2 className="text-lg font-semibold dark:text-white">
            Print Invoice — {sale.invoiceNo}
          </h2>
          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
              <Printer size={16} /> Print
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
          <InvoiceTemplate sale={sale} />
        </div>
      </div>
    </div>
  );
}

function InvoiceTemplate({ sale }: { sale: Sale }) {
  return (
    <div
      className="w-full max-w-2xl mx-auto bg-white p-8 rounded-lg"
      style={{ fontSize: "14px" }}
    >
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .print-container { margin: 0; padding: 0; }
        }
      `}</style>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Invoice</h1>
        <p className="text-gray-600">{sale.invoiceNo}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Bill To:</h3>
          <p className="text-gray-900 font-medium">{sale.customerName}</p>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{formatDate(sale.saleDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Invoice #:</span>
            <span className="font-medium">{sale.invoiceNo}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2 text-gray-700 font-semibold">
                Item
              </th>
              <th className="text-center py-2 text-gray-700 font-semibold">
                Qty
              </th>
              <th className="text-right py-2 text-gray-700 font-semibold">
                Price
              </th>
              <th className="text-right py-2 text-gray-700 font-semibold">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="py-3 text-gray-900">{item.productName}</td>
                <td className="text-center py-3 text-gray-900">
                  {item.quantity}
                </td>
                <td className="text-right py-3 text-gray-900">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="text-right py-3 text-gray-900">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between py-2 text-gray-700">
            <span>Subtotal:</span>
            <span>{formatCurrency(sale.totalAmount - (sale.balanceAmount || 0))}</span>
          </div>
          {sale.balanceAmount > 0 && (
            <div className="flex justify-between py-2 text-gray-700 border-b border-gray-300">
              <span>Tax:</span>
              <span>{formatCurrency(0)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 text-lg font-bold text-gray-900">
            <span>Total:</span>
            <span>{formatCurrency(sale.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-300 pt-4 text-center text-sm text-gray-600">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
}
