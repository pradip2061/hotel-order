import { useDispatch } from "react-redux";
import { socket } from "../../../components/common/socket";
import NewOrder from "./components/NewOrder";
import PendingOrders from "./components/PendingOrders";
import { fetchOrders, updateNewOrder } from "../../store/order/orderSlice";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const notificationSound = new Audio("/notification.wav");
export default function WaiterHome() {
  const userid = localStorage.getItem("userid");
  const dispatch = useDispatch();

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
    socket.on("orderCancelled", (message) => {
      // Optionally update Redux
      dispatch(fetchOrders()); // or a separate reducer for cancelled
      // Play sound
      notificationSound.currentTime = 0;
      notificationSound.play().catch(() => console.log("Sound blocked"));
      toast.error(message);
    });
    socket.on("orderPaid", (message) => {
      dispatch(fetchOrders());
    });
    socket.on("notifications", (message) => {
      dispatch(fetchOrders());
      notificationSound.currentTime = 0;
      notificationSound.play().catch(() => console.log("Sound blocked"));
      toast.success(message);
    });
    socket.on("orderReady", (message) => {
       notificationSound.currentTime = 0;
      notificationSound.play().catch(() => console.log("Sound blocked"));
      toast.success(message);
      dispatch(fetchOrders())});
    return () => {
      socket.off("newOrder");
      socket.off("orderCancelled");
      socket.off("orderPaid");
      socket.off("notifications");
      socket.off("orderReady")
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f3ed] text-[#5b3a1e]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NewOrder />
        </div>
        <PendingOrders />
      </main>
    </div>
  );
}
