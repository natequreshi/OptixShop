import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";
import Script from "next/script";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Load Google Maps API key from settings for address autocomplete
  const gmapsSetting = await prisma.setting.findUnique({ where: { key: "google_maps_api_key" } });
  const gmapsEnabled = await prisma.setting.findUnique({ where: { key: "google_maps_enabled" } });
  const gmapsApiKey = gmapsSetting?.value || "";
  const gmapsOn = gmapsEnabled?.value === "true";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {gmapsOn && gmapsApiKey && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${gmapsApiKey}&libraries=places`}
          strategy="lazyOnload"
        />
      )}
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
