"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Phone, Lock, Mail, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

interface AuthConfig {
  otpEnabled: boolean;
  passwordEnabled: boolean;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  smsOtp: boolean;
}

export default function CustomerLoginPage() {
  const router = useRouter();
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [loginMethod, setLoginMethod] = useState<"otp" | "password">("otp");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch auth configuration on mount
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/customer-auth/config");
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
          // Set default login method based on what's enabled
          if (!data.otpEnabled && data.passwordEnabled) {
            setLoginMethod("password");
          } else {
            setLoginMethod("otp");
          }
        }
      } catch (error) {
        console.error("Failed to fetch config:", error);
        // Default to both enabled
        setConfig({ otpEnabled: true, passwordEnabled: true, emailNotifications: false, whatsappNotifications: false, smsOtp: false });
      }
    }
    fetchConfig();
  }, []);

  // Web OTP API - Auto-fill OTP from SMS
  useEffect(() => {
    if (!otpSent) return;

    // Check if browser supports Web OTP API
    if ('OTPCredential' in window) {
      const abortController = new AbortController();

      navigator.credentials.get({
        // @ts-ignore - OTPCredential is not in TypeScript types yet
        otp: { transport: ['sms'] },
        signal: abortController.signal
      }).then((otpCredential: any) => {
        if (otpCredential?.code) {
          setOtp(otpCredential.code);
          toast.success("OTP auto-filled!");
        }
      }).catch((err) => {
        console.log("OTP auto-fill not available:", err);
      });

      return () => abortController.abort();
    }
  }, [otpSent]);

  async function handleSendOtp() {
    if (!phoneOrEmail) {
      toast.error("Please enter phone or email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/customer-auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneOrEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP sent successfully!");
        setOtpSent(true);
        // Show OTP in console for demo (remove in production)
        if (data.debug?.otp) {
          console.log("🔐 OTP:", data.debug.otp);
          toast.success(`Demo OTP: ${data.debug.otp}`, { duration: 8000 });
        }
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("Failed to send OTP");
    }
    setLoading(false);
  }

  async function handleVerifyOtp() {
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/customer-auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneOrEmail, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("customerToken", data.token);
        localStorage.setItem("customerData", JSON.stringify(data.customer));
        toast.success("Login successful!");
        router.push("/customer-portal");
      } else {
        toast.error(data.error || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Failed to verify OTP");
    }
    setLoading(false);
  }

  async function handlePasswordLogin() {
    if (!phoneOrEmail || !password) {
      toast.error("Please enter phone/email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/customer-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneOrEmail, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("customerToken", data.token);
        localStorage.setItem("customerData", JSON.stringify(data.customer));
        toast.success("Login successful!");
        router.push("/customer-portal");
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (error) {
      toast.error("Failed to login");
    }
    setLoading(false);
  }

  // Show loading while config is being fetched
  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Portal</h1>
          <p className="text-gray-500 mt-2">Access your prescriptions & orders</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Toggle Buttons - Only show if both methods are enabled */}
          {config.otpEnabled && config.passwordEnabled && (
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => { setLoginMethod("otp"); setOtpSent(false); }}
                className={`flex-1 py-2.5 rounded-lg font-medium transition ${
                  loginMethod === "otp"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Login with OTP
              </button>
              <button
                onClick={() => setLoginMethod("password")}
                className={`flex-1 py-2.5 rounded-lg font-medium transition ${
                  loginMethod === "password"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Login with Password
              </button>
            </div>
          )}

          {/* OTP Login - Only show if OTP is enabled */}
          {config.otpEnabled && loginMethod === "otp" && (
            <div className="space-y-4">
              <div>
                <label className="label flex items-center gap-2">
                  <Phone size={16} />
                  Phone Number or Email
                </label>
                <input
                  type="text"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  placeholder="+92-300-1234567 or email@example.com"
                  className="input"
                  disabled={otpSent}
                />
              </div>

              {!otpSent ? (
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="btn-primary w-full py-3"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              ) : (
                <>
                  <div>
                    <label className="label flex items-center gap-2">
                      <Lock size={16} />
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      pattern="\d{6}"
                      className="input text-center text-2xl tracking-widest"
                    />
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      OTP will auto-fill if received via SMS
                    </p>
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 6}
                    className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Verifying..." : "Verify & Login"}
                  </button>

                  <button
                    onClick={() => setOtpSent(false)}
                    className="text-sm text-blue-600 hover:text-blue-700 w-full text-center"
                  >
                    Change phone/email
                  </button>
                </>
              )}
            </div>
          )}

          {/* Password Login - Only show if Password is enabled */}
          {config.passwordEnabled && loginMethod === "password" && (
            <div className="space-y-4">
              <div>
                <label className="label flex items-center gap-2">
                  <Mail size={16} />
                  Phone Number or Email
                </label>
                <input
                  type="text"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  placeholder="+92-300-1234567 or email@example.com"
                  className="input"
                />
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Lock size={16} />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handlePasswordLogin}
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="text-center">
                <button
                  onClick={() => setLoginMethod("otp")}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Forgot password? Use OTP login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Don't have an account? Contact the store</p>
          <button
            onClick={() => router.push("/login")}
            className="text-blue-600 hover:text-blue-700 mt-2"
          >
            Staff Login →
          </button>
        </div>
      </div>
    </div>
  );
}
