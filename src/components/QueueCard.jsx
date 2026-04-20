import StatusBadge from "./StatusBadge";
import { formatTime, formatScheduledTime, calcWaitMinutes } from "../utils/timeHelper";
import { calcETAFromScheduled } from "../utils/timeHelper";

/**
 * Tính ETA dựa trên scheduled_time (nếu có) hoặc now
 * Logic: base + queuePosition * AVG_MINUTES
 *   - Có scheduled_time → base = scheduled_time (giờ VN, bóc từ string)
 *   - Walk-in           → base = now
 */
function calcETA(entry, queuePosition) {
  if (queuePosition == null) return null;

  const waitMs = calcWaitMinutes(queuePosition) * 60 * 1000;

  let baseTime;
  if (entry.scheduled_time) {
    // Bóc HH:MM từ string VN naive (tránh bị lệch TZ)
    const match = String(entry.scheduled_time).match(/(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
    if (match) {
      // Ghép lại không có Z → browser parse như local time (VN nếu máy đặt VN, hoặc dùng trick bên dưới)
      // Dùng Date.parse với offset tường minh để luôn đúng dù máy ở timezone nào
      const [, datePart, timePart] = match;
      // "+07:00" = VN timezone
      baseTime = new Date(`${datePart}T${timePart}:00+07:00`).getTime();
    } else {
      baseTime = Date.now();
    }
  } else {
    baseTime = Date.now();
  }

  const etaDate = new Date(baseTime + waitMs);
  return etaDate.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

export default function QueueCard({ entry, rank, isMe = false, queuePosition = null }) {
  const isServing = entry.status === "serving";
  const etaTime = !isServing ? calcETA(entry, queuePosition) : null;
  const eta = calcETAFromScheduled(entry.scheduled_time);

  return (
    <div
      className={`
        flex items-center gap-4 px-5 py-4 rounded-[var(--r-lg)] border transition-all duration-150
        hover:shadow-[var(--shadow-sm)] cursor-default
        ${isServing ? "bg-green-bg border-green-border" : isMe ? "bg-bg-2 border-c-text" : "bg-white border-border hover:border-border-2"}
      `}
    >
      {/* Rank */}
      <div
        className={`
          w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[13px] font-semibold
          ${isServing ? "bg-green-bg text-c-green border border-green-border text-base" : isMe ? "bg-c-text text-white" : "bg-bg-2 text-c-text-2"}
        `}
      >
        {isServing ? "✂" : rank}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-[14px] font-semibold m-0 truncate ${isServing ? "text-c-green" : "text-c-text"}`}>{entry.name}</p>
          {isMe && <span className="text-[10px] bg-c-text text-white px-2 py-0.5 rounded-full font-semibold tracking-wide">BẠN</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {entry.scheduled_time ? (
            <p className="text-[12px] m-0 text-c-text-3">Hẹn lúc: {formatScheduledTime(entry.scheduled_time)}</p>
          ) : (
            <p className="text-[12px] m-0 text-c-text-3">Đặt lúc: {formatTime(entry.created_at)}</p>
          )}
          {etaTime && <span className="badge-eta">Dự kiến xong: ⏰{eta ? ` ~${eta}` : null}</span>}
        </div>
      </div>

      <StatusBadge status={entry.status} />
    </div>
  );
}
