import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../../store/order/orderSlice";

export default function PendingOrders() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const pendingOrders =
    orders?.filter((o) => o.status === "pending") || [];

  return (
    <div className="h-full">
      <h2 className="text-2xl font-serif mb-4">
        Pending Orders{" "}
        <span className="opacity-70">({pendingOrders.length})</span>
      </h2>

      <div
        className="bg-[#f3ede4] rounded-2xl border border-[#c9a87a] p-4 space-y-4
                   h-[calc(100vh-180px)] overflow-y-auto"
      >
        {loading && <p className="text-center">Loading...</p>}

        {!loading && pendingOrders.length === 0 && (
          <p className="text-center opacity-60">No pending orders</p>
        )}

        {pendingOrders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-xl p-4 shadow-sm space-y-2"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#6b3f1d] text-white
                                flex items-center justify-center font-semibold">
                  {order.tableNumber}
                </div>

                <div>
                  <p className="font-medium">Table {order.tableNumber}</p>
                  <p className="text-xs opacity-70">
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full border
                               border-[#e39b53] text-[#e39b53] text-sm">
                Pending
              </span>
            </div>

            <hr className="border-[#d6c1a3]" />

            {/* ITEMS (ARRAY) */}
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between text-sm"
              >
                <span>
                  {item.name} ({item.quantityType}) × {item.quantity}
                </span>
                <span>
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}

            {order.customerMessage && (
              <p className="text-sm opacity-60 mt-1">
                Msg: {order.customerMessage}
              </p>
            )}

            <hr className="border-[#d6c1a3]" />

            {/* TOTAL */}
            <div className="flex justify-between font-serif text-lg">
              <span>Total</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
