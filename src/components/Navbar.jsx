import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/minhbao-removebg-preview.png";

const links = [
  { path: "/", label: "Trang chủ" },
  { path: "/about", label: "Giới thiệu" },
  { path: "/booking", label: "Đặt lịch" },
  { path: "/queue", label: "Hàng chờ" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 md:px-5 flex items-center justify-between h-[56px] md:h-[60px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline min-w-0">
          <span className="font-serif text-[17px] md:text-[20px] text-c-text tracking-tight truncate">Baw Men's Hair Designer</span>
          <span className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src={logo} alt="Logo shop" className="w-full h-full object-contain" />
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {links.map(({ path, label }) => {
            const active = pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`px-3.5 py-2 rounded-[var(--r-md)] text-[13.5px] font-medium no-underline transition-all duration-150
                  ${active ? "bg-bg-2 text-c-text" : "text-c-text-2 hover:bg-bg-2 hover:text-c-text"}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/display"
            className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--r-md)] text-[13px] text-c-text-2
              hover:bg-bg-2 hover:text-c-text no-underline transition-all"
          >
            <span>📺</span>
            <span>Màn hình TV</span>
          </Link>
          {/* <Link to="/booking" className="btn-primary text-[13px]" style={{ padding: "8px 18px" }}>
            Đặt lịch →
          </Link> */}
        </div>

        {/* Mobile: Đặt lịch button (only show when not on booking page) */}
        {pathname !== "/booking" && (
          <Link to="/booking" className="md:hidden btn-primary text-[12px] flex-shrink-0" style={{ padding: "7px 12px" }}>
            Đặt lịch →
          </Link>
        )}
      </div>

      {/* Mobile dropdown menu (kept for TV link) */}
      {open && (
        <div className="md:hidden border-t border-border bg-white px-5 pb-5 pt-2">
          {links.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className={`flex items-center py-3 no-underline text-[14px] border-b border-border
                ${pathname === path ? "font-semibold text-c-text" : "font-normal text-c-text-2"}`}
            >
              {label}
            </Link>
          ))}
          <Link to="/display" onClick={() => setOpen(false)} className="flex items-center py-3 no-underline text-[14px] text-c-text-2 border-b border-border">
            📺 Màn hình TV
          </Link>
          <Link to="/booking" onClick={() => setOpen(false)} className="btn-primary mt-4 flex justify-center w-full">
            Đặt lịch ngay →
          </Link>
        </div>
      )}
    </header>
  );
}
