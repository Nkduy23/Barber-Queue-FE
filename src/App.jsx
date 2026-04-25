import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileTabBar from "./components/MobileTabBar";
import FloatButtons from "./components/FloatButtons";
import Home from "./pages/Home";
import About from "./pages/About";
import Booking from "./pages/Booking";
import Queue from "./pages/Queue";
import Display from "./pages/Display";
import Login from "./pages/admin/Login";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import StaffDashboard from "./pages/admin/StaffDashboard";
import Schedules from "./pages/admin/Schedules";
import Account from "./pages/admin/Account";
import RevenueStats from "./pages/admin/RevenueStats";
import History from "./pages/admin/History";
import Settings from "./pages/admin/Settings";
import ScrollToTop from "./components/ScrollToTop";
import BookingReminderModal from "./components/BookingReminderModal";
import MyBookings from "./pages/MyBookings";

// Scroll progress bar component
function ScrollProgress() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset khi đổi trang
    const bar = document.getElementById("scroll-progress");
    if (bar) bar.style.width = "0%";

    const onScroll = () => {
      const bar = document.getElementById("scroll-progress");
      if (!bar) return;
      const doc = document.documentElement;
      const scrolled = doc.scrollTop;
      const total = doc.scrollHeight - doc.clientHeight;
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      bar.style.width = `${pct}%`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return null;
}

function PublicLayout() {
  const { pathname } = useLocation();
  if (pathname === "/display") return <Display />;

  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
      {/* Scroll progress bar */}
      <div id="scroll-progress" style={{ position: "fixed", top: 0, left: 0, height: 2, background: "#111", zIndex: 9999, width: "0%", pointerEvents: "none", transition: "width 0.1s linear" }} />
      <Navbar />
      <main style={{ flex: 1, paddingBottom: "env(safe-area-inset-bottom)" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Routes>
      </main>
      <Footer />
      <MobileTabBar />
      <FloatButtons />
      <BookingReminderModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ScrollProgress />
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="staff" element={<StaffDashboard />} />
          <Route path="history" element={<History />} />
          <Route path="revenue" element={<RevenueStats />} />
          <Route path="schedules" element={<Schedules />} />
          <Route path="account" element={<Account />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<PublicLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
