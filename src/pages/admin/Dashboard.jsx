import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueue, useBarbers, useServices } from "../../hooks/useQueue";
import { formatTime, formatScheduledTime } from "../../utils/timeHelper";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Dashboard() {
  const [viewDate, setViewDate] = useState(() => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }));
  const { queue: rawQueue, loading } = useQueue(viewDate);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Optimistic overrides: id → partial patch to apply on top of server data
  const [overrides, setOverrides] = useState({});

  const [selectedBarberId, setSelectedBarberId] = useState(() => (localStorage.getItem("barber_id") ? Number(localStorage.getItem("barber_id")) : null));
  const { barbers, refetchBarbers } = useBarbers(token);
  const { services } = useServices();
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkInServiceIds, setWalkInServiceIds] = useState([]);
  const [walkInName, setWalkInName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const isToday = viewDate === new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });

  useEffect(() => {
    if (!token) navigate("/admin/login");
  }, [token, navigate]);

  // When server data refreshes, clear overrides that have been reconciled
  useEffect(() => {
    setOverrides({});
  }, [rawQueue]);

  // Apply optimistic overrides on top of server queue
  const queue = rawQueue.map((entry) => (overrides[entry.id] ? { ...entry, ...overrides[entry.id] } : entry));

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
    // Optimistic update: immediately move to serving
    const barber = barbers.find((b) => b.id === selectedBarberId);
    setOverrides((prev) => ({
      ...prev,
      [queueId]: { status: "serving", barber_id: selectedBarberId, barber_name: barber?.name ?? "" },
    }));
    const data = await call(`/api/queue/${queueId}/start`, "PATCH", { barber_id: selectedBarberId });
    if (data) {
      showToast(`✂ Bắt đầu: ${name}`);
    } else {
      // Revert on error
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[queueId];
        return next;
      });
    }
  };

  const handleDone = async (queueId, name) => {
    const body = selectedBarberId ? { barber_id: selectedBarberId } : {};
    // Optimistic: mark as done
    setOverrides((prev) => ({ ...prev, [queueId]: { status: "done" } }));
    const data = await call(`/api/queue/${queueId}/done`, "PATCH", body);
    if (data) {
      showToast(data.next ? `✓ Xong: ${name} → Tiếp: ${data.next.name}` : `✓ Xong: ${name}`);
    } else {
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[queueId];
        return next;
      });
    }
  };

  const handleSkip = async (queueId, name) => {
    setOverrides((prev) => ({ ...prev, [queueId]: { status: "skipped" } }));
    const data = await call(`/api/queue/${queueId}/skip`);
    if (data) {
      showToast(`⏭ Skip: ${name}`);
    } else {
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[queueId];
        return next;
      });
    }
  };

  const handleToggleBarber = async (barberId) => {
    await call(`/api/queue/barbers/${barberId}/toggle`);
    refetchBarbers();
  };

  const myServing = selectedBarberId ? queue.find((q) => q.status === "serving" && q.barber_id === selectedBarberId) : queue.find((q) => q.status === "serving");

  const waiting = queue.filter((q) => q.status === "waiting");
  const allServing = queue.filter((q) => q.status === "serving");

  return (
    <div>
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-4 right-4 left-4 md:left-auto md:right-5 z-50 px-5 py-3 rounded-[var(--r-md)] text-[13px] font-medium shadow-[var(--shadow-md)] animate-fade-in text-center md:text-left
            ${toast.type === "err" ? "bg-red-bg border border-red-border text-c-red" : "bg-green-bg border border-green-border text-c-green"}`}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Barber selector ── */}
      <div className="bg-white border border-border rounded-[var(--r-xl)] p-4 md:p-6 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="label mb-1">Bạn là ai?</p>
            <p className="text-[12px] text-c-text-3 m-0 mb-3">Chọn tên để gán khách đúng thợ</p>
            <div className="flex flex-wrap gap-2">
              {barbers.map((b) => (
                <div key={b.id} className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (!b.is_active) return;
                      setSelectedBarberId(b.id);
                      localStorage.setItem("barber_id", b.id);
                    }}
                    disabled={!b.is_active}
                    className={`px-3 py-1.5 rounded-[var(--r-md)] text-[12px] md:text-[13px] font-medium border transition-all
                      ${
                        !b.is_active
                          ? "bg-bg-2 text-c-text-3 border-border opacity-50 cursor-not-allowed"
                          : selectedBarberId === b.id
                            ? "bg-c-text text-white border-c-text cursor-pointer shadow-[var(--shadow-sm)]"
                            : "bg-white text-c-text border-border hover:border-border-2 cursor-pointer"
                      }`}
                  >
                    {b.name}
                    {selectedBarberId === b.id && b.is_active && " ✓"}
                    {!b.is_active && " (nghỉ)"}
                  </button>
                  <button
                    onClick={() => handleToggleBarber(b.id)}
                    title={b.is_active ? "Đánh dấu nghỉ" : "Đánh dấu đi làm"}
                    className={`text-[10px] px-2 py-1 rounded-[var(--r-sm)] border cursor-pointer transition-all bg-transparent
                      ${
                        b.is_active
                          ? "border-green-border text-c-green hover:bg-red-bg hover:text-c-red hover:border-red-border"
                          : "border-red-border text-c-red hover:bg-green-bg hover:text-c-green hover:border-green-border"
                      }`}
                  >
                    {b.is_active ? "Làm" : "Nghỉ"}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => setShowWalkIn(true)} className="btn-outline text-[11px] md:text-[12px] py-1.5 px-3 flex-shrink-0 whitespace-nowrap">
            + Vãng lai
          </button>
        </div>
      </div>

      {/* ── Date selector ── */}
      <div className="bg-white border border-border rounded-[var(--r-xl)] px-4 md:px-6 py-3 md:py-4 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const d = new Date(viewDate);
              d.setDate(d.getDate() - 1);
              setViewDate(d.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }));
            }}
            className="btn-outline py-1.5 px-3 text-[13px] flex-shrink-0"
          >
            ←
          </button>

          <input type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} className="input-field py-1.5 text-[13px] flex-1 min-w-0" />

          <button
            onClick={() => {
              const d = new Date(viewDate);
              d.setDate(d.getDate() + 1);
              setViewDate(d.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }));
            }}
            className="btn-outline py-1.5 px-3 text-[13px] flex-shrink-0"
          >
            →
          </button>

          <span className="hidden md:inline-flex items-center gap-1.5 text-[12px] text-c-text-3 bg-bg-2 border border-border px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0">
            {isToday ? (
              <>
                <span className="live-dot" /> Hôm nay
              </>
            ) : (
              <>📅 {new Date(viewDate + "T00:00:00").toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" })}</>
            )}
          </span>
        </div>
        {!isToday && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-c-text-3">📅 {new Date(viewDate + "T00:00:00").toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}</span>
            <button
              onClick={() => setViewDate(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }))}
              className="text-[11px] text-c-text underline font-medium cursor-pointer bg-transparent border-none"
            >
              Về hôm nay
            </button>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
        {[
          { label: "Đang chờ", value: waiting.length, color: "text-c-text", sub: "người" },
          { label: "Đang phục vụ", value: allServing.length, color: "text-c-green", sub: "khách" },
          { label: "Thợ đang làm", value: barbers.filter((b) => b.is_active).length, color: "text-blue-500", sub: `/ ${barbers.length}` },
          { label: "Chờ ước tính", value: waiting.length === 0 ? "0" : `~${waiting.length * 25}`, color: "text-c-amber", sub: "phút" },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="bg-white border border-border rounded-[var(--r-lg)] px-3 md:px-5 py-3 md:py-4">
            <p className="label mb-1 text-[9px] md:text-[10.5px]">{label}</p>
            <p className={`font-serif text-[28px] md:text-[36px] m-0 leading-none ${color}`}>{value}</p>
            <p className="text-[10px] text-c-text-3 m-0 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-4">
        {/* ── Left: Action panel ── */}
        {isToday ? (
          <div className="flex flex-col gap-3">
            {/* Current serving card */}
            <div className="bg-white border border-border rounded-[var(--r-xl)] p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <p className="label m-0">Đang phục vụ</p>
                {myServing && <span className="live-dot" />}
              </div>

              {myServing ? (
                <>
                  <div className="bg-green-bg border border-green-border rounded-[var(--r-lg)] px-4 py-3 mb-3">
                    <p className="text-[10px] font-semibold text-c-text-3 uppercase tracking-wide m-0 mb-1">{myServing.barber_name || "Thợ"}</p>
                    <p className="font-serif text-[22px] md:text-[28px] text-c-green m-0 leading-tight">{myServing.name}</p>
                    <p className="text-[11px] text-c-text-3 m-0 mt-1">
                      {myServing.phone}
                      {myServing.scheduled_time && ` · Hẹn ${formatScheduledTime(myServing.scheduled_time)}`}
                    </p>
                    {myServing.services?.length > 0 && <p className="text-[11px] text-c-text-2 m-0 mt-1">{myServing.services.map((s) => s.name).join(" · ")}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleDone(myServing.id, myServing.name)}
                      disabled={actionLoading}
                      className="w-full py-3 rounded-[var(--r-md)] font-semibold text-[14px] text-white bg-c-green border-none hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60"
                    >
                      ✓ Xong — Next khách
                    </button>
                    <button
                      onClick={() => handleSkip(myServing.id, myServing.name)}
                      disabled={actionLoading}
                      className="btn-outline w-full justify-center py-2.5 text-c-red border-red-border hover:bg-red-bg text-[13px]"
                    >
                      ⏭ Skip khách này
                    </button>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-[13px] text-c-text-3 mb-4">{selectedBarberId ? "Bạn chưa nhận khách nào" : "Chưa có ai đang phục vụ"}</p>
                  <button
                    onClick={() => waiting.length > 0 && handleStart(waiting[0].id, waiting[0].name)}
                    disabled={actionLoading || !selectedBarberId || waiting.length === 0}
                    className="btn-primary w-full justify-center py-3 transition-opacity"
                    style={{ opacity: !selectedBarberId || waiting.length === 0 ? 0.4 : 1 }}
                  >
                    {waiting.length > 0 ? `▶ Nhận: ${waiting[0].name}` : "▶ Chưa có khách chờ"}
                  </button>
                  {!selectedBarberId && <p className="text-[11px] text-c-text-3 mt-2 text-center">↑ Chọn tên bạn ở trên trước</p>}
                </div>
              )}
            </div>

            {/* Quick stats — desktop only */}
            <div className="hidden md:block bg-white border border-border rounded-[var(--r-xl)] px-6 py-5">
              <p className="label mb-3">Thông tin nhanh</p>
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
        ) : (
          <div className="bg-white border border-border rounded-[var(--r-xl)] p-6 flex items-center justify-center min-h-[120px]">
            <p className="text-[13px] text-c-text-3 text-center">
              📅 Đang xem lịch ngày <strong>{new Date(viewDate + "T00:00:00").toLocaleDateString("vi-VN")}</strong>
              <br />
              <span className="text-[12px]">Chỉ có thể thao tác hàng chờ của hôm nay</span>
            </p>
          </div>
        )}

        {/* ── Right: Queue list ── */}
        <div className="bg-white border border-border rounded-[var(--r-xl)] overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-border flex justify-between items-center">
            <p className="label m-0">Hàng chờ</p>
            <span className="text-[11px] text-c-text-3 bg-bg-2 border border-border px-2.5 py-0.5 rounded-full">{waiting.length} người</span>
          </div>

          <div className="max-h-[60vh] md:max-h-[520px] overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center">
                <div className="text-2xl mb-2">⏳</div>
                <p className="text-[13px] text-c-text-3">Đang tải...</p>
              </div>
            ) : waiting.length === 0 ? (
              <div className="py-14 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-[13px] text-c-text-3">Hàng chờ trống</p>
              </div>
            ) : (
              waiting.map((entry, i) => (
                <div key={entry.id} className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 border-b border-border hover:bg-bg-2 transition-colors">
                  <span className="text-[12px] font-semibold text-c-text-3 w-6 flex-shrink-0 tabular-nums">{String(entry.display_position ?? i + 1).padStart(2, "0")}</span>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-[13px] md:text-[14px] font-semibold text-c-text truncate">{entry.name}</p>
                    <p className="m-0 text-[10px] text-c-text-3 truncate mt-0.5">
                      {entry.phone}
                      {entry.scheduled_time && ` · ${formatScheduledTime(entry.scheduled_time)}`}
                    </p>
                    {entry.services?.length > 0 && <p className="m-0 text-[10px] text-c-text-3 truncate">{entry.services.map((s) => s.name).join(" · ")}</p>}
                    {entry.note && <p className="m-0 text-[10px] text-c-amber truncate">📝 {entry.note}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleStart(entry.id, entry.name)}
                      disabled={actionLoading || !selectedBarberId || !!myServing}
                      title={!selectedBarberId ? "Chọn thợ trước" : myServing ? "Bạn đang bận" : "Nhận khách"}
                      className="text-[11px] font-semibold text-c-green border border-green-border px-2.5 py-1.5 rounded-[var(--r-sm)] hover:bg-green-bg transition-all bg-transparent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Nhận
                    </button>
                    <button
                      onClick={() => handleSkip(entry.id, entry.name)}
                      disabled={actionLoading}
                      className="text-[11px] font-semibold text-c-red border border-red-border px-2.5 py-1.5 rounded-[var(--r-sm)] hover:bg-red-bg transition-all bg-transparent cursor-pointer disabled:opacity-40"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* All serving section */}
          {allServing.length > 0 && (
            <div className="border-t border-border px-4 md:px-6 py-3 md:py-4 bg-green-bg/30">
              <p className="label mb-2 text-[9px]">Đang phục vụ ({allServing.length})</p>
              {allServing.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="live-dot flex-shrink-0" />
                    <span className="text-[12px] md:text-[13px] font-semibold text-c-green truncate">{s.name}</span>
                    {s.barber_name && <span className="text-[10px] text-c-text-3 flex-shrink-0">· {s.barber_name}</span>}
                  </div>
                  <span className="text-[10px] text-c-text-3 flex-shrink-0">{formatTime(s.start_time)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Walk-in ── */}
      {showWalkIn && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div
            className="bg-white rounded-t-[var(--r-2xl)] md:rounded-[var(--r-xl)] border border-border w-full md:max-w-sm p-5 md:p-6 shadow-[var(--shadow-lg)]"
            style={{ animation: "slideUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards" }}
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4 md:hidden" />
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="label m-0 mb-0.5">Khách vãng lai</p>
                <p className="text-[12px] text-c-text-3 m-0">Thêm khách trực tiếp tại tiệm</p>
              </div>
              <button
                onClick={() => setShowWalkIn(false)}
                className="w-8 h-8 rounded-full bg-bg-2 border-none flex items-center justify-center text-c-text-3 hover:text-c-text cursor-pointer text-[14px]"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="text-[11px] font-semibold text-c-text-3 uppercase tracking-wide block mb-1.5">
                Tên khách <span className="text-c-text-3 normal-case font-normal">(tuỳ chọn)</span>
              </label>
              <input type="text" placeholder="Khách vãng lai" value={walkInName} onChange={(e) => setWalkInName(e.target.value)} className="input-field" />
            </div>

            <div className="mb-5">
              <label className="text-[11px] font-semibold text-c-text-3 uppercase tracking-wide block mb-2">
                Dịch vụ <span className="normal-case font-normal">(tuỳ chọn)</span>
              </label>
              <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
                {services.map((svc) => {
                  const sel = walkInServiceIds.includes(svc.id);
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => setWalkInServiceIds((prev) => (sel ? prev.filter((x) => x !== svc.id) : [...prev, svc.id]))}
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

            <button onClick={handleWalkIn} disabled={actionLoading} className="btn-primary w-full justify-center py-3 text-[14px]">
              {actionLoading ? "Đang xử lý..." : "✂ Bắt đầu phục vụ ngay"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
