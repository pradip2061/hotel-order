import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import OrderCard from "./components/OrderCard";
import EmptyState from "./components/EmptyState";
import { fetchOrders, updateNewOrder } from "../../store/order/orderSlice";
import { socket } from "../../../components/common/socket";
import { toast } from "react-toastify";

const notificationSound = new Audio("/notification.wav");

export default function ChefHome() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading } = useSelector((state) => state.order);
  const userid = localStorage.getItem("userid");
  const token = localStorage.getItem("token");

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);


  useEffect(() => {
    // Join rooms after socket connects
    const joinRooms = () => {
      socket.emit("joinRoom", userid); // personal room
    };

    if (!socket.connected) {
      socket.on("connect", joinRooms);
    } else {
      joinRooms();
    }

    socket.on("newOrder", (order) => {
      dispatch(updateNewOrder(order));
    });
    socket.on("notifications", (message) => {
      notificationSound.currentTime = 0;
      notificationSound.play().catch(() => {
        console.log("Sound blocked until user interaction");
      });
      toast.success(message);
    });

    socket.on("orderCancelled", (message) => {
      // Optionally update Redux
      dispatch(fetchOrders()); // or a separate reducer for cancelled
    });
    socket.on("orderPaid", (message) => {
      dispatch(fetchOrders());
    });
    socket.on("orderReady", () => dispatch(fetchOrders()));
    return () => {
      socket.off("newOrder");
      socket.off("notifications");
      socket.off("orderCancelled");
      socket.off("orderPaid");
      socket.off("orderReady");
    };
  }, []);

  const pendingOrders =
    orders?.filter((order) => order.status === "pending") || [];
  const hasOrders = pendingOrders.length > 0;


  return (
    <div className="min-h-screen bg-bg p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 md:gap-0">
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-xl">
            🍲
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-brown">
              Kitchen Display
            </h1>
            <p className="text-sm text-brown/70">
              Orders waiting to be prepared
            </p>
          </div>
        </div>

        {/* Right: Menu button + Pending Orders */}
        <div className="flex items-center gap-4 md:gap-6 mt-2 md:mt-0">
          <button
            onClick={() => navigate("/menu-management")}
            className="bg-[#6B3E1E] text-white px-4 py-2 rounded-lg shadow hover:bg-[#54301a] transition"
          >
            Menu
          </button>
          <div className="bg-[#e0c6a3] text-[#6b3f1d] px-4 py-2 rounded-lg font-semibold shadow">
            Pending Orders: {pendingOrders.length}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <p className="text-center">Loading orders...</p>
      ) : hasOrders ? (
        <OrderCard />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
