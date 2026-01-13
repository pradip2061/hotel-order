import { useState, useEffect } from "react";
import axios from "axios";
import { Edit2, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMenuItems, updateNewMenu } from "../../../store/order/orderSlice";
import { toast } from "react-toastify";

export default function MenuManagement() {
  const [form, setForm] = useState({ name: "", price: "" });
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false); // Add/Update
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // User role
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { menuItems } = useSelector((state) => state.order);

  // ================= FETCH MENU =================
  useEffect(() => {
    dispatch(fetchMenuItems(token));
  }, [dispatch, token]);

  // ================= ADD / UPDATE ITEM =================
  const handleSave = async () => {
    if (!form.name || !form.price) {
      alert("⚠️ Name and price are required");
      return;
    }

    setLoading(true);

    try {
      let res;
      if (editingId) {
        // UPDATE
        res = await axios.put(`${BASE_URL}/menu/updateMenu/${editingId}`, form, {
          headers: { Authorization: token },
        });
        toast.success("✅ Item updated successfully");
      } else {
        // ADD
        res = await axios.post(`${BASE_URL}/menu/createMenu`, form, {
          headers: { Authorization: token },
        });
        toast.success("✅ Item added successfully");
      }

      // Update Redux
      dispatch(updateNewMenu(res.data));

      // Reset form
      setForm({ name: "", price: "" });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE ITEM =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      setDeleteLoadingId(id);
      await axios.delete(`${BASE_URL}/menu/deleteMenu/${id}`, {
        headers: { Authorization: token },
      });
      dispatch(updateNewMenu({ _id: id, deleted: true })); // optional: handle in reducer
      toast.success("✅ Item deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete item");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // ================= TOGGLE STATUS =================
  const toggleStatus = async (id, currentStatus) => {
    try {
      setStatusLoadingId(id);
      const res = await axios.patch(
        `${BASE_URL}/menu/updateItem/${id}/status`,
        { status: currentStatus === "AVAILABLE" ? "OUT_OF_STOCK" : "AVAILABLE" },
        { headers: { Authorization: token } }
      );
      dispatch(updateNewMenu(res.data)); // update in Redux
      toast.success("✅ Item status updated");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update status");
    } finally {
      setStatusLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] p-4 sm:p-6 md:p-8 lg:p-10 max-w-5xl mx-auto">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#6B3E1E] mb-6 text-center sm:text-left">
        Menu Management
      </h1>

      {/* ===== ITEM FORM ===== */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6 items-stretch sm:items-end">
        <input
          type="text"
          placeholder="Item Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="flex-1 p-2 border rounded-lg text-sm sm:text-base"
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full sm:w-28 p-2 border rounded-lg text-sm sm:text-base"
        />
        <button
          onClick={handleSave}
          disabled={loading || role !== "Accountant"} // Only accountant can add/update
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : editingId ? "Update" : "Add"}
        </button>
      </div>

      {/* ===== MENU ITEMS ===== */}
      {menuItems.length === 0 ? (
        <p className="text-center text-gray-500 py-10 text-sm sm:text-base">No menu items found.</p>
      ) : (
        <div className="space-y-4">
          {menuItems.map((item) => (
            <div
              key={item._id}
              className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl shadow
                ${item.status === "OUT_OF_STOCK" ? "bg-gray-300 opacity-70" : "bg-[#d6b38a]"}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full sm:w-auto mb-2 sm:mb-0">
                <p className="font-semibold text-sm sm:text-base">
                  {item.name}
                  {item.optimistic && <span className="text-xs ml-2 text-gray-600">(saving...)</span>}
                </p>
                <p className="text-sm sm:text-base">₹{item.price}</p>
                <p
                  className={`text-xs sm:text-sm font-bold ${
                    item.status === "AVAILABLE" ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {item.status}
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
                <button
                  onClick={() => toggleStatus(item._id, item.status)}
                  disabled={statusLoadingId === item._id || item.optimistic}
                  className="flex-1 sm:flex-none px-3 py-1 bg-blue-600 text-white rounded-lg text-xs sm:text-sm disabled:opacity-50"
                >
                  {statusLoadingId === item._id ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : item.status === "AVAILABLE" ? (
                    "Out of Stock"
                  ) : (
                    "Available"
                  )}
                </button>

                {/* Edit & Delete only for Accountant */}
                {role === "Accountant" && (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(item._id);
                        setForm({ name: item.name, price: item.price });
                      }}
                      disabled={item.optimistic}
                      className="flex-1 sm:flex-none p-2 bg-yellow-500 rounded-lg disabled:opacity-50 text-xs sm:text-sm"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deleteLoadingId === item._id || item.optimistic}
                      className="flex-1 sm:flex-none p-2 bg-red-600 rounded-lg text-white disabled:opacity-50 text-xs sm:text-sm"
                    >
                      {deleteLoadingId === item._id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        className="mt-6 w-full sm:w-auto bg-[#C97A2B] px-4 py-2 rounded-lg text-white text-sm sm:text-base"
      >
        Back
      </button>
    </div>
  );
}
