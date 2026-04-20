import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const ZALO_NUMBER = "0815934934"; // Số Zalo

export default function FloatButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { pathname } = useLocation();

  // Không hiện ở display
  if (pathname === "/display") return null;

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="float-buttons">
      {/* Zalo */}
      <a href={`https://zalo.me/${ZALO_NUMBER}`} target="_blank" rel="noopener noreferrer" className="float-btn float-zalo" title="Liên hệ Zalo" aria-label="Liên hệ qua Zalo">
        {/* Zalo icon SVG */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#0068FF" />
          <text x="12" y="16.5" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif">
            ZALO
          </text>
        </svg>
        <span className="float-btn-pulse" />
      </a>

      {/* Scroll to top */}
      <button onClick={scrollTop} className={`float-btn float-scroll-top ${showScrollTop ? "visible" : ""}`} title="Lên đầu trang" aria-label="Cuộn lên đầu trang">
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
