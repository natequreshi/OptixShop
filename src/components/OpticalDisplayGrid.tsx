"use client";

import { Eye } from "lucide-react";

interface OpticalDisplayData {
  // Distance Vision
  distanceOdSphere: number | null;
  distanceOdCylinder: number | null;
  distanceOdAxis: number | null;
  distanceOsSphere: number | null;
  distanceOsCylinder: number | null;
  distanceOsAxis: number | null;
  // Near Vision
  nearOdSphere: number | null;
  nearOdCylinder: number | null;
  nearOdAxis: number | null;
  nearOsSphere: number | null;
  nearOsCylinder: number | null;
  nearOsAxis: number | null;
  // Add Power
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
  const fmtRx = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return "—";
    return val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2);
  };

  const DisplayCell = ({ 
    value, 
    bgColor 
  }: { 
    value: number | null; 
    bgColor?: string;
  }) => (
    <div 
      className={`px-3 py-2 text-sm font-mono text-center ${bgColor || 'bg-gray-50'}`}
    >
      {fmtRx(value)}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Eye size={16} className="text-primary-600" />
        <h3 className="text-sm font-semibold text-gray-800">Prescription Details</h3>
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
              <td className={`border border-gray-200 ${showColors ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <DisplayCell value={data.distanceOdSphere} bgColor={showColors ? 'bg-blue-50' : undefined} />
              </td>
              <td className={`border border-gray-200 ${showColors ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <DisplayCell value={data.distanceOdCylinder} bgColor={showColors ? 'bg-blue-50' : undefined} />
              </td>
              <td className={`border border-gray-200 ${showColors ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <DisplayCell value={data.distanceOdAxis} bgColor={showColors ? 'bg-blue-50' : undefined} />
              </td>
              <td className={`border border-gray-200 ${showColors ? 'bg-green-50' : 'bg-gray-50'}`}>
                <DisplayCell value={data.distanceOsSphere} bgColor={showColors ? 'bg-green-50' : undefined} />
              </td>
              <td className={`border border-gray-200 ${showColors ? 'bg-green-50' : 'bg-gray-50'}`}>
                <DisplayCell value={data.distanceOsCylinder} bgColor={showColors ? 'bg-green-50' : undefined} />
              </td>
              <td className={`border border-gray-200 ${showColors ? 'bg-green-50' : 'bg-gray-50'}`}>
                <DisplayCell value={data.distanceOsAxis} bgColor={showColors ? 'bg-green-50' : undefined} />
              </td>
              <td className="border border-gray-200 px-3 py-2 text-center text-xs text-gray-500">1</td>
            </tr>
            
            {/* Near Row */}
            <tr>
              <td className="border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">Near</td>
              <td className={`border border-gray-200 ${showColors ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <DisplayCell value={data.nearOdSphere} bgColor={showColors ? 'bg-blue-50' : undefined} />
              </td>
              <td className={`border border-gray-200 ${showColors ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <DisplayCell value={data.nearOdCylinder} bgColor={showColors ? 'bg-blue-50' : undefined} />
              </td>
              <td className={`border border-gray-200 ${showColors ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <DisplayCell value={data.nearOdAxis} bgColor={showColors ? 'bg-blue-50' : undefined} />
              </td>
              <td className={`border border-gray-200 ${showColors ? 'bg-green-50' : 'bg-gray-50'}`}>
                <DisplayCell value={data.nearOsSphere} bgColor={showColors ? 'bg-green-50' : undefined} />
              </td>
              <td className={`border border-gray-200 ${showColors ? 'bg-green-50' : 'bg-gray-50'}`}>
                <DisplayCell value={data.nearOsCylinder} bgColor={showColors ? 'bg-green-50' : undefined} />
              </td>
              <td className={`border border-gray-200 ${showColors ? 'bg-green-50' : 'bg-gray-50'}`}>
                <DisplayCell value={data.nearOsAxis} bgColor={showColors ? 'bg-green-50' : undefined} />
              </td>
              <td className="border border-gray-200 px-3 py-2 text-center text-xs text-gray-500">2</td>
            </tr>
            
            {/* Add Row */}
            <tr>
              <td className="border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">Add</td>
              <td className={`border border-gray-200 ${showColors ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <DisplayCell value={data.addOdSphere} bgColor={showColors ? 'bg-blue-50' : undefined} />
              </td>
              <td className={`border border-gray-200 ${showColors ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <DisplayCell value={data.addOdCylinder} bgColor={showColors ? 'bg-blue-50' : undefined} />
              </td>
              <td className={`border border-gray-200 ${showColors ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <DisplayCell value={data.addOdAxis} bgColor={showColors ? 'bg-blue-50' : undefined} />
              </td>
              <td className={`border border-gray-200 ${showColors ? 'bg-green-50' : 'bg-gray-50'}`}>
                <DisplayCell value={data.addOsSphere} bgColor={showColors ? 'bg-green-50' : undefined} />
              </td>
              <td className={`border border-gray-200 ${showColors ? 'bg-green-50' : 'bg-gray-50'}`}>
                <DisplayCell value={data.addOsCylinder} bgColor={showColors ? 'bg-green-50' : undefined} />
              </td>
              <td className={`border border-gray-200 ${showColors ? 'bg-green-50' : 'bg-gray-50'}`}>
                <DisplayCell value={data.addOsAxis} bgColor={showColors ? 'bg-green-50' : undefined} />
              </td>
              <td className="border border-gray-200 px-3 py-2 text-center text-xs text-gray-500">3</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {showColors && (
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
        </div>
      )}
    </div>
  );
}

export type { OpticalDisplayData };
