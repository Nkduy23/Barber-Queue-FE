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

export default function About() {
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

      {/* Team — redesigned cards */}
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
                {/* Ảnh */}
                <div className="h-64 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${member.img})`, filter: "grayscale(15%)" }} />
                {/* Tag */}
                <span className="absolute top-3 right-3 text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-c-text px-2.5 py-1 rounded-full border border-border">{member.tag}</span>
                {/* Info overlay */}
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

      {/* CTA */}
      <section className="py-18 px-8 bg-bg-2 border-t border-border text-center">
        <h2 className="font-serif text-[32px] text-c-text mb-6">Trải nghiệm ngay hôm nay</h2>
        <Link to="/booking" className="btn-primary">
          Đặt lịch — Miễn phí →
        </Link>
      </section>
    </div>
  );
}
