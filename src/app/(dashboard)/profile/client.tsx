"use client";

import { useState } from "react";
import { User, Mail, Shield, Calendar, Lock, Save } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

interface UserProfile {
  id: string; username: string; fullName: string;
  email: string; role: string; createdAt: string;
}

export default function ProfileClient({ user }: { user: UserProfile }) {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [saving, setSaving] = useState(false);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email }),
    });
    if (res.ok) toast.success("Profile updated!");
    else toast.error("Failed to update profile");
    setSaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPwd !== confirmPwd) { toast.error("Passwords don't match"); return; }
    if (newPwd.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setChangingPwd(true);
    const res = await fetch("/api/profile/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
    });
    if (res.ok) {
      toast.success("Password changed!");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Failed to change password");
    }
    setChangingPwd(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account information</p>
      </div>

      {/* Profile Info Card */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-2xl font-bold">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user.fullName}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1"><Shield size={14} /> {user.role}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Username</label>
              <input value={user.username} disabled className="input bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="label">Role</label>
              <input value={user.role} disabled className="input bg-gray-50 text-gray-500 cursor-not-allowed capitalize" />
            </div>
          </div>
          <div>
            <label className="label flex items-center gap-1"><User size={14} /> Full Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label flex items-center gap-1"><Mail size={14} /> Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <Save size={16} /> {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <Lock size={18} className="text-primary-600" />
          <h3 className="text-sm font-semibold text-gray-800">Change Password</h3>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} className="input" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">New Password</label>
              <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className="input" required />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} className="input" required />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={changingPwd} className="btn-primary">
              {changingPwd ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
