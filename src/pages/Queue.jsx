import { useQueue } from "../hooks/useQueue";
import QueueCard from "../components/QueueCard";
import { formatWaitTime, todayVN } from "../utils/timeHelper";
import { Link, useSearchParams } from "react-router-dom";
import { useMemo } from "react";

function generateDates(count = 30) {
  const result = [];
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const iso = d.toLocaleDateString("en-CA");
    const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    result.push({ iso, label: weekdays[d.getDay()], day: d.getDate(), month: d.getMonth() + 1, isToday: i === 0 });
  }
  return result;
}

function DateTab({ date, selected, onClick }) {
  const isSelected = selected === date.iso;
  return (
    <button
      onClick={() => onClick(date.iso)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        padding: "8px 10px",
        borderRadius: 10,
        border: isSelected ? "1.5px solid #111" : "1.5px solid #e5e5e5",
        background: isSelected ? "#111" : "#fff",
        cursor: "pointer",
        transition: "all 0.15s ease",
        minWidth: 48,
        flexShrink: 0,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, color: isSelected ? "rgba(255,255,255,0.6)" : "#999", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {date.isToday ? "Hôm nay" : date.label}
      </span>
      <span style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 700, lineHeight: 1.1, color: isSelected ? "#fff" : "#111" }}>{date.day}</span>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: isSelected ? "rgba(255,255,255,0.5)" : "#bbb" }}>Th{date.month}</span>
    </button>
  );
}

function QueueSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-[var(--r-lg)] border border-border bg-white">
      <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <div className="skeleton h-3.5 w-32 rounded mb-2" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
      <div className="skeleton h-6 w-16 rounded-full" />
    </div>
  );
}

export default function Queue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const today = todayVN();

  const selectedDate = useMemo(() => {
    const d = searchParams.get("date");
    if (!d) return today;
    const maxDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    maxDate.setDate(maxDate.getDate() + 29);
    const picked = new Date(d + "T12:00:00+07:00");
    const todayDate = new Date(today + "T12:00:00+07:00");
    if (picked < todayDate || picked > maxDate) return today;
    return d;
  }, [searchParams, today]);

  const { queue, loading } = useQueue(selectedDate);
  const dates = useMemo(() => generateDates(30), []);

  const isOutOfRange = useMemo(() => {
    const d = searchParams.get("date");
    if (!d) return false;
    const maxDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    maxDate.setDate(maxDate.getDate() + 29);
    const picked = new Date(d + "T12:00:00+07:00");
    const todayDate = new Date(today + "T12:00:00+07:00");
    return picked > maxDate || picked < todayDate;
  }, [searchParams, today]);

  const allServing = queue.filter((q) => q.status === "serving");
  const waiting = queue.filter((q) => q.status === "waiting");

  const handleDateSelect = (iso) => {
    if (iso === today) setSearchParams({}, { replace: true });
    else setSearchParams({ date: iso }, { replace: true });
  };

  const formatSelectedDate = (iso) => {
    const d = new Date(iso + "T12:00:00+07:00");
    const weekdays = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
    return `${weekdays[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
    <div className="bg-bg-2 min-h-[80vh]">
      <div className="max-w-2xl mx-auto px-4 md:px-5 py-6 md:py-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-5 md:mb-6">
          <div>
            <p className="label mb-1.5">Hàng chờ</p>
            <h1 className="font-serif text-[26px] md:text-[32px] leading-tight text-c-text m-0">Thời gian thực</h1>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <span className="live-dot" />
            <span className="text-[11px] md:text-[12px] text-c-text-3">Cập nhật liên tục</span>
          </div>
        </div>

        {/* Date Picker */}
        <div className="bg-white border border-border rounded-[var(--r-lg)] p-4 mb-4">
          <p className="m-0 mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-c-text-3">Chọn ngày xem lịch</p>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {dates.map((date) => (
              <DateTab key={date.iso} date={date} selected={selectedDate} onClick={handleDateSelect} />
            ))}
          </div>
          {selectedDate !== today && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[12px] text-c-text font-medium">📅 {formatSelectedDate(selectedDate)}</span>
              <button onClick={() => handleDateSelect(today)} className="text-[11px] text-c-text font-semibold bg-bg-2 border border-border rounded-[var(--r-sm)] px-2.5 py-1 cursor-pointer">
                Về hôm nay
              </button>
            </div>
          )}
        </div>

        {isOutOfRange && (
          <div className="bg-amber-bg border border-amber-border rounded-[var(--r-md)] p-3 mb-4 flex gap-2.5 items-start">
            <span className="text-base flex-shrink-0">⚠️</span>
            <p className="m-0 text-[12px] md:text-[13px] text-c-text-2 leading-relaxed">
              Ngày vượt quá 30 ngày tới. Hệ thống chỉ hỗ trợ xem lịch trong vòng <strong>30 ngày</strong>.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-3">
            {/* Skeleton serving */}
            <div className="bg-green-bg border border-green-border rounded-[var(--r-lg)] px-5 py-4">
              <div className="skeleton h-3 w-20 rounded mb-2" />
              <div className="skeleton h-6 w-40 rounded" />
            </div>
            {/* Skeleton stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white border border-border rounded-[var(--r-lg)] px-4 py-4">
                <div className="skeleton h-3 w-24 rounded mb-2" />
                <div className="skeleton h-10 w-12 rounded" />
              </div>
              <div className="bg-white border border-border rounded-[var(--r-lg)] px-4 py-4">
                <div className="skeleton h-3 w-24 rounded mb-2" />
                <div className="skeleton h-10 w-16 rounded" />
              </div>
            </div>
            {/* Skeleton queue cards */}
            {[1, 2, 3].map((i) => (
              <QueueSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Đang phục vụ */}
            <div className="mb-5 md:mb-6">
              <p className="label mb-2 md:mb-3">Đang phục vụ ({allServing.length})</p>
              {allServing.length === 0 ? (
                <div className="bg-white border border-border rounded-[var(--r-lg)] p-5 text-center text-[12px] md:text-[13px] text-c-text-3">
                  {selectedDate === today ? "Hiện chưa có khách đang được phục vụ" : "Chưa có dữ liệu phục vụ cho ngày này"}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {allServing.map((entry) => (
                    <div key={entry.id} className="bg-green-bg border border-green-border rounded-[var(--r-lg)] px-4 md:px-5 py-3 md:py-4 flex items-center gap-3">
                      <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-green-border flex items-center justify-center text-base flex-shrink-0">✂</div>
                      <div className="flex-1 min-w-0">
                        <p className="m-0 text-[13px] md:text-[14px] font-semibold text-c-green truncate">{entry.name}</p>
                        <p className="m-0 text-[10px] md:text-[11px] text-c-text-3">{entry.barber_name && `Thợ: ${entry.barber_name} · `}Đang cắt tóc</p>
                      </div>
                      <span className="badge badge-serving flex-shrink-0">Đang cắt</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 md:gap-3 mb-5 md:mb-6">
              <div className="bg-white border border-border rounded-[var(--r-lg)] px-4 md:px-5 py-4 md:py-5">
                <p className="label mb-1.5 md:mb-2 text-[9px] md:text-[10.5px]">Khách đã đặt lịch</p>
                <p className="font-serif text-[32px] md:text-[40px] text-c-text m-0 leading-none">{waiting.length}</p>
              </div>
              <div className="bg-white border border-border rounded-[var(--r-lg)] px-4 md:px-5 py-4 md:py-5">
                <p className="label mb-1.5 md:mb-2 text-[9px] md:text-[10.5px]">{waiting.length === 0 ? "Trạng thái" : "Chờ lâu nhất"}</p>
                {waiting.length === 0 ? (
                  <p className="font-serif text-[20px] md:text-[26px] text-c-green m-0 leading-none">✨ Trống!</p>
                ) : (
                  <p className="font-serif text-[24px] md:text-[32px] text-c-text m-0 leading-none">{formatWaitTime(waiting.length * 25)}</p>
                )}
              </div>
            </div>

            {/* Danh sách chờ */}
            <div>
              <p className="label mb-2 md:mb-3">Danh sách chờ ({waiting.length})</p>
              {waiting.length === 0 ? (
                <div className="bg-white border border-border rounded-[var(--r-xl)] py-12 md:py-16 px-6 text-center">
                  <div className="text-3xl mb-3">🎉</div>
                  <p className="text-[14px] md:text-[15px] font-semibold text-c-text mb-1.5">{selectedDate === today ? "Hàng chờ đang trống!" : "Chưa có lịch hẹn ngày này"}</p>
                  <p className="text-[12px] md:text-[13px] text-c-green font-medium mb-5 md:mb-6">
                    {selectedDate === today ? "✨ Đến ngay — được phục vụ không chờ đợi!" : "Bạn có thể đặt lịch trước cho ngày này"}
                  </p>
                  <Link to="/booking" className="btn-primary inline-flex">
                    Đặt lịch ngay →
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {waiting.map((entry, i) => (
                    <QueueCard key={entry.id} entry={entry} rank={entry.display_position ?? i + 1} queuePosition={i + 1} />
                  ))}
                </div>
              )}
            </div>

            {waiting.length > 0 && (
              <div className="mt-6 md:mt-8 text-center">
                <Link to="/booking" className="btn-outline">
                  Vào hàng chờ →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
