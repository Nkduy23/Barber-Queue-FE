import { Link } from "react-router-dom";

// ── Thay 3 giá trị này theo địa chỉ thực tế của tiệm ──────────
const SHOP = {
  name: "Tiệm Tóc Của Baw",
  address: "123 Đường ABC, Phường XYZ, Quận 1, TP. HCM",
  googleMapsUrl: "https://maps.google.com/?q=Tiệm+Tóc+Của+Baw",
  googleMapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.2!2d106.6!3d10.78!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zVGnhu4dtIFTDs2MgQ-G7p2EgQmF3!5e0!3m2!1svi!2svn!4v1234567890",
  phone: "0999 999 999",
  hours: [
    { day: "Thứ 2 — Thứ 6", time: "08:00 — 19:00", open: true },
    { day: "Thứ 7", time: "08:00 — 19:00", open: true },
    { day: "Chủ nhật", time: "09:00 — 17:00", open: true },
  ],
  parking: "Có chỗ để xe máy miễn phí trước cửa",
  note: "Đặt lịch trước để tránh chờ đợi",
};

function isOpenNow() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  const day = now.getDay(); // 0=CN, 1-5=T2-T6, 6=T7
  const h = now.getHours();
  const m = now.getMinutes();
  const mins = h * 60 + m;
  if (day >= 1 && day <= 6) return mins >= 8 * 60 && mins < 19 * 60;
  if (day === 0) return mins >= 9 * 60 && mins < 17 * 60;
  return false;
}

export default function Map() {
  const open = isOpenNow();

  return (
    <div className="bg-bg-2 min-h-[80vh]">
      <div className="max-w-2xl mx-auto px-4 md:px-5 py-6 md:py-10">
        {/* Header */}
        <div className="mb-5 md:mb-6">
          <p className="label mb-1.5">Địa chỉ</p>
          <h1 className="font-serif text-[26px] md:text-[32px] leading-tight text-c-text m-0 mb-1">{SHOP.name}</h1>
          <div className="flex items-center gap-2">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: open ? "#dcfce7" : "#fee2e2",
                color: open ? "#16a34a" : "#dc2626",
                border: `1px solid ${open ? "#bbf7d0" : "#fecaca"}`,
                borderRadius: 99,
                padding: "2px 10px",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: open ? "#16a34a" : "#dc2626", display: "inline-block" }} />
              {open ? "Đang mở cửa" : "Đã đóng cửa"}
            </span>
          </div>
        </div>

        {/* Map iframe */}
        <div className="bg-white border border-border rounded-[var(--r-xl)] overflow-hidden mb-4" style={{ height: 280, position: "relative" }}>
          <iframe
            src={SHOP.googleMapsEmbed}
            width="100%"
            height="100%"
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Bản đồ Tiệm Tóc Của Baw"
          />
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <a
            href={SHOP.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              background: "#111",
              color: "#fff",
              borderRadius: 12,
              padding: "12px 0",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            🧭 Chỉ đường
          </a>
          <a
            href={`tel:${SHOP.phone.replace(/\s/g, "")}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              background: "#fff",
              color: "#111",
              border: "1.5px solid #e5e5e5",
              borderRadius: 12,
              padding: "12px 0",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            📞 Gọi điện
          </a>
        </div>

        {/* Info card */}
        <div className="bg-white border border-border rounded-[var(--r-xl)] overflow-hidden mb-4">
          {/* Address */}
          <div className="flex items-start gap-3 px-5 py-4" style={{ borderBottom: "1px solid #f0f0f0" }}>
            <span className="text-base flex-shrink-0 mt-0.5">📍</span>
            <div>
              <p className="m-0 text-[11px] text-c-text-3 mb-0.5">Địa chỉ</p>
              <p className="m-0 text-[13px] font-medium text-c-text">{SHOP.address}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3 px-5 py-4" style={{ borderBottom: "1px solid #f0f0f0" }}>
            <span className="text-base flex-shrink-0 mt-0.5">📞</span>
            <div>
              <p className="m-0 text-[11px] text-c-text-3 mb-0.5">Điện thoại</p>
              <a href={`tel:${SHOP.phone.replace(/\s/g, "")}`} className="text-[13px] font-medium text-c-text" style={{ textDecoration: "none" }}>
                {SHOP.phone}
              </a>
            </div>
          </div>

          {/* Parking */}
          <div className="flex items-start gap-3 px-5 py-4" style={{ borderBottom: "1px solid #f0f0f0" }}>
            <span className="text-base flex-shrink-0 mt-0.5">🅿️</span>
            <div>
              <p className="m-0 text-[11px] text-c-text-3 mb-0.5">Bãi đỗ xe</p>
              <p className="m-0 text-[13px] font-medium text-c-text">{SHOP.parking}</p>
            </div>
          </div>

          {/* Note */}
          <div className="flex items-start gap-3 px-5 py-4">
            <span className="text-base flex-shrink-0 mt-0.5">💡</span>
            <div>
              <p className="m-0 text-[11px] text-c-text-3 mb-0.5">Lưu ý</p>
              <p className="m-0 text-[13px] font-medium text-c-text">{SHOP.note}</p>
            </div>
          </div>
        </div>

        {/* Giờ mở cửa */}
        <div className="bg-white border border-border rounded-[var(--r-xl)] overflow-hidden mb-5">
          <div className="px-5 py-3.5" style={{ borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
            <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-c-text-3">🕐 Giờ mở cửa</p>
          </div>
          {SHOP.hours.map(({ day, time, open: isOpen }, i) => (
            <div key={day} className="flex items-center justify-between px-5 py-3" style={{ borderBottom: i < SHOP.hours.length - 1 ? "1px solid #f5f5f5" : "none" }}>
              <span className="text-[13px] text-c-text">{day}</span>
              <span className={`text-[13px] font-semibold ${isOpen ? "text-c-text" : "text-c-text-3"}`}>{isOpen ? time : "Nghỉ"}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link to="/booking" className="btn-primary w-full justify-center py-3 text-[14px]" style={{ display: "flex" }}>
          Đặt lịch ngay →
        </Link>
      </div>
    </div>
  );
}
