import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getBookingHistory, getBookingReminder, getBookedDates, cancelBooking } from "../hooks/useBookingReminder";

function todayVN() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
}

function formatDateVN(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00+07:00");
  const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return `${weekdays[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function isFuture(date, time) {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  const dt = new Date(`${date}T${time}:00+07:00`);
  return dt > now;
}

function isToday(date) {
  return date === todayVN();
}

// ── Badge trạng thái ─────────────────────────────────────────
function StatusPill({ booking, activeMap }) {
  const key = `${booking.date}_${booking.phone}`;
  const isActive = activeMap.has(key);
  const upcoming = isFuture(booking.date, booking.time);
  const today = isToday(booking.date);

  if (booking.cancelled) {
    return <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 99, padding: "2px 8px" }}>Đã hủy</span>;
  }
  if (isActive && today) {
    return (
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#16a34a",
          background: "#dcfce7",
          border: "1px solid #bbf7d0",
          borderRadius: 99,
          padding: "2px 8px",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
        Hôm nay
      </span>
    );
  }
  if (isActive && upcoming) {
    return <span style={{ fontSize: 10, fontWeight: 700, color: "#d97706", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 99, padding: "2px 8px" }}>Sắp tới</span>;
  }
  return <span style={{ fontSize: 10, fontWeight: 700, color: "#999", background: "#f5f5f5", border: "1px solid #e5e5e5", borderRadius: 99, padding: "2px 8px" }}>Đã qua</span>;
}

// ── Card 1 lịch ──────────────────────────────────────────────
function BookingCard({ booking, activeMap, onCancel, cancelling }) {
  const navigate = useNavigate();
  const key = `${booking.date}_${booking.phone}`;
  const isActive = activeMap.has(key);
  const canCancel = isActive && isFuture(booking.date, booking.time) && !booking.cancelled;
  const canRebook = !booking.cancelled;

  const handleRebook = () => {
    // Chuyển sang /booking với query params để prefill
    const params = new URLSearchParams({
      prefill_name: booking.name,
      prefill_phone: booking.phone,
      prefill_date: booking.date,
    });
    navigate(`/booking?${params.toString()}`);
  };

  return (
    <div
      style={{
        background: "#fff",
        border: booking.cancelled ? "1.5px solid #fecaca" : isActive ? "1.5px solid #fcd34d" : "1.5px solid #e5e5e5",
        borderRadius: 16,
        padding: "14px 16px",
        position: "relative",
        opacity: booking.cancelled ? 0.75 : 1,
        transition: "all 0.2s",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111" }}>{booking.name}</p>
            <StatusPill booking={booking} activeMap={activeMap} />
          </div>
          <p style={{ margin: 0, fontSize: 11, color: "#999", marginTop: 2 }}>{booking.phone}</p>
        </div>
        {/* Giờ */}
        <div
          style={{
            background: booking.cancelled ? "#f5f5f5" : "#111",
            color: booking.cancelled ? "#999" : "#fff",
            borderRadius: 9,
            padding: "5px 11px",
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
            marginLeft: 8,
          }}
        >
          {booking.time}
        </div>
      </div>

      {/* Info rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12 }}>📅</span>
          <span style={{ fontSize: 12, color: "#555" }}>{formatDateVN(booking.date)}</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
          <span style={{ fontSize: 12 }}>✂️</span>
          <span style={{ fontSize: 12, color: "#555", lineHeight: 1.4 }}>{booking.services}</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12 }}>💰</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#d97706" }}>{booking.totalPrice?.toLocaleString("vi-VN")}đ</span>
        </div>
      </div>

      {/* Actions */}
      {!booking.cancelled && (
        <div style={{ display: "flex", gap: 8 }}>
          {isActive && (
            <Link
              to={`/queue?date=${booking.date}`}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "8px 0",
                borderRadius: 9,
                background: "#111",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Xem hàng chờ
            </Link>
          )}
          <button
            onClick={handleRebook}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 9,
              border: "1.5px solid #e5e5e5",
              background: "#fff",
              color: "#111",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🔄 Đặt lại
          </button>
          {canCancel && (
            <button
              onClick={() => onCancel(booking)}
              disabled={cancelling === booking.phone}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 9,
                border: "1.5px solid #fca5a5",
                background: "#fff",
                color: "#dc2626",
                fontSize: 12,
                fontWeight: 600,
                cursor: cancelling === booking.phone ? "not-allowed" : "pointer",
                opacity: cancelling === booking.phone ? 0.6 : 1,
              }}
            >
              {cancelling === booking.phone ? "Đang hủy..." : "Hủy lịch"}
            </button>
          )}
        </div>
      )}

      {booking.cancelled && (
        <button
          onClick={handleRebook}
          style={{
            width: "100%",
            padding: "8px 0",
            borderRadius: 9,
            border: "1.5px solid #e5e5e5",
            background: "#fff",
            color: "#555",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          🔄 Đặt lịch lại cho {booking.name}
        </button>
      )}
    </div>
  );
}

// ── Confirm dialog đơn giản ──────────────────────────────────
function ConfirmDialog({ booking, onConfirm, onClose, loading }) {
  if (!booking) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1001, backdropFilter: "blur(2px)" }} />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 1002,
          background: "#fff",
          borderRadius: 20,
          padding: "24px 20px",
          width: "min(90vw, 360px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          animation: "popIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🗑️</div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111" }}>Xác nhận hủy lịch?</p>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#666" }}>
            Lịch của <strong>{booking.name}</strong> lúc <strong>{booking.time}</strong> — {formatDateVN(booking.date)}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>Hành động này không thể hoàn tác.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "11px 0", borderRadius: 11, border: "1.5px solid #e5e5e5", background: "#fff", color: "#333", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Giữ lại
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 11,
              border: "none",
              background: "#dc2626",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Đang hủy..." : "Hủy lịch"}
          </button>
        </div>
      </div>
      <style>{`@keyframes popIn { from { opacity:0; transform:translate(-50%,-50%) scale(0.9) } to { opacity:1; transform:translate(-50%,-50%) scale(1) } }`}</style>
    </>
  );
}

// ── Page chính ───────────────────────────────────────────────
export default function MyBookings() {
  const [history, setHistory] = useState([]);
  const [activeMap, setActiveMap] = useState(new Set());
  const [tab, setTab] = useState("upcoming"); // "upcoming" | "past"
  const [cancelling, setCancelling] = useState(null);
  const [confirmBooking, setConfirmBooking] = useState(null);
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState("");

  const refresh = useCallback(() => {
    const h = getBookingHistory();
    setHistory(h);

    // Build active map từ reminder map (tất cả ngày)
    const bookedDates = getBookedDates();
    const aMap = new Set();
    for (const date of bookedDates) {
      const reminders = getBookingReminder(date);
      for (const r of reminders) {
        aMap.add(`${r.date}_${r.phone}`);
      }
    }
    setActiveMap(aMap);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const today = todayVN();

  const upcoming = history.filter((b) => !b.cancelled && (b.date > today || (b.date === today && isFuture(b.date, b.time))));
  const past = history.filter((b) => b.cancelled || b.date < today || (b.date === today && !isFuture(b.date, b.time)));

  const displayed = tab === "upcoming" ? upcoming : past;

  const handleCancelClick = (booking) => {
    setCancelError("");
    setCancelSuccess("");
    setConfirmBooking(booking);
  };

  const handleConfirmCancel = async () => {
    if (!confirmBooking) return;
    setCancelling(confirmBooking.phone);
    const { ok, error } = await cancelBooking(confirmBooking.date, confirmBooking.phone);
    setCancelling(null);
    setConfirmBooking(null);
    if (ok) {
      setCancelSuccess(`Đã hủy lịch của ${confirmBooking.name} thành công`);
    } else {
      setCancelError(error);
    }
    refresh();
    setTimeout(() => {
      setCancelSuccess("");
      setCancelError("");
    }, 4000);
  };

  return (
    <div style={{ background: "var(--color-bg-2, #fafaf9)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#999", marginBottom: 4 }}>Lịch hẹn của tôi</p>
          <h1 style={{ margin: 0, fontFamily: "var(--font-serif, Georgia, serif)", fontSize: 28, color: "#111", fontWeight: 700 }}>Quản lý lịch hẹn</h1>
        </div>

        {/* Alert */}
        {cancelSuccess && (
          <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#16a34a", fontWeight: 600 }}>
            ✅ {cancelSuccess}
          </div>
        )}
        {cancelError && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#dc2626" }}>⚠️ {cancelError}</div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            background: "#fff",
            border: "1.5px solid #e5e5e5",
            borderRadius: 12,
            padding: 4,
            marginBottom: 16,
            gap: 4,
          }}
        >
          {[
            { key: "upcoming", label: `Sắp tới (${upcoming.length})` },
            { key: "past", label: `Đã qua (${past.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 9,
                border: "none",
                background: tab === t.key ? "#111" : "transparent",
                color: tab === t.key ? "#fff" : "#666",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        {history.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e5e5e5",
              borderRadius: 20,
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4 }}>Chưa có lịch hẹn nào</p>
            <p style={{ margin: 0, fontSize: 13, color: "#999", marginBottom: 20 }}>Đặt lịch ngay để không phải chờ đợi!</p>
            <Link
              to="/booking"
              style={{
                display: "inline-block",
                background: "#111",
                color: "#fff",
                borderRadius: 11,
                padding: "11px 28px",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Đặt lịch ngay →
            </Link>
          </div>
        ) : displayed.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e5e5e5",
              borderRadius: 16,
              padding: "32px 20px",
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, fontSize: 14, color: "#999" }}>{tab === "upcoming" ? "Không có lịch hẹn sắp tới" : "Chưa có lịch hẹn nào đã qua"}</p>
            {tab === "upcoming" && (
              <Link
                to="/booking"
                style={{ display: "inline-block", marginTop: 14, background: "#111", color: "#fff", borderRadius: 10, padding: "9px 22px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
              >
                Đặt lịch mới →
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {displayed.map((b) => (
              <BookingCard key={`${b.date}_${b.phone}_${b.savedAt}`} booking={b} activeMap={activeMap} onCancel={handleCancelClick} cancelling={cancelling} />
            ))}
          </div>
        )}

        {/* CTA */}
        {history.length > 0 && (
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <Link
              to="/booking"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#111",
                color: "#fff",
                borderRadius: 12,
                padding: "12px 28px",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              ✂️ Đặt lịch mới →
            </Link>
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog booking={confirmBooking} onConfirm={handleConfirmCancel} onClose={() => setConfirmBooking(null)} loading={!!cancelling} />
    </div>
  );
}
