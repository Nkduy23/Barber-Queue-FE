import { useQueue } from "../hooks/useQueue";
import QueueCard from "../components/QueueCard";
import { formatWaitTime } from "../utils/timeHelper";
import { Link } from "react-router-dom";

export default function Queue() {
  const { queue, loading } = useQueue();

  const serving = queue.find((q) => q.status === "serving");
  const waiting = queue.filter((q) => q.status === "waiting");

  return (
    <div className="bg-bg-2 min-h-[80vh]">
      <div className="max-w-2xl mx-auto px-5 py-10">
        {loading ? (
          <div className="text-center py-20 text-c-text-3">
            <div className="text-3xl mb-3">⏳</div>
            <p className="text-[14px]">Đang tải...</p>
          </div>
        ) : (
          <>
            {/* Page header */}
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="label mb-1.5">Hàng chờ</p>
                <h1 className="font-serif text-[32px] leading-tight text-c-text m-0">Thời gian thực</h1>
              </div>
              <div className="flex items-center gap-2 pb-1">
                <span className="live-dot" />
                <span className="text-[12px] text-c-text-3">Cập nhật liên tục</span>
              </div>
            </div>

            {/* Currently serving */}
            <div className="mb-6">
              <p className="label mb-3">Đang phục vụ</p>
              {serving ? (
                <QueueCard entry={serving} rank="✂" />
              ) : (
                <div className="bg-white border border-border rounded-[var(--r-lg)] p-6 text-center text-[13px] text-c-text-3">Hiện chưa có khách đang được phục vụ</div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white border border-border rounded-[var(--r-lg)] px-5 py-5">
                <p className="label mb-2">Số người đang chờ</p>
                <p className="font-serif text-[40px] text-c-text m-0 leading-none">{waiting.length}</p>
              </div>
              <div className="bg-white border border-border rounded-[var(--r-lg)] px-5 py-5">
                <p className="label mb-2">Thời gian chờ tối đa</p>
                <p className="font-serif text-[32px] text-c-text m-0 leading-none">{formatWaitTime(waiting.length * 20)}</p>
              </div>
            </div>

            {/* Waiting list */}
            <div>
              <p className="label mb-3">Danh sách chờ ({waiting.length})</p>
              {waiting.length === 0 ? (
                <div className="bg-white border border-border rounded-[var(--r-xl)] py-16 px-6 text-center">
                  <div className="text-3xl mb-3">🎉</div>
                  <p className="text-[15px] font-semibold text-c-text mb-1.5">Hàng chờ đang trống!</p>
                  <p className="text-[13px] text-c-text-2 mb-6">Đặt lịch ngay — được phục vụ không chờ đợi</p>
                  <Link to="/booking" className="btn-primary inline-flex">
                    Đặt lịch ngay →
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {waiting.map((entry, i) => (
                    <QueueCard key={entry.id} entry={entry} rank={i + 1} queuePosition={i + 1} />
                  ))}
                </div>
              )}
            </div>

            {waiting.length > 0 && (
              <div className="mt-8 text-center">
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
