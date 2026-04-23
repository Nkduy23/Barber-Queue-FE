import { Link } from "react-router-dom";
import minhbao from "../assets/minhbao.jpg";
import phuchau from "../assets/phuchau.jpg";
import khanhduy from "../assets/khanhduy.jpg";

const TEAM = [
  { name: "Minh Bảo", role: "Master Barber", exp: "8 năm kinh nghiệm", img: minhbao, tag: "Founder" },
  { name: "Phúc Hậu", role: "Senior Barber", exp: "5 năm kinh nghiệm", img: phuchau, tag: "Senior" },
  { name: "Khánh Duy", role: "Barber", exp: "3 năm kinh nghiệm", img: khanhduy, tag: "Barber" },
];

const VALUES = [
  { icon: "⏱", title: "Đúng giờ", desc: "Hệ thống hàng chờ thời gian thực — không để khách chờ lãng phí." },
  { icon: "✂️", title: "Chất lượng", desc: "Từng đường kéo được thực hiện với sự tỉ mỉ và trách nhiệm cao." },
  { icon: "🤝", title: "Tôn trọng", desc: "Mỗi khách hàng là ưu tiên — từ khi bước vào đến khi ra về." },
];

const METRICS = [
  { value: "8+", label: "Năm kinh nghiệm", sub: "Kể từ 2016" },
  { value: "500+", label: "Khách/tháng", sub: "Và tăng dần" },
  { value: "98%", label: "Hài lòng", sub: "Đánh giá 5 sao" },
];

// ── Thông tin địa chỉ tiệm ────────────────────────────────────
const SHOP = {
  name: "Tiệm Tóc Của Baw",
  address: "123 Đường ABC, Phường XYZ, Quận 1, TP. HCM",
  googleMapsUrl: "https://maps.google.com/?q=10.943747879372813,106.54616298358108",
  googleMapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.0!2d106.54616298358108!3d10.943747879372813!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zVGnhu4dtIFTDs2MgQ-G7p2EgQmF3!5e0!3m2!1svi!2svn!4v1234567890",
  phone: "0815 934 934",
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

export default function About() {
  const open = isOpenNow();

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[48vh] min-h-[320px] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1400&q=80)", filter: "grayscale(20%)" }} />
        <div className="absolute inset-0" style={{ background: "rgba(10,10,10,0.62)" }} />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8">
          <p className="label text-white/40 mb-4">— Về chúng tôi</p>
          <h1 className="font-serif text-[clamp(34px,5vw,60px)] text-white m-0">Baw Men's Hair Designer Barber</h1>
        </div>
      </section>

      {/* Metrics strip */}
      <section className="bg-c-text py-8 md:py-10 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6 md:gap-16">
          {METRICS.map((m) => (
            <div key={m.label} className="text-center">
              <p className="font-serif text-[36px] md:text-[52px] text-white m-0 leading-none">{m.value}</p>
              <p className="text-[12px] md:text-[14px] font-medium text-white/80 m-0 mt-1">{m.label}</p>
              <p className="text-[10px] md:text-[12px] text-white/40 m-0 mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="label mb-4">Câu chuyện</p>
            <h2 className="font-serif text-[34px] leading-[1.2] text-c-text m-0 mb-5">
              Từ niềm đam mê
              <br />
              đến nghề nghiệp
            </h2>
            <div className="w-8 h-[2px] bg-c-text mb-6 rounded-full" />
            {[
              "Baw Men's Hair Designer Barber ra đời năm 2026 với sứ mệnh đơn giản: mang trải nghiệm cắt tóc chất lượng cao nhất cho phái nam tại TP. HCM.",
              "Chúng tôi không chỉ cắt tóc — chúng tôi xây dựng phong cách. Mỗi khách được tư vấn kỹ và phục vụ với sự tôn trọng tối đa.",
              "Chúng tôi ra mắt hệ thống hàng chờ thời gian thực — giúp khách không còn chờ lâu hay không biết bao giờ tới lượt.",
            ].map((text, i) => (
              <p key={i} className="text-c-text-2 leading-[1.8] mt-4 text-[14px]">
                {text}
              </p>
            ))}
          </div>
          <div
            className="h-[400px] rounded-[var(--r-xl)] bg-cover bg-center border border-border"
            style={{ backgroundImage: "url(https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80)", filter: "grayscale(10%)" }}
          />
        </div>
      </section>

      {/* Values */}
      <section className="py-18 px-8 bg-bg-2 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="label mb-3">Giá trị cốt lõi</p>
            <h2 className="font-serif text-[34px] text-c-text m-0">Chúng tôi tin vào</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white border border-border rounded-[var(--r-xl)] p-9 hover:shadow-[var(--shadow-md)] hover:border-border-2 transition-all">
                <div className="text-3xl mb-5">{v.icon}</div>
                <h3 className="font-serif text-[20px] text-c-text mb-3">{v.title}</h3>
                <p className="text-[13px] text-c-text-2 leading-[1.75] m-0">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-8 bg-white border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="label mb-3">Đội ngũ</p>
            <h2 className="font-serif text-[36px] text-c-text m-0 mb-3">Những người thợ của chúng tôi</h2>
            <div className="divider" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {TEAM.map((member) => (
              <div key={member.name} className="group relative overflow-hidden rounded-[var(--r-xl)] border border-border hover:shadow-[var(--shadow-lg)] hover:border-border-2 transition-all">
                <div className="h-64 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${member.img})`, filter: "grayscale(15%)" }} />
                <span className="absolute top-3 right-3 text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-c-text px-2.5 py-1 rounded-full border border-border">{member.tag}</span>
                <div className="bg-white px-5 py-4 border-t border-border">
                  <h3 className="font-serif text-[18px] text-c-text m-0 mb-0.5">{member.name}</h3>
                  <p className="text-[12px] font-medium text-c-text-2 m-0">{member.role}</p>
                  <p className="label m-0 mt-1">{member.exp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAP SECTION ─────────────────────────────────────────── */}
      <section className="py-20 px-8 bg-bg-2 border-t border-border">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <p className="label mb-3">Địa chỉ</p>
            <h2 className="font-serif text-[34px] text-c-text m-0 mb-3">{SHOP.name}</h2>
            <div className="flex justify-center">
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
        </div>
      </section>

      {/* CTA */}
      <section className="py-18 px-8 bg-c-text border-t border-border text-center">
        <h2 className="font-serif text-[32px] text-white mb-6">Trải nghiệm ngay hôm nay</h2>
        <Link to="/booking" className="btn-primary">
          Đặt lịch — Miễn phí →
        </Link>
      </section>
    </div>
  );
}
