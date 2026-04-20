import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import zalo from "../assets/zalo.png";
import messenger from "../assets/messenger.png";

const ZALO_NUMBER = "0815934934";
const MESSENGER_URL = "https://www.facebook.com/baocuteisme?locale=vi_VN"; // đổi username nếu cần

export default function FloatButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { pathname } = useLocation();

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
        <img src={zalo} alt="Zalo" className="w-full h-full object-contain" />
        <span className="float-btn-pulse" />
      </a>

      {/* Messenger */}
      <a href={MESSENGER_URL} target="_blank" rel="noopener noreferrer" className="float-btn float-messenger" title="Liên hệ Messenger" aria-label="Liên hệ qua Messenger">
        <img src={messenger} alt="Messenger" className="w-full h-full object-contain" />
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
