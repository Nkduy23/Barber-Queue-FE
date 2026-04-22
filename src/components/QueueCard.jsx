import StatusBadge from "./StatusBadge";
import { formatTime, formatScheduledTime } from "../utils/timeHelper";
import { calcETAFromScheduled } from "../utils/timeHelper";

export default function QueueCard({ entry, rank, isMe = false }) {
  const isServing = entry.status === "serving";

  // ETA = giờ hẹn + total_duration thực tế của dịch vụ khách đặt
  // Không dùng queuePosition * AVG vì mỗi người có duration khác nhau
  const eta = !isServing ? calcETAFromScheduled(entry.scheduled_time, entry.total_duration ?? 25) : null;

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
          {/* Hiển thị duration nếu dịch vụ dài */}
          {entry.total_duration && entry.total_duration > 30 && <span className="text-[10px] text-c-text-3 bg-bg-2 border border-border px-1.5 py-0.5 rounded">{entry.total_duration} phút</span>}
          {eta && <span className="badge-eta">⏰ Xong ~{eta}</span>}
        </div>
      </div>

      <StatusBadge status={entry.status} />
    </div>
  );
}
