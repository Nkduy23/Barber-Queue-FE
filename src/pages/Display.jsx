import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQueue } from "../hooks/useQueue";
import logo from "../assets/minhbao-removebg-preview.png";

export default function Display() {
  const { queue } = useQueue();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const serving = queue.find((q) => q.status === "serving");
  const waiting = queue.filter((q) => q.status === "waiting").slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col p-12 select-none bg-bg-2" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Top bar */}
      <div className="flex justify-between items-center mb-14">
        <Link to="/" className="flex items-center gap-2.5 no-underline hover:opacity-70 transition-opacity">
          <span className="font-serif text-[24px] text-c-text">MinhBao</span>
          <span className="w-30 h-30 rounded-full flex items-center justify-center overflow-hidden">
            <img src={logo} alt="Logo shop" className="w-full h-full object-contain" />
          </span>{" "}
          <span className="text-[12px] text-c-text-3 ml-1">← Trang chủ</span>
        </Link>
        <div className="text-right">
          <div className="text-[48px] font-semibold leading-none text-c-text tracking-tight tabular-nums">
            {time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" })}
          </div>
          <div className="text-[13px] text-c-text-3 mt-1.5 capitalize">
            {time.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" })}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 grid grid-cols-2 gap-12 items-start">
        {/* Left: Serving */}
        <div>
          <p className="label mb-7">Đang phục vụ</p>
          <div className="pl-7 border-l-[3px] border-c-green">
            {serving ? (
              <>
                <div className="font-serif leading-none mb-4 text-c-green" style={{ fontSize: "clamp(52px,6vw,80px)" }}>
                  {serving.name}
                </div>
                <div className="flex items-center gap-2">
                  <span className="live-dot" />
                  <span className="text-[14px] text-c-text-2">Đang cắt tóc</span>
                </div>
              </>
            ) : (
              <div className="font-serif text-[52px] text-c-text-3">Chờ khách</div>
            )}
          </div>
        </div>

        {/* Right: Queue */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="label m-0">Hàng chờ</p>
            <span className="text-[12px] text-c-text-3 bg-white border border-border px-3 py-1 rounded-full">{waiting.length} người</span>
          </div>

          {waiting.length === 0 ? (
            <div className="font-serif text-[32px] text-c-text-3">Hàng chờ trống</div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {waiting.map((entry, i) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-5 px-5 py-4 rounded-[var(--r-lg)] border transition-all
                    ${i === 0 ? "bg-white border-border-2 border-l-[3px] border-l-c-text" : "bg-white/70 border-border border-l-[3px] border-l-border"}`}
                >
                  <span
                    className={`text-[16px] font-bold w-8 flex-shrink-0 tabular-nums
                    ${i === 0 ? "text-c-text" : "text-c-text-3"}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`font-serif flex-1 ${i === 0 ? "text-[28px] text-c-text" : "text-[22px] text-c-text-2"}`}>{entry.name}</span>
                  {i === 0 && (
                    <span
                      className="text-[10px] font-semibold text-c-text bg-bg-3 border border-border-2
                      px-2.5 py-1 rounded-full tracking-wide uppercase"
                    >
                      Sắp tới lượt
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className="flex justify-between items-center mt-10 pt-6 border-t border-border">
        <div className="flex gap-7">
          <span className="text-[13px] text-c-text-3">📍 Quận 1, TP. Hồ Chí Minh</span>
          <span className="text-[13px] text-c-text-3">📞 0901 234 567</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="text-[11px] text-c-text-3 uppercase tracking-wider">Thời gian thực</span>
        </div>
      </div>
    </div>
  );
}
