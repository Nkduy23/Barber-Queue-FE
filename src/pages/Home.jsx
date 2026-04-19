import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQueue } from "../hooks/useQueue";
import { formatWaitTime } from "../utils/timeHelper";

const SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1400&q=80",
    tag: "Tiệm cắt tóc cao cấp",
    title: "Nghệ thuật\ncắt tóc nam",
    sub: "Trải nghiệm đẳng cấp — đặt lịch trong 30 giây",
  },
  {
    img: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1400&q=80",
    tag: "Hàng chờ thời gian thực",
    title: "Không cần\nchờ đợi",
    sub: "Theo dõi hàng chờ trực tiếp — đến đúng giờ, không lãng phí thời gian",
  },
  {
    img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1400&q=80",
    tag: "Đội ngũ chuyên nghiệp",
    title: "Phong cách\ncủa bạn",
    sub: "Thợ lành nghề tận tâm — cam kết sự hài lòng 100%",
  },
];

const SERVICES = [
  { icon: "✂️", name: "Cắt tóc cơ bản", price: "50.000đ", time: "20 phút" },
  { icon: "🪒", name: "Cạo mặt", price: "10.000đ", time: "15 phút" },
  { icon: "💆", name: "Gội + Massage", price: "60.000đ", time: "20 phút" },
  { icon: "🎨", name: "Nhuộm tóc", price: "200.000đ", time: "60 phút" },
];

export default function Home() {
  const { stats, loading } = useQueue();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  const current = SLIDES[slide];

  return (
    <div>
      {/* ── HERO ── */}

      <section className="relative h-[45vh] min-h-[450px] overflow-hidden">
        {SLIDES.map((s, i) => (
          <div key={i} className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1200ms]" style={{ backgroundImage: `url(${s.img})`, opacity: i === slide ? 1 : 0 }} />
        ))}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(10,10,10,0.82) 45%, rgba(10,10,10,0.22))" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-8 h-full flex items-center">
          <div key={slide} className="animate-fade-up">
            <span className="block label text-white/40 mb-5 tracking-[0.12em]">— {current.tag}</span>
            <h1 className="font-serif text-white m-0 mb-6 leading-[1.04]" style={{ fontSize: "clamp(48px,7vw,84px)", whiteSpace: "pre-line" }}>
              {current.title}
            </h1>
            <p className="text-white/60 text-[15px] mb-10 max-w-[380px] leading-[1.8]">{current.sub}</p>
            <div className="flex gap-4 flex-wrap items-center">
              <Link to="/booking" className="btn-primary" style={{ background: "white", color: "#111", padding: "11px 24px", fontSize: 14 }}>
                Đặt lịch ngay →
              </Link>
              <Link
                to="/queue"
                className="text-white/60 hover:text-white no-underline text-[14px] font-medium
                border-b border-white/20 pb-0.5 transition-colors"
              >
                Xem hàng chờ
              </Link>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className="h-1.5 rounded-full border-none cursor-pointer transition-all duration-300 p-0"
              style={{ width: i === slide ? 24 : 6, background: i === slide ? "#fff" : "rgba(255,255,255,0.3)" }}
            />
          ))}
        </div>
        <div className="absolute bottom-8 right-10 z-10 text-[12px] text-white/20 tabular-nums">
          {String(slide + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 px-8 bg-white border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
            <div>
              <p className="label mb-2">Cập nhật liên tục · Thời gian thực</p>
              <h2 className="font-serif text-[32px] text-c-text m-0">Tình trạng hôm nay</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span className="text-[12px] text-c-text-3">Đang hoạt động</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { label: "Đang chờ", value: loading ? "—" : (stats?.waitingCount ?? 0), unit: "người", highlight: false },
              { label: "Thời gian chờ", value: loading ? "—" : formatWaitTime(stats?.estimatedWaitMinutes ?? 0), unit: "ước tính", highlight: false },
              { label: "Đang phục vụ", value: stats?.currentServing?.name ?? "Trống", unit: "khách hiện tại", highlight: !!stats?.currentServing },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-bg-2 border border-border rounded-[var(--r-xl)] px-7 py-8
                hover:shadow-[var(--shadow-md)] hover:border-border-2 transition-all"
              >
                <p className="label mb-4">{s.label}</p>
                <p className={`font-serif text-[40px] leading-none m-0 mb-1.5 ${s.highlight ? "text-c-green" : "text-c-text"}`}>{s.value}</p>
                <p className="text-[12px] text-c-text-3 m-0">{s.unit}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/booking" className="btn-primary">
              Vào hàng chờ ngay →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-20 px-8 bg-bg-2 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="label mb-3">Dịch vụ</p>
            <h2 className="font-serif text-[36px] text-c-text m-0 mb-3">Chúng tôi cung cấp</h2>
            <div className="divider" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SERVICES.map((sv) => (
              <div
                key={sv.name}
                className="bg-white border border-border rounded-[var(--r-xl)] p-7 text-center
                hover:shadow-[var(--shadow-md)] hover:border-border-2 hover:-translate-y-0.5 transition-all"
              >
                <div className="text-4xl mb-4">{sv.icon}</div>
                <h3 className="font-serif text-[17px] text-c-text m-0 mb-2">{sv.name}</h3>
                <p className="text-[15px] font-semibold text-c-text m-0 mb-1">{sv.price}</p>
                <p className="text-[12px] text-c-text-3 m-0">⏱ {sv.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY + CTA ── */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Gallery */}
          <div className="grid gap-2 mb-16" style={{ gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: "220px 220px" }}>
            {[
              { img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80", gridRow: "1 / 3" },
              { img: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80" },
              { img: "https://images.unsplash.com/photo-1534297635766-a262cdcb8ee4?w=600&q=80" },
              { img: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&q=80" },
              { img: "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=600&q=80" },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-[var(--r-lg)] bg-cover bg-center overflow-hidden cursor-pointer border border-border"
                style={{ backgroundImage: `url(${item.img})`, gridRow: item.gridRow, filter: "grayscale(25%)", transition: "filter 0.35s" }}
                onMouseOver={(e) => (e.currentTarget.style.filter = "grayscale(0%)")}
                onMouseOut={(e) => (e.currentTarget.style.filter = "grayscale(25%)")}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="bg-c-text rounded-[var(--r-2xl)] px-12 py-14 flex justify-between items-center flex-wrap gap-7">
            <div>
              <p className="label text-white/30 mb-2">Sẵn sàng chưa?</p>
              <h2 className="font-serif text-[32px] text-white m-0">Đặt lịch — Hoàn toàn miễn phí</h2>
            </div>
            <Link to="/booking" className="btn-primary" style={{ background: "white", color: "#111" }}>
              Bắt đầu ngay →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
