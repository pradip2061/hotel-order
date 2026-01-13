import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Provider } from "react-redux";
import store from "./pages/store";
import MenuManagement from "./pages/dashboard/accountantDashBoard/components/MenuManagement";
import Header from "./components/common/Header";
import SoundPermissionModal from "./components/common/SoundPermissionModal"; // your modal component
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Register from "./pages/dashboard/accountantDashBoard/components/Register";

/* Lazy loaded pages */
const Login = lazy(() => import("./pages/login/Login"));
const ChefHome = lazy(() => import("./pages/dashboard/chefDashBoard/ChefHome"));
const WaiterHome = lazy(() => import("./pages/dashboard/waiterDashBoard/WaiterHome"));
const AccountHome = lazy(() => import("./pages/dashboard/accountantDashBoard/AccountHome"));
const Unauthorized = lazy(() => import("./pages/Unauthorized")); // optional

/* Loader */
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f1e9]">
      <Loader2 className="w-10 h-10 text-[#6b3f1d] animate-spin" />
    </div>
  );
}
function AppLayout() {
  const location = useLocation();
  const hideHeaderRoutes = ["/"];

  // SESSION storage version
  const [soundAllowed, setSoundAllowed] = useState(false);

  // check sessionStorage on mount
  useEffect(() => {
    sessionStorage.getItem("soundAllowed");
  }, []);

  const handleSoundAllowed = () => {
    sessionStorage.setItem("soundAllowed", "true");
    setSoundAllowed(true);
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        newestOnTop
        limit={2}
        style={{ width: "90vw", margin: "0 auto" }}
      />

      {!hideHeaderRoutes.includes(location.pathname) && <Header />}

      {/* Sound Permission Modal */}
      {!soundAllowed && (
        <SoundPermissionModal onSoundAllowed={handleSoundAllowed} />
      )}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/chefHome" element={<ChefHome soundAllowed={soundAllowed} />} />
          <Route path="/waiterHome" element={<WaiterHome soundAllowed={soundAllowed} />} />
          <Route path="/accountHome" element={<AccountHome soundAllowed={soundAllowed} />} />
          <Route path="/menu-management" element={<MenuManagement />} />
          <Route path="/register" element={<Register />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}



/* Root App */
export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </Provider>
  );
}  