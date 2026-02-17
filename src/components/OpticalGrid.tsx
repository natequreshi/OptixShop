"use client";

import { Eye } from "lucide-react";

interface OpticalData {
  // Distance Vision
  distanceOdSphere: string;
  distanceOdCylinder: string;
  distanceOdAxis: string;
  distanceOsSphere: string;
  distanceOsCylinder: string;
  distanceOsAxis: string;
  // Near Vision  
  nearOdSphere: string;
  nearOdCylinder: string;
  nearOdAxis: string;
  nearOsSphere: string;
  nearOsCylinder: string;
  nearOsAxis: string;
  // Add Power
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
  distanceOdSphere: "",
  distanceOdCylinder: "",
  distanceOdAxis: "",
  distanceOsSphere: "",
  distanceOsCylinder: "",
  distanceOsAxis: "",
  nearOdSphere: "",
  nearOdCylinder: "",
  nearOdAxis: "",
  nearOsSphere: "",
  nearOsCylinder: "",
  nearOsAxis: "",
  addOdSphere: "",
  addOdCylinder: "",
  addOdAxis: "",
  addOsSphere: "",
  addOsCylinder: "",
  addOsAxis: "",
};

export default function OpticalGrid({ data = defaultData, onChange, disabled = false }: OpticalGridProps) {
  const updateField = (field: keyof OpticalData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const GridInput = ({ 
    value, 
    onChange, 
    placeholder, 
    type = "text",
    step,
    min,
    max 
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
    step?: string;
    min?: string;
    max?: string;
  }) => (
    <input
      type={type}
      step={step}
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Eye size={16} className="text-primary-600" />
        <h3 className="text-sm font-semibold text-gray-800">Prescription (Rx)</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold text-gray-700">Eye Sight No</th>
              <th className="border border-gray-200 px-3 py-2 text-center text-xs font-semibold text-gray-700">Shp</th>
              <th className="border border-gray-200 px-3 py-2 text-center text-xs font-semibold text-gray-700">Cyl</th>
              <th className="border border-gray-200 px-3 py-2 text-center text-xs font-semibold text-gray-700">Axis</th>
              <th className="border border-gray-200 px-3 py-2 text-center text-xs font-semibold text-gray-700">Shp</th>
              <th className="border border-gray-200 px-3 py-2 text-center text-xs font-semibold text-gray-700">Cyl</th>
              <th className="border border-gray-200 px-3 py-2 text-center text-xs font-semibold text-gray-700">Axis</th>
              <th className="border border-gray-200 px-3 py-2 text-center text-xs font-semibold text-gray-700">Sr. No</th>
            </tr>
          </thead>
          <tbody>
            {/* Distance Row */}
            <tr>
              <td className="border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">Distance</td>
              <td className="border border-gray-200 px-2 py-1">
                <GridInput
                  value={data.distanceOdSphere}
                  onChange={(value) => updateField("distanceOdSphere", value)}
                  placeholder="±0.00"
                  type="number"
                  step="0.25"
                />
              </td>
              <td className="border border-gray-200 px-2 py-1">
                <GridInput
                  value={data.distanceOdCylinder}
                  onChange={(value) => updateField("distanceOdCylinder", value)}
                  placeholder="±0.00"
                  type="number"
                  step="0.25"
                />
              </td>
              <td className="border border-gray-200 px-2 py-1">
                <GridInput
                  value={data.distanceOdAxis}
                  onChange={(value) => updateField("distanceOdAxis", value)}
                  placeholder="0-180"
                  type="number"
                  step="1"
                  min="0"
                  max="180"
                />
              </td>
              <td className="border border-gray-200 px-2 py-1">
                <GridInput
                  value={data.distanceOsSphere}
                  onChange={(value) => updateField("distanceOsSphere", value)}
                  placeholder="±0.00"
                  type="number"
                  step="0.25"
                />
              </td>
              <td className="border border-gray-200 px-2 py-1">
                <GridInput
                  value={data.distanceOsCylinder}
                  onChange={(value) => updateField("distanceOsCylinder", value)}
                  placeholder="±0.00"
                  type="number"
                  step="0.25"
                />
              </td>
              <td className="border border-gray-200 px-2 py-1">
                <GridInput
                  value={data.distanceOsAxis}
                  onChange={(value) => updateField("distanceOsAxis", value)}
                  placeholder="0-180"
                  type="number"
                  step="1"
                  min="0"
                  max="180"
                />
              </td>
              <td className="border border-gray-200 px-3 py-2 text-center text-xs text-gray-500">1</td>
            </tr>
            
            {/* Near Row */}
            <tr>
              <td className="border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">Near</td>
              <td className="border border-gray-200 px-2 py-1">
                <GridInput
                  value={data.nearOdSphere}
                  onChange={(value) => updateField("nearOdSphere", value)}
                  placeholder="±0.00"
                  type="number"
                  step="0.25"
                />
              </td>
              <td className="border border-gray-200 px-2 py-1">
                <GridInput
                  value={data.nearOdCylinder}
                  onChange={(value) => updateField("nearOdCylinder", value)}
                  placeholder="±0.00"
                  type="number"
                  step="0.25"
                />
              </td>
              <td className="border border-gray-200 px-2 py-1">
                <GridInput
                  value={data.nearOdAxis}
                  onChange={(value) => updateField("nearOdAxis", value)}
                  placeholder="0-180"
                  type="number"
                  step="1"
                  min="0"
                  max="180"
                />
              </td>
              <td className="border border-gray-200 px-2 py-1">
                <GridInput
                  value={data.nearOsSphere}
                  onChange={(value) => updateField("nearOsSphere", value)}
                  placeholder="±0.00"
                  type="number"
                  step="0.25"
                />
              </td>
              <td className="border border-gray-200 px-2 py-1">
                <GridInput
                  value={data.nearOsCylinder}
                  onChange={(value) => updateField("nearOsCylinder", value)}
                  placeholder="±0.00"
                  type="number"
                  step="0.25"
                />
              </td>
              <td className="border border-gray-200 px-2 py-1">
                <GridInput
                  value={data.nearOsAxis}
                  onChange={(value) => updateField("nearOsAxis", value)}
                  placeholder="0-180"
                  type="number"
                  step="1"
                  min="0"
                  max="180"
                />
              </td>
              <td className="border border-gray-200 px-3 py-2 text-center text-xs text-gray-500">2</td>
            </tr>
            
            {/* Add Row */}
            <tr>
              <td className="border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">Add</td>
              <td className="border border-gray-200 px-2 py-1">
                <GridInput
                  value={data.addOdSphere}
                  onChange={(value) => updateField("addOdSphere", value)}
                  placeholder="+0.00"
                  type="number"
                  step="0.25"
                />
              </td>
              <td className="border border-gray-200 px-2 py-1">
                <GridInput
                  value={data.addOdCylinder}
                  onChange={(value) => updateField("addOdCylinder", value)}
                  placeholder="+0.00"
                  type="number"
                  step="0.25"
                />
              </td>
              <td className="border border-gray-200 px-2 py-1">
                <GridInput
                  value={data.addOdAxis}
                  onChange={(value) => updateField("addOdAxis", value)}
                  placeholder="0-180"
                  type="number"
                  step="1"
                  min="0"
                  max="180"
                />
              </td>
              <td className="border border-gray-200 px-2 py-1">
                <GridInput
                  value={data.addOsSphere}
                  onChange={(value) => updateField("addOsSphere", value)}
                  placeholder="+0.00"
                  type="number"
                  step="0.25"
                />
              </td>
              <td className="border border-gray-200 px-2 py-1">
                <GridInput
                  value={data.addOsCylinder}
                  onChange={(value) => updateField("addOsCylinder", value)}
                  placeholder="+0.00"
                  type="number"
                  step="0.25"
                />
              </td>
              <td className="border border-gray-200 px-2 py-1">
                <GridInput
                  value={data.addOsAxis}
                  onChange={(value) => updateField("addOsAxis", value)}
                  placeholder="0-180"
                  type="number"
                  step="1"
                  min="0"
                  max="180"
                />
              </td>
              <td className="border border-gray-200 px-3 py-2 text-center text-xs text-gray-500">3</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
            Right Eye (OD)
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            Left Eye (OS)
          </span>
        </div>
        <span>Optional — enter prescription data if available</span>
      </div>
    </div>
  );
}

export type { OpticalData };
