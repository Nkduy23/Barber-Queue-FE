import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Booking from "./pages/Booking";
import Queue from "./pages/Queue";
import Display from "./pages/Display";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";

function Layout() {
  const { pathname } = useLocation();
  const isDisplay = pathname === "/display";
  const isAdmin = pathname.startsWith("/admin");

  if (isDisplay) return <Display />;

  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<Dashboard />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  );
}
