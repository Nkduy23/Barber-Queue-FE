import { Link } from "react-router-dom";
import logo from "../assets/minhbao-removebg-preview.png";

export default function Footer() {
  return (
    <footer className="bg-bg-2 border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-8 md:pb-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <span className="font-serif text-[18px] md:text-[22px] text-c-text">Baw Men's Hair Designer</span>
            <span className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src={logo} alt="Logo shop" className="w-full h-full object-contain" />
            </span>
          </div>
          <p className="text-[12px] md:text-[13px] text-c-text-2 leading-relaxed max-w-[260px] mb-4 md:mb-5">
            Tiệm cắt tóc nam chất lượng cao tại TP. HCM. Đặt lịch online — không cần chờ, không cần gọi.
          </p>
          <div className="flex flex-col gap-2">
            {[
              { icon: "📍", text: "Xã Củ Chi, TP. Hồ Chí Minh" },
              { icon: "📞", text: "0815 934 934" },
            ].map((item) => (
              <span key={item.text} className="flex items-center gap-2 text-[12px] md:text-[13px] text-c-text-2">
                {item.icon} {item.text}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <p className="label mb-4 md:mb-5">Điều hướng</p>
          {[
            { to: "/", label: "Trang chủ" },
            { to: "/about", label: "Giới thiệu" },
            { to: "/booking", label: "Đặt lịch" },
            { to: "/queue", label: "Xem hàng chờ" },
            { to: "/display", label: "Màn hình TV" },
          ].map(({ to, label }) => (
            <Link key={to} to={to} className="block no-underline text-[12px] md:text-[13.5px] text-c-text-2 hover:text-c-text mb-2.5 md:mb-3 transition-colors">
              {label}
            </Link>
          ))}
        </div>

        {/* Hours */}
        <div>
          <p className="label mb-4 md:mb-5">Giờ mở cửa</p>
          {[
            { day: "Thứ 2 – Thứ 6", time: "08:00 – 21:00" },
            { day: "Thứ 7", time: "07:30 – 21:30" },
            { day: "Chủ nhật", time: "08:00 – 20:00" },
          ].map(({ day, time }) => (
            <div key={day} className="mb-3 md:mb-4">
              <span className="text-[11px] md:text-[12px] text-c-text-3">{day}</span>
              <br />
              <span className="text-[13px] md:text-[14px] font-semibold text-c-text">{time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border px-5 md:px-8 py-3 md:py-4 max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-2">
        <p className="text-[11px] md:text-[12px] text-c-text-3 m-0">
          © {new Date().getFullYear()} Baw Men's Hair Designer. Developed by{" "}
          <a href="https://www.facebook.com/khanhduy23803/?locale=vi_VN" target="_blank" rel="noopener noreferrer" className="underline">
            Nguyen Khanh Duy
          </a>
        </p>
        <Link to="/admin/login" className="text-[11px] md:text-[12px] text-c-text-3 hover:text-c-text no-underline transition-colors">
          Quản trị ↗
        </Link>
      </div>
    </footer>
  );
}
