import React from "react";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f1e9] text-center px-4">
      <h1 className="text-6xl font-bold text-[#6b3f1d] mb-4">403</h1>
      <h2 className="text-2xl font-semibold mb-4">Unauthorized Access</h2>
      <p className="text-gray-700 mb-6">
        You do not have permission to view this page.
      </p>
      <button
        onClick={() => navigate("/")}
        className="bg-[#6b3f1d] text-white px-6 py-2 rounded hover:bg-[#59311a] transition"
      >
        Go to Login
      </button>
    </div>
  );
}
