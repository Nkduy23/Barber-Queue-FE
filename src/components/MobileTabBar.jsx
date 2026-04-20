import { Link, useLocation } from "react-router-dom";

const tabs = [
  {
    path: "/",
    label: "Trang chủ",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 21V12h6v9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    path: "/booking",
    label: "Đặt lịch",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeLinecap="round" strokeWidth="2.5" />
      </svg>
    ),
    primary: true,
  },
  {
    path: "/queue",
    label: "Hàng chờ",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    path: "/about",
    label: "Giới thiệu",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeWidth="2" />
      </svg>
    ),
  },
];

export default function MobileTabBar() {
  const { pathname } = useLocation();

  // Không hiện ở admin và display
  if (pathname.startsWith("/admin") || pathname === "/display") return null;

  return (
    <nav className="mobile-tab-bar">
      {tabs.map(({ path, label, icon, primary }) => {
        const active = pathname === path;
        return (
          <Link key={path} to={path} className={`mobile-tab-item ${active ? "active" : ""} ${primary ? "primary" : ""}`}>
            <span className="mobile-tab-icon">{icon}</span>
            <span className="mobile-tab-label">{label}</span>
            {active && <span className="mobile-tab-dot" />}
          </Link>
        );
      })}
    </nav>
  );
}
