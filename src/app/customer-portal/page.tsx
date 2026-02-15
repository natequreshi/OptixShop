"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, LogOut, Calendar, ShoppingBag, User, FileText } from "lucide-react";
import toast from "react-hot-toast";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

interface Prescription {
  id: string;
  prescriptionDate: string;
  createdAt: string;
  odSphere: number | null;
  odCylinder: number | null;
  odAxis: number | null;
  osSphere: number | null;
  osCylinder: number | null;
  osAxis: number | null;
  prescribedBy: string | null;
}

interface Sale {
  id: string;
  invoiceNo: string;
  saleDate: string;
  totalAmount: number;
  paymentStatus: string;
}

export default function CustomerPortalPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"prescriptions" | "orders">("prescriptions");

  useEffect(() => {
    // Check if customer is logged in
    const sessionData = localStorage.getItem("customerSession");
    if (!sessionData) {
      router.push("/customer-login");
      return;
    }

    const customerData = JSON.parse(sessionData);
    setCustomer(customerData);

    // Fetch customer data
    fetchCustomerData(customerData.id);
  }, [router]);

  async function fetchCustomerData(customerId: string) {
    try {
      const [prescRes, salesRes] = await Promise.all([
        fetch(`/api/customers/${customerId}/history`),
        fetch(`/api/customers/${customerId}/history`),
      ]);

      if (prescRes.ok) {
        const data = await prescRes.json();
        setPrescriptions(data.prescriptions || []);
        setSales(data.sales || []);
      }
    } catch (err) {
      console.error("Failed to fetch customer data", err);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("customerSession");
    toast.success("Logged out successfully");
    router.push("/customer-login");
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <User className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {customer.firstName} {customer.lastName}
                </h1>
                <p className="text-sm text-gray-500">{customer.phone}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("prescriptions")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === "prescriptions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Eye size={18} />
                My Prescriptions
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === "orders"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <ShoppingBag size={18} />
                My Orders
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading...</p>
              </div>
            ) : activeTab === "prescriptions" ? (
              <div className="space-y-4">
                {prescriptions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No prescriptions found</p>
                  </div>
                ) : (
                  prescriptions.map((rx) => (
                    <div key={rx.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(rx.prescriptionDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        {rx.prescribedBy && (
                          <span className="text-xs text-gray-500">Dr. {rx.prescribedBy}</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-blue-900 mb-2">Right Eye (OD)</p>
                          <div className="space-y-1 font-mono text-sm">
                            <p><span className="text-gray-500">SPH:</span> <span className="font-semibold">{rx.odSphere ?? "—"}</span></p>
                            <p><span className="text-gray-500">CYL:</span> <span className="font-semibold">{rx.odCylinder ?? "—"}</span></p>
                            <p><span className="text-gray-500">AXIS:</span> <span className="font-semibold">{rx.odAxis ?? "—"}°</span></p>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-green-900 mb-2">Left Eye (OS)</p>
                          <div className="space-y-1 font-mono text-sm">
                            <p><span className="text-gray-500">SPH:</span> <span className="font-semibold">{rx.osSphere ?? "—"}</span></p>
                            <p><span className="text-gray-500">CYL:</span> <span className="font-semibold">{rx.osCylinder ?? "—"}</span></p>
                            <p><span className="text-gray-500">AXIS:</span> <span className="font-semibold">{rx.osAxis ?? "—"}°</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {sales.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No orders found</p>
                  </div>
                ) : (
                  sales.map((sale) => (
                    <div key={sale.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{sale.invoiceNo}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(sale.saleDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            Rs. {sale.totalAmount.toLocaleString()}
                          </p>
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                              sale.paymentStatus === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {sale.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
