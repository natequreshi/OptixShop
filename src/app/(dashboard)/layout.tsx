"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Script from "next/script";
import { useState, useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [gmapsConfig, setGmapsConfig] = useState({ apiKey: "", enabled: false });

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then((settings: Record<string, string>) => {
        setIsDarkMode(settings.dark_mode === "true");
        setGmapsConfig({
          apiKey: settings.google_maps_api_key || "",
          enabled: settings.google_maps_enabled === "true",
        });
      });
  }, []);

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {gmapsConfig.enabled && gmapsConfig.apiKey && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${gmapsConfig.apiKey}&libraries=places`}
            strategy="lazyOnload"
          />
        )}
        
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
