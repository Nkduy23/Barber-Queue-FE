import { useState } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import logo from "../../assets/minhbao-removebg-preview.png";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Nav items — một số chỉ admin mới thấy
const NAV_ITEMS = [
  {
    key: "dashboard",
    path: "/admin/dashboard",
    roles: ["admin"],
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    label: "Hàng chờ",
    sublabel: "Quản lý live",
  },
  {
    key: "staff",
    path: "/admin/staff",
    roles: ["barber"],
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    label: "Công việc",
    sublabel: "Của tôi hôm nay",
  },
  {
    key: "history",
    path: "/admin/history",
    roles: ["admin"],
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 8v4l3 3" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
    label: "Lịch sử",
    sublabel: "Thống kê ngày",
  },
  {
    key: "revenue",
    path: "/admin/revenue",
    roles: ["admin"],
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" strokeLinecap="round" />
      </svg>
    ),
    label: "Doanh thu",
    sublabel: "Lương & hoa hồng",
  },
  {
    key: "schedules",
    path: "/admin/schedules",
    roles: ["admin"],
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
      </svg>
    ),
    label: "Lịch làm việc",
    sublabel: "Thợ nghỉ / làm",
  },
  {
    key: "settings",
    path: "/admin/settings",
    roles: ["admin"],
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
      </svg>
    ),
    label: "Cài đặt",
    sublabel: "Giờ & slot",
  },
  // Đổi password — ai cũng thấy
  {
    key: "password",
    path: "/admin/password",
    roles: ["admin", "barber"],
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
      </svg>
    ),
    label: "Đổi mật khẩu",
    sublabel: "Bảo mật tài khoản",
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const role = localStorage.getItem("userRole") || "barber";
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));
  // Mobile chỉ hiển thị max 4 item quan trọng nhất
  const mobileItems = visibleItems.filter((i) => i.key !== "password").slice(0, 4);

  const activeKey = visibleItems.find((item) => location.pathname.startsWith(item.path))?.key || visibleItems[0]?.key;

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    // Gọi API logout để revoke refresh token
    if (token && refreshToken) {
      try {
        await fetch(`${API}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {}
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("barber_id");
    navigate("/admin/login");
  };

  const currentItem = visibleItems.find((i) => i.key === activeKey);

  return (
    <div className="min-h-screen bg-bg-2 flex">
      {/* ── Desktop Sidebar ── */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-border transition-all duration-200 ${collapsed ? "w-[60px]" : "w-[220px]"} flex-shrink-0 sticky top-0 h-screen`}>
        {/* Logo */}
        <div className="h-[60px] flex items-center border-b border-border px-4 gap-3 overflow-hidden">
          <Link to="/" className="flex items-center gap-2 no-underline min-w-0">
            <span className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </span>
          </Link>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-serif text-[15px] text-c-text block leading-tight">Baw Men's</span>
              <span className="text-[9px] font-semibold tracking-widest uppercase text-c-text-3">{role === "admin" ? "Admin Panel" : "Staff Panel"}</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 flex flex-col gap-1 px-2 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive = activeKey === item.key;
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-md)] text-left cursor-pointer transition-all border
                  ${isActive ? "bg-c-text text-white border-c-text" : "bg-transparent text-c-text-2 border-transparent hover:bg-bg-2 hover:text-c-text"}`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <div className="overflow-hidden">
                    <p className="m-0 text-[13px] font-medium leading-tight">{item.label}</p>
                    <p className={`m-0 text-[10px] leading-tight ${isActive ? "text-white/60" : "text-c-text-3"}`}>{item.sublabel}</p>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2 pb-3 flex flex-col gap-1 border-t border-border pt-3">
          {/* Role badge */}
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-2">
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${role === "admin" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}
              >
                {role === "admin" ? "Admin" : "Thợ"}
              </span>
              <span className="live-dot" />
              <span className="text-[11px] text-c-text-3">Realtime</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-md)] text-c-text-3 hover:bg-bg-2 hover:text-c-text cursor-pointer transition-all border border-transparent bg-transparent"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
              className={`flex-shrink-0 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
            >
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {!collapsed && <span className="text-[12px]">Thu gọn</span>}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-md)] text-c-red hover:bg-red-bg cursor-pointer transition-all border border-transparent bg-transparent"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="flex-shrink-0">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {!collapsed && <span className="text-[12px] font-medium">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border flex safe-bottom">
        {mobileItems.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 cursor-pointer border-none bg-transparent transition-all
                ${isActive ? "text-c-text" : "text-c-text-3"}`}
            >
              <span className={`transition-transform ${isActive ? "scale-110" : ""}`}>{item.icon}</span>
              <span className={`text-[10px] font-medium ${isActive ? "text-c-text" : "text-c-text-3"}`}>{item.label}</span>
              {isActive && <span className="w-1 h-1 bg-c-text rounded-full mt-0.5" />}
            </button>
          );
        })}
        <button onClick={handleLogout} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 cursor-pointer border-none bg-transparent text-c-red">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-medium">Thoát</span>
        </button>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="h-[56px] md:h-[60px] bg-white border-b border-border px-4 md:px-6 flex items-center justify-between sticky top-0 z-10">
          <div>
            <p className="m-0 text-[13px] md:text-[14px] font-semibold text-c-text">{currentItem?.label}</p>
            <p className="m-0 text-[10px] md:text-[11px] text-c-text-3 hidden sm:block">{currentItem?.sublabel}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="live-dot" />
              <span className="text-[11px] text-c-text-3 hidden sm:inline">Realtime</span>
            </div>
            <div className="text-[11px] text-c-text-3 hidden md:block">{new Date().toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" })}</div>
          </div>
        </div>

        <div className="p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
