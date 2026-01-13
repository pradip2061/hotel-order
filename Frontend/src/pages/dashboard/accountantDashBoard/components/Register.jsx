import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    password: "",
    role: "Waiter",
  });

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.password) {
      toast.error("Name and password required");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${BASE_URL}/auth/register`,
        {
          name: form.name,
          password: form.password,
          role: form.role,
        },
        { headers: { Authorization: `${token}` } }
      );

      toast.success(res.data.message);

      setForm({
        name: "",
        password: "",
        role: "user",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm h-100 mt-10 bg-white p-6 rounded-lg shadow shadow-black"
      >
        {/* 🔙 Back Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 mb-3 hover:underline"
        >
          ← Back
        </button>

        <h2 className="text-xl font-semibold text-center mb-4">
          Register
        </h2>

        {/* Username */}
        <div className="mb-3">
          <label className="text-sm text-gray-600">Username</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter username"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          />
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="text-sm text-gray-600">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          />
        </div>

        {/* Role */}
        <div className="mb-4">
          <label className="text-sm text-gray-600">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="Accountant">Accountant</option>
            <option value="Chef">Chef</option>
            <option value="Waiter">Waiter</option>
          </select>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full bg-green-600 text-white
            py-2 rounded font-medium
            disabled:opacity-60
          "
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
