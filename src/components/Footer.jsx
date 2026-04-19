import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-bg-2 border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-8 pt-14 pb-10 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="font-serif text-[22px] text-c-text">MinhBao</span>
            <span className="w-7 h-7 rounded-full bg-c-text text-white flex items-center justify-center text-sm">💈</span>
          </div>
          <p className="text-[13px] text-c-text-2 leading-relaxed max-w-[260px] mb-5">Tiệm cắt tóc nam chất lượng cao tại TP. HCM. Đặt lịch online — không cần chờ, không cần gọi.</p>
          <div className="flex flex-col gap-2">
            {[
              { icon: "📍", text: "Quận 1, TP. Hồ Chí Minh" },
              { icon: "📞", text: "0901 234 567" },
            ].map((item) => (
              <span key={item.text} className="flex items-center gap-2 text-[13px] text-c-text-2">
                {item.icon} {item.text}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <p className="label mb-5">Điều hướng</p>
          {[
            { to: "/", label: "Trang chủ" },
            { to: "/about", label: "Giới thiệu" },
            { to: "/booking", label: "Đặt lịch" },
            { to: "/queue", label: "Xem hàng chờ" },
            { to: "/display", label: "Màn hình TV" },
          ].map(({ to, label }) => (
            <Link key={to} to={to} className="block no-underline text-[13.5px] text-c-text-2 hover:text-c-text mb-3 transition-colors">
              {label}
            </Link>
          ))}
        </div>

        {/* Hours */}
        <div>
          <p className="label mb-5">Giờ mở cửa</p>
          {[
            { day: "Thứ 2 – Thứ 6", time: "08:00 – 21:00" },
            { day: "Thứ 7", time: "07:30 – 21:30" },
            { day: "Chủ nhật", time: "08:00 – 20:00" },
          ].map(({ day, time }) => (
            <div key={day} className="mb-4">
              <span className="text-[12px] text-c-text-3">{day}</span>
              <br />
              <span className="text-[14px] font-semibold text-c-text">{time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border px-8 py-4 max-w-6xl mx-auto flex justify-between items-center">
        <p className="text-[12px] text-c-text-3 m-0">© {new Date().getFullYear()} MinhBao Barber. Bảo lưu mọi quyền.</p>
        <Link to="/admin/login" className="text-[12px] text-c-text-3 hover:text-c-text no-underline transition-colors">
          Quản trị ↗
        </Link>
      </div>
    </footer>
  );
}
