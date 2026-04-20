import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import History from "./pages/admin/History";
import Settings from "./pages/admin/Settings";
import ScrollToTop from "./components/ScrollToTop";

function PublicLayout() {
  const { pathname } = useLocation();

  if (pathname === "/display") return <Display />;

  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1, paddingBottom: "env(safe-area-inset-bottom)" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/queue" element={<Queue />} />
        </Routes>
      </main>
      <Footer />
      <MobileTabBar />
      <FloatButtons />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ── Admin (không có Navbar/Footer) ── */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ── Public (có Navbar/Footer) ── */}
        <Route path="*" element={<PublicLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
