import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { Check, X } from "lucide-react";
import { fetchOrders } from "../../../store/order/orderSlice";
import { toast } from "react-toastify";

export default function OrderCard() {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.order);

  const [loadingReadyId, setLoadingReadyId] = useState(null);
  const [loadingCancelId, setLoadingCancelId] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");

  const pendingOrders =
    orders?.filter((order) => order.status === "pending") || [];

  const updateOrderStatus = async (orderId, status) => {
    try {
      if (status === "completed") setLoadingReadyId(orderId);
      if (status === "cancelled") setLoadingCancelId(orderId);

      await axios.put(
        `${BASE_URL}/order/orderupdate/${orderId}`,
        { status },
        { headers: { Authorization: `${token}` } }
      );

      if(status === "completed"){
        toast.success(`Order marked as ${status}!`);
      }else{
        toast.error(`Order marked as ${status}!`);
      }
      dispatch(fetchOrders());
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order");
    } finally {
      if (status === "completed") setLoadingReadyId(null);
      if (status === "cancelled") setLoadingCancelId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
      {pendingOrders.map((order) => (
        <div
          key={order._id}
          className="bg-[#d6b38a] rounded-xl p-4 shadow space-y-3 text-brown"
        >
          {/* Top */}
          <div className="flex justify-between items-center">
            <p className="font-semibold">Table {order.tableNumber}</p>
            <span className="text-xs opacity-70">
              {new Date(order.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* ITEMS LIST */}
          <div className="space-y-1">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between text-sm"
              >
                <p>
                  {item.name} ({item.quantityType} × {item.quantity})
                </p>
                <p>₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>

          {/* Message */}
          {order.customerMessage && (
            <p className="text-sm opacity-60">
              Msg: {order.customerMessage}
            </p>
          )}

          {/* TOTAL */}
          <div className="flex justify-between font-medium pt-1">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => updateOrderStatus(order._id, "completed")}
              disabled={loadingReadyId === order._id}
              className="flex-1 flex items-center justify-center gap-2 bg-[#8b5e3c] hover:bg-[#7a5031] text-white py-2 rounded-lg"
            >
              <Check size={18} />
              {loadingReadyId === order._id ? "Updating..." : "READY"}
            </button>

            <button
              onClick={() => updateOrderStatus(order._id, "cancelled")}
              disabled={loadingCancelId === order._id}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
            >
              <X size={18} />
              {loadingCancelId === order._id ? "Updating..." : "CANCEL"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
