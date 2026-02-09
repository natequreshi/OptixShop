import { prisma } from "@/lib/prisma";
import SettingsClient from "./client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settingsRaw = await prisma.setting.findMany();
  const settings: Record<string, string> = {};
  for (const s of settingsRaw) settings[s.key] = s.value;
  return <SettingsClient settings={settings} />;
}
