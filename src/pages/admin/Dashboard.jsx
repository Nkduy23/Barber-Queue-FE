import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueue } from "../../hooks/useQueue";
import { formatTime } from "../../utils/timeHelper";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Dashboard() {
  const { queue, loading } = useQueue();
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) navigate("/admin/login");
  }, [token, navigate]);

  const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const call = async (url, method = "PATCH") => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API}${url}`, { method, headers: auth });
      const data = await res.json();
      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin/login");
        return;
      }
      if (!res.ok) showToast(data.error || "Lỗi", "err");
      else showToast(data.name ? `✓ ${data.name}` : data.message || "Thành công");
    } catch {
      showToast("Lỗi kết nối", "err");
    } finally {
      setActionLoading(false);
    }
  };

  const serving = queue.find((q) => q.status === "serving");
  const waiting = queue.filter((q) => q.status === "waiting");

  return (
    <div className="min-h-screen bg-bg-2" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Topnav */}
      <div className="bg-white border-b border-border px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-serif text-[20px] text-c-text">MinhBao</span>
          <span
            className="text-[10px] font-semibold tracking-widest uppercase text-c-text-3
            bg-bg-2 border border-border px-2 py-0.5 rounded-[var(--r-xs)]"
          >
            Admin
          </span>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="live-dot" />
            <span className="text-[12px] text-c-text-3">Live</span>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/admin/login");
            }}
            className="text-[13px] text-c-text-2 hover:text-c-text border border-border
              hover:border-border-2 px-4 py-1.5 rounded-[var(--r-sm)] bg-transparent cursor-pointer transition-all"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-16 right-5 z-50 px-5 py-3 rounded-[var(--r-md)] text-[13px] font-medium
          shadow-[var(--shadow-md)] animate-fade-in
          ${toast.type === "err" ? "bg-red-bg border border-red-border text-c-red" : "bg-green-bg border border-green-border text-c-green"}`}
        >
          {toast.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
          {[
            { label: "Đang chờ", value: waiting.length, color: "text-c-text" },
            { label: "Đang phục vụ", value: serving ? 1 : 0, color: "text-c-green" },
            { label: "Thời gian TB", value: "25 phút", color: "text-c-text" },
            { label: "Tổng hôm nay", value: queue.length, color: "text-c-text" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-border rounded-[var(--r-lg)] px-5 py-5">
              <p className="label mb-2">{s.label}</p>
              <p className={`font-serif text-[36px] m-0 leading-none ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-5">
          {/* Left */}
          <div className="flex flex-col gap-4">
            {/* Serving card */}
            <div className="bg-white border border-border rounded-[var(--r-xl)] p-7">
              <p className="label mb-5">Đang phục vụ</p>
              {serving ? (
                <>
                  <div className="border-l-[2.5px] border-c-green pl-5 mb-6">
                    <p className="font-serif text-[26px] text-c-text m-0 mb-1">{serving.name}</p>
                    <p className="text-[12px] text-c-text-3 m-0">
                      {serving.phone} · từ {formatTime(serving.start_time)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <button onClick={() => call("/api/queue/next")} disabled={actionLoading} className="btn-outline w-full justify-center py-2.5">
                      ⏭ Next khách
                    </button>
                    <button
                      onClick={() => call("/api/queue/done")}
                      disabled={actionLoading}
                      className="w-full py-2.5 rounded-[var(--r-md)] font-medium text-[14px] text-white
                        bg-c-green border-none hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      ✓ Hoàn tất
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[13px] text-c-text-3 mb-6">Chưa có ai đang phục vụ</p>
                  <button
                    onClick={() => call("/api/queue/next")}
                    disabled={actionLoading || waiting.length === 0}
                    className="btn-primary w-full justify-center py-2.5"
                    style={{ opacity: actionLoading || waiting.length === 0 ? 0.45 : 1 }}
                  >
                    ▶ Bắt đầu khách đầu tiên
                  </button>
                </>
              )}
            </div>

            {/* Quick info */}
            <div className="bg-white border border-border rounded-[var(--r-xl)] px-7 py-6">
              <p className="label mb-4">Thông tin nhanh</p>
              {[
                ["Khách đang chờ", `${waiting.length} người`],
                ["Thời gian chờ", waiting.length === 0 ? "Không có" : `~${waiting.length * 20} phút`],
                ["Người chờ lâu nhất", waiting[0]?.name ?? "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                  <span className="text-[13px] text-c-text-2">{k}</span>
                  <span className="text-[13px] font-semibold text-c-text">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: queue list */}
          <div className="bg-white border border-border rounded-[var(--r-xl)] overflow-hidden">
            <div className="px-7 py-5 border-b border-border flex justify-between items-center">
              <p className="label m-0">Hàng chờ</p>
              <span className="text-[12px] text-c-text-3 bg-bg-2 border border-border px-3 py-0.5 rounded-full">{waiting.length} người</span>
            </div>

            <div className="max-h-[460px] overflow-y-auto">
              {loading ? (
                <div className="py-12 text-center text-c-text-3 text-[13px]">Đang tải...</div>
              ) : waiting.length === 0 ? (
                <div className="py-12 text-center text-c-text-3 text-[13px]">Hàng chờ trống</div>
              ) : (
                waiting.map((entry, i) => (
                  <div key={entry.id} className="flex items-center gap-4 px-7 py-4 border-b border-border hover:bg-bg-2 transition-colors">
                    <span className="text-[14px] font-semibold text-c-text-3 w-7 flex-shrink-0 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex-1 min-w-0">
                      <p className="m-0 text-[14px] font-semibold text-c-text truncate">{entry.name}</p>
                      <p className="m-0 text-[11px] text-c-text-3">
                        {entry.phone} · {formatTime(entry.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => call(`/api/queue/${entry.id}/skip`)}
                      disabled={actionLoading}
                      className="text-[11px] font-semibold text-c-red border border-red-border
                        px-3 py-1.5 rounded-[var(--r-sm)] hover:bg-red-bg transition-all bg-transparent cursor-pointer"
                    >
                      Skip
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
