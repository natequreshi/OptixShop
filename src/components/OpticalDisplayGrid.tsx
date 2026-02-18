"use client";

import { Eye } from "lucide-react";

interface OpticalDisplayData {
  distanceOdSphere: number | null;
  distanceOdCylinder: number | null;
  distanceOdAxis: number | null;
  distanceOsSphere: number | null;
  distanceOsCylinder: number | null;
  distanceOsAxis: number | null;
  nearOdSphere: number | null;
  nearOdCylinder: number | null;
  nearOdAxis: number | null;
  nearOsSphere: number | null;
  nearOsCylinder: number | null;
  nearOsAxis: number | null;
  addOdSphere: number | null;
  addOdCylinder: number | null;
  addOdAxis: number | null;
  addOsSphere: number | null;
  addOsCylinder: number | null;
  addOsAxis: number | null;
}

interface OpticalDisplayGridProps {
  data: OpticalDisplayData;
  showColors?: boolean;
}

export default function OpticalDisplayGrid({ data, showColors = true }: OpticalDisplayGridProps) {
  const fmt = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return "—";
    return val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2);
  };

  const fmtAxis = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return "—";
    return `${val}°`;
  };

  const odBg = showColors ? "bg-blue-50/60" : "bg-gray-50";
  const osBg = showColors ? "bg-green-50/60" : "bg-gray-50";

  type RowConfig = { label: string; od: [number | null, number | null, number | null]; os: [number | null, number | null, number | null] };

  const rows: RowConfig[] = [
    { label: "Distance", od: [data.distanceOdSphere, data.distanceOdCylinder, data.distanceOdAxis], os: [data.distanceOsSphere, data.distanceOsCylinder, data.distanceOsAxis] },
    { label: "Near", od: [data.nearOdSphere, data.nearOdCylinder, data.nearOdAxis], os: [data.nearOsSphere, data.nearOsCylinder, data.nearOsAxis] },
    { label: "Add", od: [data.addOdSphere, data.addOdCylinder, data.addOdAxis], os: [data.addOsSphere, data.addOsCylinder, data.addOsAxis] },
  ];

  const hasAnyData = rows.some(r => [...r.od, ...r.os].some(v => v !== null && v !== undefined));
  if (!hasAnyData) return null;

  return (
    <div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col style={{ width: "12%" }} />
            <col style={{ width: "14.66%" }} />
            <col style={{ width: "14.66%" }} />
            <col style={{ width: "14.66%" }} />
            <col style={{ width: "14.66%" }} />
            <col style={{ width: "14.66%" }} />
            <col style={{ width: "14.66%" }} />
          </colgroup>
          <thead>
            <tr>
              <th className="bg-gray-50 border-b border-r border-gray-200 px-2 py-2 text-xs font-semibold text-gray-500 text-left">Type</th>
              <th className="bg-blue-50/60 border-b border-r border-gray-200 px-2 py-2 text-xs font-semibold text-blue-700 text-center" colSpan={3}>OD (Right Eye)</th>
              <th className="bg-green-50/60 border-b border-gray-200 px-2 py-2 text-xs font-semibold text-green-700 text-center" colSpan={3}>OS (Left Eye)</th>
            </tr>
            <tr>
              <th className="bg-gray-50 border-b border-r border-gray-200 px-2 py-1.5 text-[11px] font-medium text-gray-400"></th>
              <th className="bg-blue-50/30 border-b border-r border-gray-200 px-2 py-1.5 text-[11px] font-semibold text-gray-600 text-center uppercase">Sph</th>
              <th className="bg-blue-50/30 border-b border-r border-gray-200 px-2 py-1.5 text-[11px] font-semibold text-gray-600 text-center uppercase">Cyl</th>
              <th className="bg-blue-50/30 border-b border-r border-gray-200 px-2 py-1.5 text-[11px] font-semibold text-gray-600 text-center uppercase">Axis</th>
              <th className="bg-green-50/30 border-b border-r border-gray-200 px-2 py-1.5 text-[11px] font-semibold text-gray-600 text-center uppercase">Sph</th>
              <th className="bg-green-50/30 border-b border-r border-gray-200 px-2 py-1.5 text-[11px] font-semibold text-gray-600 text-center uppercase">Cyl</th>
              <th className="bg-green-50/30 border-b border-gray-200 px-2 py-1.5 text-[11px] font-semibold text-gray-600 text-center uppercase">Axis</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i < rows.length - 1 ? "border-b border-gray-200" : ""}>
                <td className="bg-gray-50 border-r border-gray-200 px-3 py-2 text-xs font-medium text-gray-700">{row.label}</td>
                <td className={`${odBg} border-r border-gray-100 px-2 py-2 text-sm font-mono text-center`}>{fmt(row.od[0])}</td>
                <td className={`${odBg} border-r border-gray-100 px-2 py-2 text-sm font-mono text-center`}>{fmt(row.od[1])}</td>
                <td className={`${odBg} border-r border-gray-200 px-2 py-2 text-sm font-mono text-center`}>{fmtAxis(row.od[2])}</td>
                <td className={`${osBg} border-r border-gray-100 px-2 py-2 text-sm font-mono text-center`}>{fmt(row.os[0])}</td>
                <td className={`${osBg} border-r border-gray-100 px-2 py-2 text-sm font-mono text-center`}>{fmt(row.os[1])}</td>
                <td className={`${osBg} px-2 py-2 text-sm font-mono text-center`}>{fmtAxis(row.os[2])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showColors && (
        <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-100 border border-blue-200 inline-block" />
            Right Eye (OD)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-green-100 border border-green-200 inline-block" />
            Left Eye (OS)
          </span>
        </div>
      )}
    </div>
  );
}

export type { OpticalDisplayData };
