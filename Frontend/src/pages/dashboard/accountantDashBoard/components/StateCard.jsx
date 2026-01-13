import React from "react";

export default function StateCard({ icon, label, value, color }) {
  return (
    <div className="bg-[#FBF7F1] border border-[#D6B894] rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.06)] p-6">
      <div className="flex items-center gap-4">
        <div
          className="p-3 rounded-full"
          style={{ backgroundColor: color ? color + "20" : "#ccc20" }}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-[#8A6A4F]">{label}</p>
          <p className="text-2xl font-semibold" style={{ color: color || "#000" }}>
            ₹{value ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}
