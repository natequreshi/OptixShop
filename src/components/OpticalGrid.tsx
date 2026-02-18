"use client";

import { Eye } from "lucide-react";

interface OpticalData {
  distanceOdSphere: string;
  distanceOdCylinder: string;
  distanceOdAxis: string;
  distanceOsSphere: string;
  distanceOsCylinder: string;
  distanceOsAxis: string;
  nearOdSphere: string;
  nearOdCylinder: string;
  nearOdAxis: string;
  nearOsSphere: string;
  nearOsCylinder: string;
  nearOsAxis: string;
  addOdSphere: string;
  addOdCylinder: string;
  addOdAxis: string;
  addOsSphere: string;
  addOsCylinder: string;
  addOsAxis: string;
}

interface OpticalGridProps {
  data: OpticalData;
  onChange: (data: OpticalData) => void;
  disabled?: boolean;
}

const defaultData: OpticalData = {
  distanceOdSphere: "", distanceOdCylinder: "", distanceOdAxis: "",
  distanceOsSphere: "", distanceOsCylinder: "", distanceOsAxis: "",
  nearOdSphere: "", nearOdCylinder: "", nearOdAxis: "",
  nearOsSphere: "", nearOsCylinder: "", nearOsAxis: "",
  addOdSphere: "", addOdCylinder: "", addOdAxis: "",
  addOsSphere: "", addOsCylinder: "", addOsAxis: "",
};

export default function OpticalGrid({ data = defaultData, onChange, disabled = false }: OpticalGridProps) {
  const update = (field: keyof OpticalData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const Cell = ({ value, field, placeholder, step = "0.25", min, max }: {
    value: string; field: keyof OpticalData; placeholder: string;
    step?: string; min?: string; max?: string;
  }) => (
    <input
      type="number"
      step={step}
      min={min}
      max={max}
      value={value}
      onChange={(e) => update(field, e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-2 py-1.5 text-sm text-center border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white rounded disabled:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );

  type RowConfig = { label: string; fields: { od: [keyof OpticalData, keyof OpticalData, keyof OpticalData]; os: [keyof OpticalData, keyof OpticalData, keyof OpticalData] } };

  const rows: RowConfig[] = [
    { label: "Distance", fields: { od: ["distanceOdSphere", "distanceOdCylinder", "distanceOdAxis"], os: ["distanceOsSphere", "distanceOsCylinder", "distanceOsAxis"] } },
    { label: "Near", fields: { od: ["nearOdSphere", "nearOdCylinder", "nearOdAxis"], os: ["nearOsSphere", "nearOsCylinder", "nearOsAxis"] } },
    { label: "Add", fields: { od: ["addOdSphere", "addOdCylinder", "addOdAxis"], os: ["addOsSphere", "addOsCylinder", "addOsAxis"] } },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Eye size={16} className="text-primary-600" />
        <h3 className="text-sm font-semibold text-gray-800">Prescription (Rx)</h3>
      </div>

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
              <th className="bg-blue-50/30 border-b border-r border-gray-200 px-2 py-1.5 text-[11px] font-semibold text-gray-600 text-center">Sph</th>
              <th className="bg-blue-50/30 border-b border-r border-gray-200 px-2 py-1.5 text-[11px] font-semibold text-gray-600 text-center">Cyl</th>
              <th className="bg-blue-50/30 border-b border-r border-gray-200 px-2 py-1.5 text-[11px] font-semibold text-gray-600 text-center">Axis</th>
              <th className="bg-green-50/30 border-b border-r border-gray-200 px-2 py-1.5 text-[11px] font-semibold text-gray-600 text-center">Sph</th>
              <th className="bg-green-50/30 border-b border-r border-gray-200 px-2 py-1.5 text-[11px] font-semibold text-gray-600 text-center">Cyl</th>
              <th className="bg-green-50/30 border-b border-gray-200 px-2 py-1.5 text-[11px] font-semibold text-gray-600 text-center">Axis</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i < rows.length - 1 ? "border-b border-gray-200" : ""}>
                <td className="bg-gray-50 border-r border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700">{row.label}</td>
                <td className="bg-blue-50/20 border-r border-gray-100 px-0.5 py-0.5">
                  <Cell value={data[row.fields.od[0]]} field={row.fields.od[0]} placeholder="±0.00" />
                </td>
                <td className="bg-blue-50/20 border-r border-gray-100 px-0.5 py-0.5">
                  <Cell value={data[row.fields.od[1]]} field={row.fields.od[1]} placeholder="±0.00" />
                </td>
                <td className="bg-blue-50/20 border-r border-gray-200 px-0.5 py-0.5">
                  <Cell value={data[row.fields.od[2]]} field={row.fields.od[2]} placeholder="0-180" step="1" min="0" max="180" />
                </td>
                <td className="bg-green-50/20 border-r border-gray-100 px-0.5 py-0.5">
                  <Cell value={data[row.fields.os[0]]} field={row.fields.os[0]} placeholder="±0.00" />
                </td>
                <td className="bg-green-50/20 border-r border-gray-100 px-0.5 py-0.5">
                  <Cell value={data[row.fields.os[1]]} field={row.fields.os[1]} placeholder="±0.00" />
                </td>
                <td className="bg-green-50/20 px-0.5 py-0.5">
                  <Cell value={data[row.fields.os[2]]} field={row.fields.os[2]} placeholder="0-180" step="1" min="0" max="180" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-4 text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-100 border border-blue-200 inline-block" />
            Right Eye (OD)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-green-100 border border-green-200 inline-block" />
            Left Eye (OS)
          </span>
        </div>
        <span className="text-[11px] text-gray-400">Optional — enter prescription data if available</span>
      </div>
    </div>
  );
}

export type { OpticalData };
