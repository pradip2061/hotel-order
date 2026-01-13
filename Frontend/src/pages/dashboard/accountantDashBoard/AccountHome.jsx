import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DollarSign, Check, Menu, X } from "lucide-react";
import StateCard from "./components/StateCard";
import { fetchOrders, updateNewOrder } from "../../store/order/orderSlice";
import { socket } from "../../../components/common/socket";
import { toast } from "react-toastify";

const notificationSound = new Audio("/notification.wav");

export default function AccountHome() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders } = useSelector((state) => state.order);

  const [activeTab, setActiveTab] = useState("pending");
  const [loadingId, setLoadingId] = useState(null);
  const [showHeader, setShowHeader] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    socket.on("newOrder", (o) => dispatch(updateNewOrder(o)));
    socket.on("notifications", (message) => {
      notificationSound.currentTime = 0;
      notificationSound.play().catch(() => {});
      toast.success(message)
    });
    socket.on("orderCancelled", () => dispatch(fetchOrders()));
    socket.on("orderPaid", () => dispatch(fetchOrders()));
    socket.on("orderReady", () => dispatch(fetchOrders()));
    socket.emit("joinRoom", role);
     return () => {
      socket.off("newOrder");
        socket.off("notifications")
         socket.off("orderCancelled");
         socket.off("orderPaid")
         socket.off("orderReady")
    };
  }, []);

 


  const pendingOrders = orders?.filter(o => o.status === "pending") || [];
  const paidOrders = orders?.filter(o => o.status === "paid") || [];

  const todayPaidOrders = paidOrders.filter(o =>
    new Date(o.createdAt).toDateString() === new Date().toDateString()
  );

  const totalRevenue = todayPaidOrders.reduce((s, o) => s + o.total, 0);
  const pendingAmount = pendingOrders.reduce((s, o) => s + o.total, 0);

  const updateOrderStatus = async (id, status) => {
    try {
      setLoadingId(id);
    const res=await axios.put(
        `${BASE_URL}/order/orderupdate/${id}`,
        { status },
        { headers: { Authorization: token } }
      );
      if(res.status === 200){
        toast.success(res.data.message)
      }
    } catch(error){
      toast.error(error)
    }finally {
      setLoadingId(null);
    }
  };

  const displayOrders =
    activeTab === "pending" ? pendingOrders : todayPaidOrders;

  const visibleOrders =
    !showAll ? displayOrders.slice(0, 3) : displayOrders;


  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-36">
      {/* 🔹 Mobile Top Bar */}
      <div className="sm:hidden sticky top-0 z-40 bg-[#FAF7F2] border-b px-4 py-3 flex justify-between items-center border-gray-300">
        <h1 className="font-semibold text-[#6B3E1E]">Accountant</h1>
        <button onClick={() => setShowHeader(true)}>
          <Menu />
        </button>
      </div>

      {/* 🔹 Mobile Overlay */}
      {showHeader && (
        <div
          className="fixed inset-0 bg-black/30 z-40 sm:hidden"
          onClick={() => setShowHeader(false)}
        />
      )}

      {/* 🔹 Header */}
      <header
        className={`
          fixed sm:static top-0 left-0 w-full z-50
          bg-[#FAF7F2] border-b border-[#D6B894]
          transform transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full sm:translate-y-0"}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#6B3E1E]">
              Accountant Dashboard
            </h1>
            <p className="text-sm text-[#8A6A4F]">
              Manage orders and revenue
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/menu-management")}
              className="bg-[#C97A2B] text-white px-3 py-2 rounded-lg text-sm"
            >
              Menu
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-[#C97A2B] text-white px-3 py-2 rounded-lg text-sm"
            >
              Register
            </button>
            <button
              className="sm:hidden"
              onClick={() => setShowHeader(false)}
            >
              <X />
            </button>
          </div>
        </div>
      </header>

      {/* 🔹 Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          {["pending", "paid"].map(t => (
            <button
              key={t}
              onClick={() => {
                setActiveTab(t);
                setShowAll(false);
              }}
              className={`flex-1 py-2 rounded-lg font-semibold text-sm ${
                activeTab === t
                  ? "bg-[#C97A2B] text-white"
                  : "bg-white border border-gray-300"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Orders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayOrders.map((order) => (
              <div
                key={order._id}
                className="bg-gradient-to-br from-[#f7e4c7] to-[#d6b38a] rounded-xl p-4 shadow-md border border-[#c7a475] flex flex-col justify-between space-y-2 text-[#3e2e1c]"
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-base sm:text-lg">
                    Table {order.tableNumber}
                  </p>
                  <span className="text-xs opacity-70">
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm sm:text-base"
                      >
                        <p className="font-medium">
                          {item.name} ({item.quantityType} × {item.quantity})
                        </p>
                        <p className="font-semibold">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>

                  <p className="font-semibold text-sm sm:text-base">
                    ₹{order.total}
                  </p>
                </div>

                {order.customerMessage && (
                  <p className="text-xs sm:text-sm opacity-70 italic border-l-2 border-[#c7a475] pl-2">
                    {order.customerMessage}
                  </p>
                )}

                {activeTab === "pending" && (
                  <button
                    onClick={() => updateOrderStatus(order._id, "paid")}
                    disabled={loadingId === order._id}
                    className="flex w-full items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm sm:text-base font-semibold transition-all"
                  >
                    <Check size={16} />
                    {loadingId === order._id ? "Updating..." : "Mark as Paid"}
                  </button>
                )}
              </div>
            ))}
        </div>

        {/* Show More */}
        {displayOrders.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="sm:hidden w-full text-center text-blue-600 font-semibold"
          >
            {showAll ? "Show Less" : "Show More"}
          </button>
        )}
      </main>

      {/* 🔹 Bottom Stats */}
     <div className="fixed bottom-0 left-0 w-full bg-[#FAF7F2] border-t border-[#D6B894] z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex gap-3 overflow-x-auto md:overflow-visible">
          {/* On mobile: min-width for scroll, on md+: flex-1 to fill equally */}
          <div className="flex-shrink-0 md:flex-1 min-w-[150px]">
            <StateCard
              icon={<DollarSign />}
              label="Today's Revenue"
              value={totalRevenue}
              color="#2F5D3A"
            />
          </div>
          <div className="flex-shrink-0 md:flex-1 min-w-[150px]">
            <StateCard
              icon={<DollarSign />}
              label="Pending Orders"
              value={pendingOrders.length}
              color="#C97A2B"
            />
          </div>
          <div className="flex-shrink-0 md:flex-1 min-w-[150px]">
            <StateCard
              icon={<DollarSign />}
              label="Pending Amount"
              value={pendingAmount}
              color="#6B3E1E"
            />
          </div>
          </div>
        </div>
    </div>
  );
}
