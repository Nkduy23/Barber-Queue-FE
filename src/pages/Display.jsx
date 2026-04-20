import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQueue } from "../hooks/useQueue";
import logo from "../assets/minhbao-removebg-preview.png";

const AVG_MINUTES = 25;
const MAX_VISIBLE = 5;

function fmtScheduled(s) {
  if (!s) return null;
  const m = String(s).match(/(\d{2}:\d{2})/);
  return m ? m[1] : null;
}

function calcETA(entry) {
  const raw = String(entry.scheduled_time ?? "");
  const m = raw.match(/(\d{2}):(\d{2})/);
  if (!m) return null;
  const [, hh, mm] = m;
  const totalMin = parseInt(hh) * 60 + parseInt(mm) + AVG_MINUTES;
  const etaH = Math.floor(totalMin / 60) % 24;
  const etaM = totalMin % 60;
  return `${String(etaH).padStart(2, "0")}:${String(etaM).padStart(2, "0")}`;
}

function OverflowTicker({ items }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!items.length) return;
    setIdx((i) => (i >= items.length ? 0 : i));
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % items.length);
        setVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(cycle);
  }, [items.length]);

  if (!items.length) return null;
  const entry = items[idx] ?? items[0];
  const sch = fmtScheduled(entry.scheduled_time);

  return (
    <div className="flex items-center gap-3 bg-bg-2 border border-border rounded-[var(--r-md)] px-3 py-2 mt-2 overflow-hidden">
      <span className="text-[10px] text-c-text-3 flex-shrink-0 uppercase tracking-wide">+{items.length}</span>
      <div
        style={{
          transition: "opacity 0.4s ease, transform 0.4s ease",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-8px)",
        }}
        className="flex items-center gap-2 min-w-0"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-c-text-3 flex-shrink-0" />
        <span className="text-[12px] font-semibold text-c-text truncate">{entry.name}</span>
        {sch && <span className="text-[10px] text-c-text-3 flex-shrink-0">Hẹn {sch}</span>}
      </div>
    </div>
  );
}

export default function Display() {
  const { queue } = useQueue();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const serving = queue.filter((q) => q.status === "serving");
  const waiting = queue.filter((q) => q.status === "waiting");
  const visibleWaiting = waiting.slice(0, MAX_VISIBLE);
  const overflowWaiting = waiting.slice(MAX_VISIBLE);

  const timeStr = time.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });
  const dateStr = time.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });

  return (
    <div className="min-h-screen flex flex-col select-none bg-bg-2" style={{ fontFamily: "var(--font-sans)" }}>
      {/* ── Top bar ── */}
      <div className="flex justify-between items-center px-4 md:px-10 py-3 md:py-5 bg-white border-b border-border">
        <Link to="/" className="flex items-center gap-2 no-underline hover:opacity-70 transition-opacity min-w-0">
          <span className="font-serif text-[15px] md:text-[20px] text-c-text truncate">Baw Men's Hair</span>
          <span className="w-15 h-15 md:w-30 md:h-30 rounded-full overflow-hidden flex-shrink-0">
            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </span>
        </Link>
        <div className="text-right flex-shrink-0">
          <div className="text-[28px] md:text-[44px] font-semibold leading-none text-c-text tracking-tight tabular-nums">{timeStr}</div>
          <div className="text-[10px] md:text-[12px] text-c-text-3 mt-1 capitalize">{dateStr}</div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-10 p-4 md:p-10 items-start">
        {/* ── Đang phục vụ ── */}
        <div className="w-full">
          <p className="label mb-3 md:mb-5">Đang phục vụ ({serving.length})</p>

          {serving.length === 0 ? (
            <div className="font-serif text-[28px] md:text-[42px] text-c-text-3">Chờ khách...</div>
          ) : (
            <div className="flex flex-col gap-3">
              {serving.map((s) => {
                const sch = fmtScheduled(s.scheduled_time);
                const startStr = s.start_time
                  ? new Date(s.start_time).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Ho_Chi_Minh",
                    })
                  : null;

                return (
                  <div key={s.id} className="bg-green-bg border border-green-border border-l-[3px] rounded-[var(--r-lg)] px-4 md:px-5 py-3 md:py-4">
                    <p className="text-[10px] md:text-[11px] font-semibold text-c-green uppercase tracking-wide m-0 mb-1">{s.barber_name || "Thợ"}</p>
                    <p className="font-serif text-c-text m-0 leading-tight mb-2" style={{ fontSize: "clamp(28px, 5vw, 52px)" }}>
                      {s.name}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="live-dot" />
                      <span className="text-[12px] md:text-[13px] text-c-text-2">Đang cắt tóc</span>
                      {sch && (
                        <>
                          <span className="text-c-text-3 text-[11px]">·</span>
                          <span className="text-[11px] md:text-[12px] text-c-text-3">Hẹn {sch}</span>
                        </>
                      )}
                      {startStr && (
                        <>
                          <span className="text-c-text-3 text-[11px]">·</span>
                          <span className="text-[11px] md:text-[12px] text-c-text-3">Bắt đầu {startStr}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Hàng chờ ── */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-3 md:mb-5">
            <p className="label m-0">Hàng chờ</p>
            <span className="text-[11px] md:text-[12px] text-c-text-3 bg-white border border-border px-2.5 py-0.5 md:px-3 md:py-1 rounded-full">{waiting.length} người</span>
          </div>

          {waiting.length === 0 ? (
            <div className="font-serif text-[24px] md:text-[32px] text-c-text-3">Hàng chờ trống</div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {visibleWaiting.map((entry, i) => {
                  const isFirst = i === 0;
                  const sch = fmtScheduled(entry.scheduled_time);

                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-3 md:gap-4 px-3 md:px-5 py-2.5 md:py-3.5 rounded-[var(--r-lg)] border transition-all
                        ${isFirst ? "bg-white border-border-2 border-l-[2.5px] border-l-c-text" : "bg-white/70 border-border"}`}
                    >
                      <span
                        className={`text-[13px] md:text-[14px] font-semibold w-7 md:w-8 flex-shrink-0 tabular-nums
                          ${isFirst ? "text-c-text" : "text-c-text-3"}`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-serif m-0 leading-tight truncate
                            ${isFirst ? "text-[20px] md:text-[26px] text-c-text" : "text-[16px] md:text-[20px] text-c-text-2"}`}
                        >
                          {entry.name}
                        </p>
                        {sch && <span className="text-[10px] md:text-[11px] text-c-text-3">Hẹn {sch}</span>}
                      </div>

                      {isFirst && (
                        <span className="text-[9px] md:text-[10px] font-semibold text-c-text bg-bg-2 border border-border-2 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full flex-shrink-0 whitespace-nowrap">
                          Sắp tới lượt
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <OverflowTicker items={overflowWaiting} />
            </>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex flex-wrap justify-between items-center gap-2 px-4 md:px-10 py-3 md:py-5 border-t border-border bg-white">
        <div className="flex flex-wrap gap-3 md:gap-6">
          <span className="text-[11px] md:text-[12px] text-c-text-3">Xã Củ Chi, TP. Hồ Chí Minh</span>
          <span className="text-[11px] md:text-[12px] text-c-text-3">0815 934 934</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="text-[10px] md:text-[11px] text-c-text-3 uppercase tracking-wider">Thời gian thực</span>
        </div>
      </div>
    </div>
  );
}
