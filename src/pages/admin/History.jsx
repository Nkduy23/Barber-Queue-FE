import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { formatTime, formatScheduledTime } from "../../utils/timeHelper";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_MAP = {
  done: { label: "Xong", cls: "bg-green-bg border-green-border text-c-green" },
  serving: { label: "Đang làm", cls: "bg-blue-50 border-blue-200 text-blue-600" },
  waiting: { label: "Chờ", cls: "bg-bg-2 border-border text-c-text-2" },
  skipped: { label: "Skip", cls: "bg-red-bg border-red-border text-c-red" },
};

export default function History() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const todayVN = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  const [selectedDate, setSelectedDate] = useState(todayVN);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(
    async (date) => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/queue/history?date=${date}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/admin/login");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [token, navigate],
  );

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchHistory(selectedDate);
  }, [selectedDate, fetchHistory, token, navigate]);

  const summary = data?.summary;
  const entries = data?.entries || [];

  return (
    <div>
      {/* ── Date picker ── */}
      <div className="flex items-center gap-2 md:gap-4 mb-5 md:mb-6 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-border rounded-[var(--r-lg)] px-3 md:px-4 py-2 md:py-2.5">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="text-c-text-3 flex-shrink-0">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
          </svg>
          <input
            type="date"
            value={selectedDate}
            max={todayVN}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-[12px] md:text-[13px] text-c-text bg-transparent border-none outline-none cursor-pointer"
          />
        </div>
        <button
          onClick={() => setSelectedDate(todayVN)}
          className="text-[11px] md:text-[12px] px-2.5 md:px-3 py-2 rounded-[var(--r-md)] border border-border text-c-text-2 hover:bg-bg-2 cursor-pointer bg-white transition-all"
        >
          Hôm nay
        </button>
        <button
          onClick={() => fetchHistory(selectedDate)}
          className="text-[11px] md:text-[12px] px-2.5 md:px-3 py-2 rounded-[var(--r-md)] border border-border text-c-text-2 hover:bg-bg-2 cursor-pointer bg-white transition-all"
        >
          ↻ Tải lại
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-c-text-3 text-[13px]">Đang tải...</div>
      ) : !data ? null : (
        <>
          {/* ── Summary cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3 mb-5 md:mb-6">
            {[
              { label: "Tổng", value: summary.total, color: "text-c-text" },
              { label: "Hoàn thành", value: summary.done, color: "text-c-green" },
              { label: "Đang phục vụ", value: summary.serving, color: "text-blue-500" },
              { label: "Đang chờ", value: summary.waiting, color: "text-c-text-2" },
              { label: "Skip", value: summary.skipped, color: "text-c-red" },
              {
                label: "TB / khách",
                value: summary.avgServiceMinutes ? `${summary.avgServiceMinutes}p` : "—",
                color: "text-c-text",
              },
              {
                label: "Doanh thu",
                value: summary.totalRevenue ? `${summary.totalRevenue.toLocaleString("vi-VN")}k` : "—",
                color: "text-c-amber",
              },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-border rounded-[var(--r-lg)] px-3 md:px-4 py-3 md:py-4">
                <p className="label mb-1 text-[9px] md:text-[10.5px]">{s.label}</p>
                <p className={`font-serif text-[22px] md:text-[28px] m-0 leading-none ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── By Barber ── */}
          {Object.keys(summary.byBarber).length > 0 && (
            <div className="bg-white border border-border rounded-[var(--r-xl)] p-4 md:p-6 mb-4 md:mb-6">
              <p className="label mb-3 md:mb-4">Theo thợ</p>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {Object.entries(summary.byBarber).map(([name, stat]) => (
                  <div key={name} className="flex items-center gap-2 md:gap-3 border border-border rounded-[var(--r-lg)] px-3 md:px-4 py-2.5 md:py-3 bg-bg-2">
                    <div>
                      <p className="m-0 text-[12px] md:text-[13px] font-semibold text-c-text">{name}</p>
                      <p className="m-0 text-[10px] md:text-[11px] text-c-text-3">
                        {stat.done} xong / {stat.total} tổng
                      </p>
                    </div>
                    <div className="w-16 md:w-20 h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-c-green rounded-full transition-all" style={{ width: stat.total ? `${(stat.done / stat.total) * 100}%` : "0%" }} />
                    </div>
                    <span className="text-[11px] md:text-[12px] font-semibold text-c-text-2">{stat.total ? Math.round((stat.done / stat.total) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Entry list ── */}
          <div className="bg-white border border-border rounded-[var(--r-xl)] overflow-hidden">
            <div className="px-4 md:px-7 py-4 md:py-5 border-b border-border flex justify-between items-center">
              <p className="label m-0">Chi tiết</p>
              <span className="text-[11px] md:text-[12px] text-c-text-3">{entries.length} lượt</span>
            </div>

            {entries.length === 0 ? (
              <div className="py-16 text-center text-c-text-3 text-[13px]">Không có dữ liệu ngày này</div>
            ) : (
              <>
                {/* Mobile card view */}
                <div className="md:hidden divide-y divide-border">
                  {entries.map((e, i) => {
                    const st = STATUS_MAP[e.status] || STATUS_MAP.waiting;
                    return (
                      <div key={e.id} className="px-4 py-3">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[11px] text-c-text-3 tabular-nums flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                            <span className="text-[13px] font-semibold text-c-text truncate">{e.name}</span>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${st.cls}`}>{st.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 ml-6">
                          <span className="text-[11px] text-c-text-3">{e.phone}</span>
                          {e.barber_name && <span className="text-[11px] text-c-text-3">Thợ: {e.barber_name}</span>}
                          {e.scheduled_time && <span className="text-[11px] text-c-text-3">Hẹn: {formatScheduledTime(e.scheduled_time)}</span>}
                          {e.service_minutes && <span className="text-[11px] text-c-text-3">{e.service_minutes} phút</span>}
                          {e.services?.length > 0 && <span className="text-[11px] text-c-text-2 w-full mt-0.5">{e.services.map((s) => s.name).join(", ")}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop table view */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-border bg-bg-2">
                        {["#", "Tên", "SĐT", "Thợ", "Dịch vụ", "Đặt lịch", "Bắt đầu", "Kết thúc", "TG", "Trạng thái"].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-c-text-3 uppercase tracking-wide whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e, i) => {
                        const st = STATUS_MAP[e.status] || STATUS_MAP.waiting;
                        return (
                          <tr key={e.id} className="border-b border-border hover:bg-bg-2 transition-colors">
                            <td className="px-5 py-3 text-c-text-3 tabular-nums">{String(i + 1).padStart(2, "0")}</td>
                            <td className="px-5 py-3 font-semibold text-c-text whitespace-nowrap">{e.name}</td>
                            <td className="px-5 py-3 text-c-text-2 tabular-nums">{e.phone}</td>
                            <td className="px-5 py-3 text-c-text-2">{e.barber_name || "—"}</td>
                            <td className="px-5 py-3 text-c-text-2 max-w-[160px]">
                              {e.services?.length ? <span className="text-[11px] leading-relaxed">{e.services.map((s) => s.name).join(", ")}</span> : "—"}
                            </td>
                            <td className="px-5 py-3 text-c-text-2 tabular-nums">{e.scheduled_time ? formatScheduledTime(e.scheduled_time) : "—"}</td>
                            <td className="px-5 py-3 text-c-text-2 tabular-nums">{e.start_time ? formatTime(e.start_time) : "—"}</td>
                            <td className="px-5 py-3 text-c-text-2 tabular-nums">{e.end_time ? formatTime(e.end_time) : "—"}</td>
                            <td className="px-5 py-3 text-c-text-2 tabular-nums">{e.service_minutes ? `${e.service_minutes}p` : "—"}</td>
                            <td className="px-5 py-3">
                              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${st.cls}`}>{st.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
