import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueue, useBarbers, useServices } from "../../hooks/useQueue";
import { formatTime, formatScheduledTime } from "../../utils/timeHelper";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Dashboard() {
  const { queue, loading } = useQueue();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [selectedBarberId, setSelectedBarberId] = useState(() =>
    localStorage.getItem("barber_id") ? Number(localStorage.getItem("barber_id")) : null
  );

  const { barbers, refetchBarbers } = useBarbers(token);
  const { services } = useServices();
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkInServiceIds, setWalkInServiceIds] = useState([]);
  const [walkInName, setWalkInName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!token) navigate("/admin/login");
  }, [token, navigate]);

  const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const call = async (url, method = "PATCH", body = null) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API}${url}`, {
        method,
        headers: auth,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin/login");
        return null;
      }
      if (!res.ok) {
        showToast(data.error || "Lỗi", "err");
        return null;
      }
      return data;
    } catch {
      showToast("Lỗi kết nối", "err");
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  const handleWalkIn = async () => {
    if (!selectedBarberId) return showToast("Chọn tên thợ trước", "err");
    const data = await call("/api/queue/walk-in", "POST", {
      barber_id: selectedBarberId,
      name: walkInName || undefined,
      service_ids: walkInServiceIds,
    });
    if (data) {
      showToast(`✂ Walk-in: ${data.name}`);
      setShowWalkIn(false);
      setWalkInServiceIds([]);
      setWalkInName("");
    }
  };

  const handleStart = async (queueId, name) => {
    if (!selectedBarberId) {
      showToast("Vui lòng chọn tên thợ trước", "err");
      return;
    }
    const data = await call(`/api/queue/${queueId}/start`, "PATCH", { barber_id: selectedBarberId });
    if (data) showToast(`✂ Bắt đầu: ${name}`);
  };

  const handleDone = async (queueId, name) => {
    const body = selectedBarberId ? { barber_id: selectedBarberId } : {};
    const data = await call(`/api/queue/${queueId}/done`, "PATCH", body);
    if (data) showToast(data.next ? `✓ Xong: ${name} → Tiếp: ${data.next.name}` : `✓ Xong: ${name}`);
  };

  const handleSkip = async (queueId, name) => {
    const data = await call(`/api/queue/${queueId}/skip`);
    if (data) showToast(`⏭ Skip: ${name}`);
  };

  const handleToggleBarber = async (barberId) => {
    await call(`/api/queue/barbers/${barberId}/toggle`);
    refetchBarbers();
  };

  const myServing = selectedBarberId
    ? queue.find((q) => q.status === "serving" && q.barber_id === selectedBarberId)
    : queue.find((q) => q.status === "serving");

  const waiting = queue.filter((q) => q.status === "waiting");
  const allServing = queue.filter((q) => q.status === "serving");

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 left-4 md:left-auto md:right-5 z-50 px-5 py-3 rounded-[var(--r-md)] text-[13px] font-medium shadow-[var(--shadow-md)] animate-fade-in text-center md:text-left
          ${toast.type === "err" ? "bg-red-bg border border-red-border text-c-red" : "bg-green-bg border border-green-border text-c-green"}`}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Barber selector ── */}
      <div className="bg-white border border-border rounded-[var(--r-xl)] p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-3 md:mb-4 flex-wrap gap-2">
          <div>
            <p className="label mb-0.5">Bạn là ai?</p>
            <p className="text-[12px] md:text-[13px] text-c-text-2 m-0">Chọn tên để gán khách đúng thợ</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {barbers.map((b) => (
            <div key={b.id} className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setSelectedBarberId(b.id);
                  localStorage.setItem("barber_id", b.id);
                }}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-[var(--r-md)] text-[12px] md:text-[13px] font-medium border transition-all cursor-pointer
                  ${selectedBarberId === b.id
                    ? "bg-c-text text-white border-c-text"
                    : b.is_active
                      ? "bg-white text-c-text border-border hover:border-border-2"
                      : "bg-bg-2 text-c-text-3 border-border opacity-60"
                  }`}
              >
                {b.name}
                {selectedBarberId === b.id && " ✓"}
                {!b.is_active && " (nghỉ)"}
              </button>
              <button
                onClick={() => handleToggleBarber(b.id)}
                title={b.is_active ? "Đánh dấu nghỉ" : "Đánh dấu đi làm"}
                className={`text-[10px] md:text-[11px] px-2 py-1 rounded border cursor-pointer transition-all bg-transparent
                  ${b.is_active
                    ? "border-green-border text-c-green hover:bg-red-bg hover:text-c-red hover:border-red-border"
                    : "border-red-border text-c-red hover:bg-green-bg hover:text-c-green hover:border-green-border"
                  }`}
              >
                {b.is_active ? "Làm" : "Nghỉ"}
              </button>
            </div>
          ))}
          <button onClick={() => setShowWalkIn(true)} className="btn-outline text-[11px] md:text-[12px] py-1.5 px-3">
            + Vãng lai
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
        {[
          { label: "Đang chờ", value: waiting.length, color: "text-c-text" },
          { label: "Đang phục vụ", value: allServing.length, color: "text-c-green" },
          { label: "Thợ đang làm", value: barbers.filter((b) => b.is_active).length, color: "text-blue-500" },
          { label: "Chờ ước tính", value: waiting.length === 0 ? "—" : `~${waiting.length * 25}p`, color: "text-c-amber" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-border rounded-[var(--r-lg)] px-3 md:px-5 py-3 md:py-4">
            <p className="label mb-1 text-[9px] md:text-[10.5px]">{label}</p>
            <p className={`font-serif text-[24px] md:text-[32px] m-0 leading-none ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-4 md:gap-5">
        {/* ── Left: Action panel ── */}
        <div className="flex flex-col gap-4">
          {/* Current serving */}
          <div className="bg-white border border-border rounded-[var(--r-xl)] p-4 md:p-6">
            <p className="label mb-3 md:mb-4">Đang phục vụ</p>
            {myServing ? (
              <>
                <div className="bg-green-bg border border-green-border rounded-[var(--r-lg)] px-4 py-3 mb-3 md:mb-4">
                  <p className="text-[11px] text-c-text-3 m-0 mb-1">{myServing.barber_name || "Thợ"}</p>
                  <p className="font-serif text-[22px] md:text-[26px] text-c-green m-0 leading-tight">{myServing.name}</p>
                  <p className="text-[11px] text-c-text-3 m-0 mt-1">
                    {myServing.phone}
                    {myServing.scheduled_time && ` · Hẹn ${formatScheduledTime(myServing.scheduled_time)}`}
                  </p>
                  {myServing.services?.length > 0 && (
                    <p className="text-[11px] text-c-text-2 m-0 mt-1">{myServing.services.map((s) => s.name).join(" · ")}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleDone(myServing.id, myServing.name)}
                    disabled={actionLoading}
                    className="w-full py-3 rounded-[var(--r-md)] font-semibold text-[14px] text-white bg-c-green border-none hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    ✓ Xong — Next khách
                  </button>
                  <button
                    onClick={() => handleSkip(myServing.id, myServing.name)}
                    disabled={actionLoading}
                    className="btn-outline w-full justify-center py-2.5 text-c-red border-red-border hover:bg-red-bg"
                  >
                    ⏭ Skip khách này
                  </button>
                </div>
              </>
            ) : (
              <div>
                <p className="text-[13px] text-c-text-3 mb-4">
                  {selectedBarberId ? "Bạn chưa nhận khách nào" : "Chưa có ai đang phục vụ"}
                </p>
                {waiting.length > 0 && (
                  <button
                    onClick={() => handleStart(waiting[0].id, waiting[0].name)}
                    disabled={actionLoading || !selectedBarberId}
                    className="btn-primary w-full justify-center py-3"
                    style={{ opacity: !selectedBarberId ? 0.45 : 1 }}
                  >
                    ▶ Nhận: {waiting[0]?.name}
                  </button>
                )}
                {!selectedBarberId && (
                  <p className="text-[11px] text-c-text-3 mt-2 text-center">↑ Chọn tên bạn ở trên trước</p>
                )}
              </div>
            )}
          </div>

          {/* Quick stats - hidden on mobile, shown on desktop */}
          <div className="hidden md:block bg-white border border-border rounded-[var(--r-xl)] px-6 py-5">
            <p className="label mb-4">Thông tin nhanh</p>
            {[
              ["Khách đang chờ", `${waiting.length} người`],
              ["Chờ tối đa", waiting.length === 0 ? "—" : `~${waiting.length * 25} phút`],
              ["Tiếp theo", waiting[0]?.name ?? "—"],
              ["Thợ đang làm", `${barbers.filter((b) => b.is_active).length} / ${barbers.length}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
                <span className="text-[13px] text-c-text-2">{k}</span>
                <span className="text-[13px] font-semibold text-c-text">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Queue list ── */}
        <div className="bg-white border border-border rounded-[var(--r-xl)] overflow-hidden">
          <div className="px-4 md:px-7 py-4 md:py-5 border-b border-border flex justify-between items-center">
            <p className="label m-0">Hàng chờ</p>
            <span className="text-[11px] md:text-[12px] text-c-text-3 bg-bg-2 border border-border px-2.5 py-0.5 rounded-full">
              {waiting.length} người
            </span>
          </div>

          <div className="max-h-[60vh] md:max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center text-c-text-3 text-[13px]">Đang tải...</div>
            ) : waiting.length === 0 ? (
              <div className="py-12 text-center text-c-text-3 text-[13px]">Hàng chờ trống</div>
            ) : (
              waiting.map((entry, i) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 md:gap-4 px-4 md:px-7 py-3 md:py-4 border-b border-border hover:bg-bg-2 transition-colors"
                >
                  <span className="text-[13px] font-semibold text-c-text-3 w-6 md:w-7 flex-shrink-0 tabular-nums">
                    {String(entry.display_position ?? i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-[13px] md:text-[14px] font-semibold text-c-text truncate">{entry.name}</p>
                    <p className="m-0 text-[10px] md:text-[11px] text-c-text-3 truncate">
                      {entry.phone}
                      {entry.scheduled_time && ` · ${formatScheduledTime(entry.scheduled_time)}`}
                    </p>
                    {entry.services?.length > 0 && (
                      <p className="m-0 text-[10px] text-c-text-3 mt-0.5 truncate">
                        {entry.services.map((s) => s.name).join(" · ")}
                      </p>
                    )}
                    {entry.note && (
                      <p className="m-0 text-[10px] text-c-amber mt-0.5 truncate">📝 {entry.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleStart(entry.id, entry.name)}
                      disabled={actionLoading || !selectedBarberId || !!myServing}
                      title={!selectedBarberId ? "Chọn thợ trước" : myServing ? "Bạn đang bận" : "Nhận"}
                      className="text-[10px] md:text-[11px] font-semibold text-c-green border border-green-border
                        px-2 py-1.5 md:px-3 rounded-[var(--r-sm)] hover:bg-green-bg transition-all bg-transparent cursor-pointer
                        disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Nhận
                    </button>
                    <button
                      onClick={() => handleSkip(entry.id, entry.name)}
                      disabled={actionLoading}
                      className="text-[10px] md:text-[11px] font-semibold text-c-red border border-red-border
                        px-2 py-1.5 md:px-3 rounded-[var(--r-sm)] hover:bg-red-bg transition-all bg-transparent cursor-pointer"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* All serving */}
          {allServing.length > 0 && (
            <div className="border-t border-border px-4 md:px-7 py-3 md:py-4">
              <p className="label mb-2 md:mb-3">Đang phục vụ ({allServing.length})</p>
              {allServing.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-1.5 md:py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="live-dot flex-shrink-0" />
                    <span className="text-[12px] md:text-[13px] font-semibold text-c-green truncate">{s.name}</span>
                    <span className="text-[10px] md:text-[11px] text-c-text-3 flex-shrink-0">
                      {s.barber_name ? `· ${s.barber_name}` : ""}
                    </span>
                  </div>
                  <span className="text-[10px] md:text-[11px] text-c-text-3 flex-shrink-0">{formatTime(s.start_time)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal walk-in */}
      {showWalkIn && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white rounded-t-[var(--r-2xl)] md:rounded-[var(--r-xl)] border border-border w-full md:max-w-sm p-5 md:p-6 shadow-[var(--shadow-lg)]">
            {/* Handle bar for mobile */}
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4 md:hidden" />
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <p className="label m-0">Thêm khách vãng lai</p>
              <button onClick={() => setShowWalkIn(false)} className="text-c-text-3 hover:text-c-text bg-transparent border-none cursor-pointer text-lg p-1">
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="text-[11px] font-semibold text-c-text-3 uppercase tracking-wide block mb-1.5">
                Tên khách (tuỳ chọn)
              </label>
              <input
                type="text"
                placeholder="Khách vãng lai"
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="mb-5">
              <label className="text-[11px] font-semibold text-c-text-3 uppercase tracking-wide block mb-2">
                Dịch vụ (tuỳ chọn)
              </label>
              <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
                {services.map((svc) => {
                  const sel = walkInServiceIds.includes(svc.id);
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() =>
                        setWalkInServiceIds((prev) => (sel ? prev.filter((x) => x !== svc.id) : [...prev, svc.id]))
                      }
                      className={`flex justify-between items-center px-3 py-2.5 rounded-[var(--r-md)] border text-left cursor-pointer transition-all
                        ${sel ? "bg-c-text text-white border-c-text" : "bg-white border-border hover:bg-bg-2"}`}
                    >
                      <span className={`text-[13px] font-medium ${sel ? "text-white" : "text-c-text"}`}>{svc.name}</span>
                      <span className={`text-[11px] ${sel ? "text-white/70" : "text-c-text-3"}`}>
                        {svc.duration}p · {svc.price}k
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleWalkIn}
              disabled={actionLoading}
              className="btn-primary w-full justify-center py-3"
            >
              {actionLoading ? "Đang xử lý..." : "✂ Bắt đầu phục vụ ngay"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}