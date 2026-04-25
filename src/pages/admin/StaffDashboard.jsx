import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueue } from "../../hooks/useQueue";
import { useServices } from "../../hooks/useQueue";
import { formatScheduledTime, formatTime } from "../../utils/timeHelper";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const barberId = Number(localStorage.getItem("barber_id"));
  const todayVN = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  const [viewDate, setViewDate] = useState(todayVN);
  const isToday = viewDate === todayVN;

  const { queue, loading, refetch } = useQueue(viewDate);
  const { services } = useServices();

  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [walkInServiceIds, setWalkInServiceIds] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [mySalary, setMySalary] = useState(null);

  const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    if (!barberId) {
      navigate("/admin/login");
      return;
    }
  }, [token, barberId, navigate]);

  // Fetch lương hôm nay của thợ này
  useEffect(() => {
    if (!token || !barberId) return;
    (async () => {
      try {
        const res = await fetch(`${API}/api/dashboard/salary?from=${todayVN}&to=${todayVN}`, {
          headers: auth,
        });
        if (res.ok) {
          const data = await res.json();
          const me = data.salaries.find((s) => s.barber_id === barberId);
          setMySalary(me || null);
        }
      } catch {}
    })();
  }, [queue, barberId]); // refetch khi queue thay đổi

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

  // Queue của thợ này
  const myServing = queue.find((q) => q.status === "serving" && q.barber_id === barberId);
  const myWaiting = queue.filter((q) => q.status === "waiting" && (q.barber_id === barberId || !q.barber_id));
  const allWaiting = queue.filter((q) => q.status === "waiting");

  const handleStart = async (queueId, name) => {
    if (myServing) return showToast("Bạn đang phục vụ khách, hoàn thành trước", "err");
    const data = await call(`/api/queue/${queueId}/start`, "PATCH", { barber_id: barberId });
    if (data) {
      showToast(`✂ Bắt đầu: ${name}`);
      refetch();
    }
  };

  const handleDone = async (queueId, name) => {
    const data = await call(`/api/queue/${queueId}/done`, "PATCH", { barber_id: barberId });
    if (data) {
      showToast(data.next ? `✓ Xong → Tiếp: ${data.next.name}` : `✓ Xong: ${name}`);
      refetch();
    }
  };

  const handleSkip = async (queueId, name) => {
    const data = await call(`/api/queue/${queueId}/skip`);
    if (data) {
      showToast(`⏭ Bỏ qua: ${name}`);
      refetch();
    }
  };

  const handleWalkIn = async () => {
    if (myServing) return showToast("Đang bận, hoàn thành khách hiện tại trước", "err");
    const data = await call("/api/queue/walk-in", "POST", {
      barber_id: barberId,
      name: walkInName || undefined,
      service_ids: walkInServiceIds,
    });
    if (data) {
      showToast(`✂ Nhận khách: ${data.name}`);
      setShowWalkIn(false);
      setWalkInName("");
      setWalkInServiceIds([]);
      refetch();
    }
  };

  const walkInTotalDuration = services.filter((s) => walkInServiceIds.includes(s.id)).reduce((sum, s) => sum + s.duration, 0);
  const walkInTotalPrice = services.filter((s) => walkInServiceIds.includes(s.id)).reduce((sum, s) => sum + s.price, 0);

  return (
    <div>
      {toast && (
        <div
          className={`fixed top-4 right-4 left-4 md:left-auto md:right-5 z-50 px-5 py-3 rounded-[var(--r-md)] text-[13px] font-medium shadow-[var(--shadow-md)] animate-fade-in text-center md:text-left
          ${toast.type === "err" ? "bg-red-bg border border-red-border text-c-red" : "bg-green-bg border border-green-border text-c-green"}`}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Date selector ── */}
      <div className="bg-white border border-border rounded-[var(--r-xl)] px-4 py-3 mb-4 flex items-center gap-2">
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

        <span
          className={`hidden md:inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border flex-shrink-0
    ${isToday ? "text-c-green border-green-border bg-green-bg" : "text-c-text-3 border-border bg-bg-2"}`}
        >
          {isToday ? (
            <>
              <span className="live-dot" /> Hôm nay
            </>
          ) : (
            <>📅 {new Date(viewDate + "T00:00:00").toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" })}</>
          )}
        </span>

        {!isToday && (
          <button onClick={() => setViewDate(todayVN)} className="text-[11px] text-c-text underline font-medium cursor-pointer bg-transparent border-none flex-shrink-0">
            Về hôm nay
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* ── LEFT: Main work area ── */}
        <div className="flex flex-col gap-4">
          {/* Đang phục vụ */}
          <div className={`rounded-[var(--r-xl)] border p-4 md:p-6 ${myServing ? "bg-green-bg border-green-border" : "bg-white border-border"}`}>
            <p className="label mb-3 text-[10px]">{isToday ? "Đang phục vụ" : `Hàng chờ ngày ${new Date(viewDate + "T00:00:00").toLocaleDateString("vi-VN")}`}</p>

            {!isToday ? (
              // Chế độ xem — không cho thao tác
              <div>
                {queue.filter((q) => q.status === "waiting").length === 0 ? (
                  <p className="text-[13px] text-c-text-3 m-0">Không có khách đặt lịch ngày này</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {queue
                      .filter((q) => q.status === "waiting")
                      .map((entry, i) => (
                        <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                          <span className="text-[12px] font-semibold text-c-text-3 w-5 tabular-nums">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="m-0 text-[13px] font-semibold text-c-text truncate">{entry.name}</p>
                            <p className="m-0 text-[10px] text-c-text-3 truncate">
                              {entry.scheduled_time && `Hẹn ${formatScheduledTime(entry.scheduled_time)}`}
                              {entry.services?.length > 0 && ` · ${entry.services.map((s) => s.name).join(", ")}`}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                <p className="text-[11px] text-c-text-3 mt-3 m-0">👁 Chỉ xem — thao tác chỉ khả dụng hôm nay</p>
              </div>
            ) : myServing ? (
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="live-dot" />
                      <p className="m-0 text-[18px] md:text-[22px] font-serif font-semibold text-c-green">{myServing.name}</p>
                    </div>
                    <p className="m-0 text-[12px] text-c-text-3">{myServing.phone}</p>
                    {myServing.services?.length > 0 && <p className="m-0 text-[12px] text-c-text-2 mt-1">{myServing.services.map((s) => s.name).join(" · ")}</p>}
                    {myServing.total_duration && (
                      <p className="m-0 text-[11px] text-c-text-3 mt-0.5">
                        ⏱ {myServing.total_duration} phút · Bắt đầu: {formatTime(myServing.start_time)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleDone(myServing.id, myServing.name)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-c-text text-white text-[13px] font-semibold rounded-[var(--r-md)] border-none cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      ✓ Xong
                    </button>
                    <button
                      onClick={() => handleSkip(myServing.id, myServing.name)}
                      disabled={actionLoading}
                      className="px-4 py-2 text-[12px] text-c-red border border-red-border rounded-[var(--r-md)] bg-transparent cursor-pointer hover:bg-red-bg transition-all disabled:opacity-50"
                    >
                      Skip
                    </button>
                  </div>
                </div>
                {myServing.note && <div className="bg-amber-bg border border-amber-border rounded-[var(--r-md)] px-3 py-2 text-[12px] text-c-text-2">📝 {myServing.note}</div>}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-c-text-3 m-0">Chưa có khách — nhận từ hàng chờ hoặc khách vãng lai</p>
                <button
                  onClick={() => setShowWalkIn(true)}
                  className="flex-shrink-0 px-4 py-2 bg-c-text text-white text-[12px] font-semibold rounded-[var(--r-md)] border-none cursor-pointer hover:opacity-90"
                >
                  + Vãng lai
                </button>
              </div>
            )}
          </div>

          {/* Hàng chờ chung */}
          <div className="bg-white border border-border rounded-[var(--r-xl)] overflow-hidden">
            {/* <div className="px-4 md:px-6 py-4 border-b border-border flex justify-between items-center">
              <p className="label m-0">Hàng chờ hôm nay</p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-c-text-3 bg-bg-2 border border-border px-2.5 py-0.5 rounded-full">{allWaiting.length} người</span>
                {!myServing && (
                  <button
                    onClick={() => setShowWalkIn(true)}
                    disabled={!isToday}
                    className="text-[11px] font-semibold text-c-text border border-border px-3 py-1.5 rounded-[var(--r-sm)] bg-transparent cursor-pointer hover:bg-bg-2 transition-all"
                  >
                    + Vãng lai
                  </button>
                )}
              </div>
            </div> */}

            <div className="max-h-[50vh] overflow-y-auto divide-y divide-border">
              {loading ? (
                <div className="py-12 text-center text-c-text-3 text-[13px]">Đang tải...</div>
              ) : allWaiting.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="text-[13px] text-c-text-3">Hàng chờ trống</p>
                </div>
              ) : (
                allWaiting.map((entry, i) => {
                  const isMyCustomer = entry.barber_id === barberId;
                  return (
                    <div key={entry.id} className={`flex items-center gap-3 px-4 md:px-6 py-3 hover:bg-bg-2 transition-colors ${isMyCustomer ? "bg-blue-50/40" : ""}`}>
                      <span className="text-[12px] font-semibold text-c-text-3 w-6 tabular-nums flex-shrink-0">{String(entry.display_position ?? i + 1).padStart(2, "0")}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="m-0 text-[13px] font-semibold text-c-text truncate">{entry.name}</p>
                          {isMyCustomer && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">Của tôi</span>}
                        </div>
                        <p className="m-0 text-[10px] text-c-text-3 truncate">
                          {entry.phone}
                          {entry.scheduled_time && ` · Hẹn ${formatScheduledTime(entry.scheduled_time)}`}
                          {entry.total_duration && ` · ${entry.total_duration}p`}
                        </p>
                        {entry.services?.length > 0 && <p className="m-0 text-[10px] text-c-text-3 truncate">{entry.services.map((s) => s.name).join(" · ")}</p>}
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleStart(entry.id, entry.name)}
                          disabled={!isToday || actionLoading || !!myServing}
                          title={myServing ? "Đang bận" : "Nhận khách"}
                          className="text-[11px] font-semibold text-c-green border border-green-border px-2.5 py-1.5 rounded-[var(--r-sm)] hover:bg-green-bg bg-transparent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          Nhận
                        </button>
                        <button
                          onClick={() => handleSkip(entry.id, entry.name)}
                          disabled={!isToday || actionLoading}
                          className="text-[11px] text-c-red border border-red-border px-2.5 py-1.5 rounded-[var(--r-sm)] hover:bg-red-bg bg-transparent cursor-pointer disabled:opacity-40 transition-all"
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Stats hôm nay ── */}
        <div className="flex flex-col gap-3">
          {/* Thu nhập hôm nay */}
          <div className="bg-white border border-border rounded-[var(--r-xl)] p-4 md:p-5">
            <p className="label mb-3 text-[10px]">Thu nhập hôm nay</p>
            {mySalary ? (
              <>
                <div className="mb-3">
                  <p className="m-0 text-[11px] text-c-text-3 mb-0.5">Hoa hồng nhận được</p>
                  <p className="font-serif text-[32px] text-c-amber m-0 leading-none">{mySalary.total_commission.toLocaleString("vi-VN")}đ</p>
                </div>
                <div className="flex justify-between text-[12px] py-2 border-t border-border">
                  <span className="text-c-text-3">Doanh thu tạo ra</span>
                  <span className="font-semibold text-c-text">{mySalary.gross_revenue.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-[12px] py-2 border-t border-border">
                  <span className="text-c-text-3">Số khách</span>
                  <span className="font-semibold text-c-text">{mySalary.total_customers} người</span>
                </div>
              </>
            ) : (
              <p className="text-[13px] text-c-text-3 m-0">Chưa có dữ liệu hôm nay</p>
            )}
          </div>

          {/* Giao dịch chi tiết */}
          {mySalary?.transactions?.length > 0 && (
            <div className="bg-white border border-border rounded-[var(--r-xl)] overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="label m-0 text-[10px]">Chi tiết ({mySalary.transactions.length} lượt)</p>
              </div>
              <div className="divide-y divide-border max-h-64 overflow-y-auto">
                {mySalary.transactions.map((t, i) => (
                  <div key={i} className="px-4 py-2.5">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <p className="m-0 text-[12px] font-semibold text-c-text truncate">{t.customer}</p>
                        <p className="m-0 text-[10px] text-c-text-3">{t.service}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="m-0 text-[12px] font-semibold text-c-amber">+{parseInt(t.commission_amount).toLocaleString("vi-VN")}đ</p>
                        <p className="m-0 text-[10px] text-c-text-3">{t.commission_percent}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Đổi mật khẩu nhanh */}
          <div className="bg-white border border-border rounded-[var(--r-xl)] p-4">
            <p className="label mb-2 text-[10px]">Tài khoản</p>
            <button
              onClick={() => navigate("/admin/account")}
              className="w-full text-[12px] text-c-text-2 border border-border rounded-[var(--r-md)] py-2 bg-transparent cursor-pointer hover:bg-bg-2 transition-all"
            >
              🔑 Đổi mật khẩu
            </button>
          </div>
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
                <p className="text-[12px] text-c-text-3 m-0">Nhận khách trực tiếp tại tiệm</p>
              </div>
              <button onClick={() => setShowWalkIn(false)} className="w-8 h-8 rounded-full bg-bg-2 border-none flex items-center justify-center text-c-text-3 cursor-pointer text-[14px]">
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="text-[11px] font-semibold text-c-text-3 uppercase tracking-wide block mb-1.5">
                Tên khách <span className="normal-case font-normal text-c-text-3">(tuỳ chọn)</span>
              </label>
              <input type="text" placeholder="Khách vãng lai" value={walkInName} onChange={(e) => setWalkInName(e.target.value)} className="input-field" />
            </div>

            <div className="mb-4">
              <label className="text-[11px] font-semibold text-c-text-3 uppercase tracking-wide block mb-2">
                Dịch vụ <span className="normal-case font-normal">(tuỳ chọn)</span>
              </label>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
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
                        {svc.duration}p · {svc.price.toLocaleString("vi-VN")}đ
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {walkInServiceIds.length > 0 && (
              <div className="bg-bg-2 border border-border rounded-[var(--r-md)] px-3 py-2 mb-4 text-[12px] text-c-text-2">
                Tổng: <strong>{walkInTotalDuration} phút</strong> · <strong>{walkInTotalPrice.toLocaleString("vi-VN")}đ</strong>
              </div>
            )}

            <button onClick={handleWalkIn} disabled={actionLoading} className="btn-primary w-full justify-center py-3 text-[14px]">
              {actionLoading ? "Đang xử lý..." : "✂ Bắt đầu phục vụ ngay"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
