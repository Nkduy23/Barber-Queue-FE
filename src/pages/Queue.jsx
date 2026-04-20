import { useQueue } from "../hooks/useQueue";
import QueueCard from "../components/QueueCard";
import { formatWaitTime } from "../utils/timeHelper";
import { Link } from "react-router-dom";

export default function Queue() {
  const { queue, loading } = useQueue();

  const allServing = queue.filter((q) => q.status === "serving");
  const waiting = queue.filter((q) => q.status === "waiting");

  return (
    <div className="bg-bg-2 min-h-[80vh]">
      <div className="max-w-2xl mx-auto px-4 md:px-5 py-6 md:py-10">
        {loading ? (
          <div className="text-center py-20 text-c-text-3">
            <div className="text-3xl mb-3">⏳</div>
            <p className="text-[14px]">Đang tải...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-end justify-between mb-6 md:mb-8">
              <div>
                <p className="label mb-1.5">Hàng chờ</p>
                <h1 className="font-serif text-[26px] md:text-[32px] leading-tight text-c-text m-0">Thời gian thực</h1>
              </div>
              <div className="flex items-center gap-2 pb-1">
                <span className="live-dot" />
                <span className="text-[11px] md:text-[12px] text-c-text-3">Cập nhật liên tục</span>
              </div>
            </div>

            {/* Đang phục vụ */}
            <div className="mb-5 md:mb-6">
              <p className="label mb-2 md:mb-3">Đang phục vụ ({allServing.length})</p>
              {allServing.length === 0 ? (
                <div className="bg-white border border-border rounded-[var(--r-lg)] p-5 md:p-6 text-center text-[12px] md:text-[13px] text-c-text-3">Hiện chưa có khách đang được phục vụ</div>
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
                <p className="label mb-1.5 md:mb-2 text-[9px] md:text-[10.5px]">Chờ lâu nhất</p>
                <p className="font-serif text-[24px] md:text-[32px] text-c-text m-0 leading-none">{formatWaitTime(waiting.length * 25)}</p>
              </div>
            </div>

            {/* Danh sách chờ */}
            <div>
              <p className="label mb-2 md:mb-3">Danh sách chờ ({waiting.length})</p>
              {waiting.length === 0 ? (
                <div className="bg-white border border-border rounded-[var(--r-xl)] py-12 md:py-16 px-6 text-center">
                  <div className="text-3xl mb-3">🎉</div>
                  <p className="text-[14px] md:text-[15px] font-semibold text-c-text mb-1.5">Hàng chờ đang trống!</p>
                  <p className="text-[12px] md:text-[13px] text-c-text-2 mb-5 md:mb-6">Đặt lịch ngay — được phục vụ không chờ đợi</p>
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
