import React, { useEffect, useState } from "react";
import { Loader2, User, Lock } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerPushToken } from "../../utils/pushNotification";

export default function Login() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Redirect if token exists
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (token && role) {
      if (role === "Waiter") navigate("/waiterHome", { replace: true });
      else if (role === "Chef") navigate("/chefHome", { replace: true });
      else navigate("/accountHome", { replace: true });
    }
  }, [token, navigate]);

  const handleLogin = async () => {
    setError("");

    if (!form.name || !form.password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, form);
      const { token, user } = res.data;

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("username", user.name);
      const userId = user.id.toString(); // convert to string
      localStorage.setItem("userid", userId);
      setUser(user);
      // Try registering for push notifications (will request permission)
      registerPushToken().then((r) => {
        if (r.ok) console.log("Push token registered");
        else console.log("Push registration:", r.message || r);
      });
      toast.success(`Login success as ${user.role}`);

      // Redirect based on role
      if (user.role === "Waiter") navigate("/waiterHome", { replace: true });
      else if (user.role === "Chef") navigate("/chefHome", { replace: true });
      else navigate("/accountHome", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f6f1e9] flex flex-col items-center px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#e9e2d8] flex items-center justify-center mx-auto text-2xl">
          🍃
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#6b3f1d] mt-3">
          Bamboo Cottage
        </h1>
        <div className="flex justify-center gap-2 mt-4">
          <span className="w-8 sm:w-10 h-1 bg-[#d8c6a5] rounded" />
          <span className="w-16 sm:w-20 h-1 bg-[#6b3f1d] rounded" />
          <span className="w-8 sm:w-10 h-1 bg-[#d8c6a5] rounded" />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-[#efe7dc] rounded-2xl shadow-xl p-6 sm:p-8 mt-8 sm:mt-10">
        <h2 className="text-center text-2xl sm:text-3xl font-serif text-[#6b3f1d]">
          Sign In
        </h2>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-300 text-red-700 font-bold text-sm rounded-lg px-4 py-2 text-center">
            {error}
          </div>
        )}

        {/* Name */}
        <label className="block text-[#6b3f1d] mt-6 mb-1">Your Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a57c52]" />
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full pl-10 pr-3 py-3 rounded-lg bg-[#faf7f2] border border-[#d7c2a3] focus:outline-none focus:ring-2 focus:ring-[#c2a679]"
            placeholder="Enter your name"
          />
        </div>

        {/* Password */}
        <label className="block text-[#6b3f1d] mt-4 mb-1">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a57c52]" />
          <input
            type="password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            className="w-full pl-10 pr-3 py-3 rounded-lg bg-[#faf7f2] border border-[#d7c2a3] focus:outline-none focus:ring-2 focus:ring-[#c2a679]"
            placeholder="Enter password"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-6 py-3 rounded-lg bg-[#6b3f1d] text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-70"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </div>

      <div className="h-6 sm:h-10" />
    </div>
  );
}
