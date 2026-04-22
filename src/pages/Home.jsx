import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQueue } from "../hooks/useQueue";
import { formatWaitTime } from "../utils/timeHelper";
import { useServices } from "../hooks/useQueue";

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

const SERVICES_FALLBACK = [
  { icon: "✂️", name: "Cắt tóc cơ bản", price: "50.000đ", time: "20 phút" },
  { icon: "🪒", name: "Cạo mặt", price: "10.000đ", time: "15 phút" },
  { icon: "💆", name: "Gội + Massage", price: "60.000đ", time: "20 phút" },
  { icon: "🎨", name: "Nhuộm tóc", price: "200.000đ", time: "60 phút" },
];

const PRODUCTS = [
  {
    img: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&q=80",
    name: "Pomade Wax",
    brand: "American Crew",
    desc: "Độ bóng cao, giữ nếp cả ngày. Phù hợp slick back & side part.",
    tag: "Bán chạy",
    tagColor: "#d97706",
    tagBg: "#fffbeb",
  },
  {
    img: "https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=600&q=80",
    name: "Hair Clay",
    brand: "Layrite",
    desc: "Lực giữ mạnh, mờ tự nhiên. Tạo kiểu rối bụi, texture cực xịn.",
    tag: "Phổ biến",
    tagColor: "#16a34a",
    tagBg: "#f0fdf4",
  },
  {
    img: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80",
    name: "Dưỡng râu",
    brand: "Bulldog",
    desc: "Dầu beard oil dưỡng ẩm, làm mềm râu & khử mùi suốt ngày dài.",
    tag: "Mới về",
    tagColor: "#0284c7",
    tagBg: "#f0f9ff",
  },
  {
    img: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80",
    name: "Dầu gội nam",
    brand: "Redken Brews",
    desc: "Làm sạch sâu, giảm gầu, tạo độ phồng tự nhiên cho mọi kiểu tóc.",
    tag: "Gợi ý",
    tagColor: "#7c3aed",
    tagBg: "#faf5ff",
  },
];

function StatSkeleton() {
  return (
    <div className="bg-bg-2 border border-border rounded-[var(--r-xl)] px-5 md:px-7 py-6 md:py-8">
      <div className="skeleton h-3 w-20 rounded mb-4" />
      <div className="skeleton h-12 w-16 rounded mb-2" />
      <div className="skeleton h-3 w-12 rounded" />
    </div>
  );
}

export default function Home() {
  const { stats, loading } = useQueue();
  const [slide, setSlide] = useState(0);
  const [kenBurns, setKenBurns] = useState(0);
  const { services } = useServices();

  useEffect(() => {
    const t = setInterval(() => {
      setSlide((s) => (s + 1) % SLIDES.length);
      setKenBurns((k) => k + 1);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  const current = SLIDES[slide];

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative h-[55vh] min-h-[380px] md:h-[45vh] md:min-h-[450px] overflow-hidden">
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${s.img})`,
              opacity: i === slide ? 1 : 0,
              transition: "opacity 1.2s ease",
              transform: i === slide ? "scale(1.06)" : "scale(1)",
              animation: i === slide ? "kenBurns 6s ease-out forwards" : "none",
            }}
          />
        ))}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(10,10,10,0.85) 55%, rgba(10,10,10,0.3))" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 h-full flex items-center">
          <div key={slide} className="animate-fade-up w-full">
            <span className="block label text-white/40 mb-3 md:mb-5 tracking-[0.12em]">— {current.tag}</span>
            <h1 className="font-serif text-white m-0 mb-4 md:mb-6 leading-[1.04]" style={{ fontSize: "clamp(36px, 8vw, 84px)", whiteSpace: "pre-line" }}>
              {current.title}
            </h1>
            <p className="text-white/60 text-[13px] md:text-[15px] mb-5 md:mb-8 max-w-[340px] leading-[1.8]">{current.sub}</p>

            {/* Social proof */}
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5">
                <span className="text-yellow-400 text-[13px]">★★★★★</span>
                <span className="text-white/80 text-[11px] font-medium ml-1">4.9 · 200+ khách</span>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap items-center">
              <Link to="/booking" className="btn-primary" style={{ background: "white", color: "#111", padding: "11px 22px", fontSize: 14 }}>
                Đặt lịch ngay →
              </Link>
              <Link to="/queue" className="text-white/60 hover:text-white no-underline text-[13px] md:text-[14px] font-medium border-b border-white/20 pb-0.5 transition-colors">
                Xem hàng chờ
              </Link>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className="h-1.5 rounded-full border-none cursor-pointer transition-all duration-300 p-0"
              style={{ width: i === slide ? 24 : 6, background: i === slide ? "#fff" : "rgba(255,255,255,0.3)" }}
            />
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-white border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-6 md:mb-10 flex-wrap gap-4">
            <div>
              <p className="label mb-2">Cập nhật liên tục · Thời gian thực</p>
              <h2 className="font-serif text-[24px] md:text-[32px] text-c-text m-0">Tình trạng hôm nay</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span className="text-[12px] text-c-text-3">Đang hoạt động</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-10">
            {loading ? (
              <>
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
              </>
            ) : (
              <>
                <div className="bg-bg-2 border border-border rounded-[var(--r-xl)] px-5 md:px-7 py-6 md:py-8 hover:shadow-[var(--shadow-md)] hover:border-border-2 transition-all">
                  <p className="label mb-3 md:mb-4">Đang chờ</p>
                  <p className="font-serif text-[48px] md:text-[56px] leading-none m-0 mb-1.5 text-c-text">{stats?.waitingCount ?? 0}</p>
                  <p className="text-[12px] text-c-text-3 m-0">người</p>
                </div>

                <div className="bg-bg-2 border border-border rounded-[var(--r-xl)] px-5 md:px-7 py-6 md:py-8 hover:shadow-[var(--shadow-md)] hover:border-border-2 transition-all">
                  <p className="label mb-3 md:mb-4">Thời gian chờ</p>
                  <p className="font-serif text-[32px] md:text-[40px] leading-none m-0 mb-1.5 text-c-text">{stats?.waitingCount === 0 ? "0 phút" : formatWaitTime(stats?.estimatedWaitMinutes ?? 0)}</p>
                  <p className="text-[12px] text-c-text-3 m-0">{stats?.waitingCount === 0 ? "✨ Đến ngay — phục vụ tức thì!" : "ước tính"}</p>
                </div>

                <div className="bg-bg-2 border border-border rounded-[var(--r-xl)] px-5 md:px-7 py-6 md:py-8 hover:shadow-[var(--shadow-md)] hover:border-border-2 transition-all">
                  <p className="label mb-3 md:mb-4">Đang phục vụ</p>
                  {!stats?.currentServing?.length ? (
                    <>
                      <p className="font-serif text-[32px] md:text-[40px] leading-none m-0 mb-1.5 text-c-text-3">Trống</p>
                      <p className="text-[12px] text-c-text-3 m-0">khách hiện tại</p>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2.5 mt-1">
                      {stats.currentServing.map((p) => (
                        <div key={p.id} className="flex items-center gap-2.5">
                          <span className="live-dot flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="m-0 text-[14px] md:text-[15px] font-semibold text-c-green leading-tight truncate">{p.name}</p>
                            <p className="m-0 text-[11px] text-c-text-3 leading-tight">{p.barber_name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="text-center">
            <Link to="/booking" className="btn-primary">
              Đặt lịch ngay →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-bg-2 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <p className="label mb-3">Dịch vụ</p>
            <h2 className="font-serif text-[28px] md:text-[36px] text-c-text m-0 mb-3">Chúng tôi cung cấp</h2>
            <div className="divider" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {(services.length ? services.slice(0, 4) : SERVICES_FALLBACK).map((sv) => (
              <div
                key={sv.name}
                className="bg-white border border-border rounded-[var(--r-xl)] p-5 md:p-7 text-center hover:shadow-[var(--shadow-md)] hover:border-border-2 hover:-translate-y-0.5 transition-all"
              >
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">{sv.icon}</div>
                <h3 className="font-serif text-[15px] md:text-[17px] text-c-text m-0 mb-2 leading-tight">{sv.name}</h3>
                <p className="text-[14px] md:text-[15px] font-semibold text-c-text m-0 mb-1">{sv.price?.toLocaleString?.("vi-VN") ?? sv.price}đ</p>
                <p className="text-[11px] md:text-[12px] text-c-text-3 m-0">⏱ {sv.duration ?? sv.time} phút</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SẢN PHẨM TẠI SHOP ── */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-white border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-10 md:mb-14">
            <div>
              <p className="label mb-3">Sản phẩm tại cửa hàng</p>
              <h2 className="font-serif text-[28px] md:text-[36px] text-c-text m-0 mb-2">Có sẵn tại shop</h2>
              <p className="text-[13px] text-c-text-3 m-0">Các sản phẩm chăm sóc tóc & râu chúng tôi đang dùng và phân phối tại tiệm</p>
            </div>
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-c-text-3 border border-border rounded-full px-3 py-1.5 bg-bg-2 self-start md:self-auto">
              🛍️ Chỉ bán tại cửa hàng
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {PRODUCTS.map((p) => (
              <div
                key={p.name}
                className="bg-white border border-border rounded-[var(--r-xl)] overflow-hidden hover:shadow-[var(--shadow-md)] hover:border-border-2 hover:-translate-y-0.5 transition-all group"
              >
                {/* Ảnh */}
                <div className="relative overflow-hidden" style={{ aspectRatio: "1/1", background: "#f8f8f8" }}>
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: p.tagColor, background: p.tagBg }}>
                    {p.tag}
                  </span>
                </div>

                {/* Info */}
                <div className="p-3 md:p-4">
                  <p className="text-[9px] md:text-[10px] font-semibold text-c-text-3 uppercase tracking-wider m-0 mb-0.5">{p.brand}</p>
                  <h3 className="font-serif text-[14px] md:text-[15px] text-c-text m-0 mb-1.5 leading-tight">{p.name}</h3>
                  <p className="text-[11px] md:text-[12px] text-c-text-2 m-0 leading-relaxed line-clamp-2">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-[12px] text-c-text-3 mt-6 md:mt-8">Ghé trực tiếp để được tư vấn sản phẩm phù hợp với kiểu tóc của bạn ✂️</p>
        </div>
      </section>

      {/* ── GALLERY + CTA ── */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-bg-2">
        <div className="max-w-6xl mx-auto">
          {/* Gallery desktop */}
          <div className="hidden md:grid gap-2 mb-16" style={{ gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: "220px 220px" }}>
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
                style={{
                  backgroundImage: `url(${item.img})`,
                  gridRow: item.gridRow,
                  filter: "grayscale(25%)",
                  transition: "filter 0.35s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.filter = "grayscale(0%)")}
                onMouseOut={(e) => (e.currentTarget.style.filter = "grayscale(25%)")}
              />
            ))}
          </div>

          {/* Gallery mobile */}
          <div className="grid grid-cols-2 gap-2 mb-10 md:hidden">
            {[
              "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
              "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80",
              "https://images.unsplash.com/photo-1534297635766-a262cdcb8ee4?w=600&q=80",
              "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&q=80",
            ].map((img, i) => (
              <div key={i} className="h-[140px] rounded-[var(--r-lg)] bg-cover bg-center border border-border" style={{ backgroundImage: `url(${img})`, filter: "grayscale(20%)" }} />
            ))}
          </div>

          {/* CTA */}
          <div className="bg-c-text rounded-[var(--r-2xl)] px-6 md:px-12 py-10 md:py-14 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 md:gap-7">
            <div>
              <p className="label text-white/30 mb-2">Sẵn sàng chưa?</p>
              <h2 className="font-serif text-[24px] md:text-[32px] text-white m-0">Đặt lịch — Hoàn toàn miễn phí</h2>
            </div>
            <Link to="/booking" className="btn-primary flex-shrink-0" style={{ background: "white", color: "#111" }}>
              Bắt đầu ngay →
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes kenBurns {
          from { transform: scale(1); }
          to   { transform: scale(1.08); }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
