"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, FileText, ShoppingBag, Microscope, Gift, Eye, Download, Calendar, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface CustomerData {
  id: string;
  customerNo: string;
  name: string;
  email?: string;
  phone?: string;
  loyaltyPoints: number;
}

interface Prescription {
  id: string;
  prescriptionNo: string;
  prescribedBy?: string;
  prescriptionDate: string;
  photoUrl?: string;
  odSphere?: number;
  odCylinder?: number;
  odAxis?: number;
  osSphere?: number;
  osCylinder?: number;
  osAxis?: number;
}

interface Order {
  id: string;
  invoiceNo: string;
  saleDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  paymentStatus: string;
  items: any[];
}

interface LabOrder {
  id: string;
  labOrderNo: string;
  productType: string;
  status: string;
  createdAt: string;
  expectedDate?: string;
}

export default function CustomerPortalPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [activeTab, setActiveTab] = useState<"prescriptions" | "orders" | "lab" | "profile">("prescriptions");
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    const data = localStorage.getItem("customerData");

    if (!token || !data) {
      router.push("/customer-login");
      return;
    }

    setCustomer(JSON.parse(data));
    fetchData(token);
  }, [router]);

  async function fetchData(token: string) {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [prescRes, ordersRes, labRes] = await Promise.all([
        fetch("/api/customer-portal/prescriptions", { headers }),
        fetch("/api/customer-portal/orders", { headers }),
        fetch("/api/customer-portal/lab-orders", { headers }),
      ]);

      if (prescRes.ok) setPrescriptions(await prescRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (labRes.ok) setLabOrders(await labRes.json());
    } catch (error) {
      toast.error("Failed to load data");
    }
    setLoading(false);
  }

  function handleLogout() {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerData");
    router.push("/customer-login");
  }

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{customer.name}</h2>
                <p className="text-xs text-gray-500">{customer.customerNo}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500">Loyalty Points</p>
                <p className="text-lg font-bold text-blue-600">{customer.loyaltyPoints}</p>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: "prescriptions", label: "Prescriptions", icon: FileText },
              { id: "orders", label: "Orders", icon: ShoppingBag },
              { id: "lab", label: "Lab Orders", icon: Microscope },
              { id: "profile", label: "Profile", icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Prescriptions Tab */}
            {activeTab === "prescriptions" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">My Prescriptions</h3>
                {prescriptions.length === 0 ? (
                  <div className="card p-8 text-center">
                    <FileText size={48} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">No prescriptions found</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {prescriptions.map((rx) => (
                      <div key={rx.id} className="card p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{rx.prescriptionNo}</h4>
                            <p className="text-sm text-gray-500">Dr. {rx.prescribedBy || "N/A"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{new Date(rx.prescriptionDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 font-medium mb-1">Right Eye (OD)</p>
                            <div className="space-y-0.5 text-xs">
                              <p>Sphere: {rx.odSphere ?? "—"}</p>
                              <p>Cylinder: {rx.odCylinder ?? "—"}</p>
                              <p>Axis: {rx.odAxis ?? "—"}°</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium mb-1">Left Eye (OS)</p>
                            <div className="space-y-0.5 text-xs">
                              <p>Sphere: {rx.osSphere ?? "—"}</p>
                              <p>Cylinder: {rx.osCylinder ?? "—"}</p>
                              <p>Axis: {rx.osAxis ?? "—"}°</p>
                            </div>
                          </div>
                        </div>

                        {rx.photoUrl && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <a href={rx.photoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                              <Eye size={14} /> View Prescription Image
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">My Orders</h3>
                {orders.length === 0 ? (
                  <div className="card p-8 text-center">
                    <ShoppingBag size={48} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="card p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{order.invoiceNo}</h4>
                            <p className="text-sm text-gray-500">{new Date(order.saleDate).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                              order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {order.paymentStatus.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 text-sm">
                          {order.items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-gray-600">
                              <span>{item.product?.name || item.productName} × {item.quantity}</span>
                              <span>{formatCurrency(item.total)}</span>
                            </div>
                          ))}
                        </div>

                        {order.balanceAmount > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                            <span className="text-gray-500">Balance Due</span>
                            <span className="font-semibold text-red-600">{formatCurrency(order.balanceAmount)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Lab Orders Tab */}
            {activeTab === "lab" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Lab Orders</h3>
                {labOrders.length === 0 ? (
                  <div className="card p-8 text-center">
                    <Microscope size={48} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">No lab orders found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {labOrders.map((lab) => (
                      <div key={lab.id} className="card p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{lab.labOrderNo}</h4>
                            <p className="text-sm text-gray-500">{lab.productType}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(lab.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            lab.status === "ready" ? "bg-green-100 text-green-700" :
                            lab.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {lab.status.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">My Profile</h3>
                <div className="card p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Customer ID</label>
                      <p className="font-medium">{customer.customerNo}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Name</label>
                      <p className="font-medium">{customer.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Phone</label>
                      <p className="font-medium">{customer.phone || "—"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Email</label>
                      <p className="font-medium">{customer.email || "—"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Loyalty Points</label>
                      <p className="font-medium text-blue-600">{customer.loyaltyPoints}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
