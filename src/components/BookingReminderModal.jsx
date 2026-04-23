import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getBookingReminder, cancelBooking } from "../hooks/useBookingReminder";

const TODAY_KEY = "booking_reminder_dismissed_date";

function todayVN() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
}

export default function BookingReminderModal() {
  const [bookings, setBookings] = useState([]);
  const [visible, setVisible] = useState(false);
  const [cancelling, setCancelling] = useState(null); // phone đang hủy
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    const today = todayVN();
    const dismissed = localStorage.getItem(TODAY_KEY);
    if (dismissed === today) return;

    const list = getBookingReminder(today);
    if (list.length > 0) {
      setBookings(list);
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(TODAY_KEY, todayVN());
    setVisible(false);
  };

  const handleCancel = async (booking) => {
    setCancelling(booking.phone);
    setCancelError("");
    const { ok, error } = await cancelBooking(booking.date, booking.phone);
    setCancelling(null);
    if (!ok) {
      setCancelError(error);
    }
    // Dù có lỗi API cũng cập nhật local list
    const today = todayVN();
    const updated = getBookingReminder(today);
    setBookings(updated);
    if (updated.length === 0) setVisible(false);
  };

  if (!visible || bookings.length === 0) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 999,
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: "0 0 env(safe-area-inset-bottom,0)",
          animation: "slideUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "20px 20px 0 0",
            boxShadow: "0 -4px 40px rgba(0,0,0,0.18)",
            maxHeight: "85vh",
            overflowY: "auto",
          }}
        >
          {/* Handle */}
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e5e5e5" }} />
          </div>

          {/* Header */}
          <div style={{ padding: "8px 20px 14px", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🗓</span>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111" }}>{bookings.length > 1 ? `${bookings.length} lịch hẹn hôm nay` : "Lịch hẹn hôm nay của bạn"}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#999", marginTop: 1 }}>{new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric" })}</p>
                </div>
              </div>
              <button
                onClick={dismiss}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  border: "none",
                  background: "#f5f5f5",
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#666",
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Danh sách từng lịch */}
          <div style={{ padding: "10px 16px" }}>
            {cancelError && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 10,
                  padding: "8px 12px",
                  marginBottom: 10,
                  fontSize: 12,
                  color: "#dc2626",
                }}
              >
                ⚠️ {cancelError}
              </div>
            )}

            {bookings.map((b, i) => (
              <div
                key={`${b.date}_${b.phone}`}
                style={{
                  background: "#fffbeb",
                  border: "1.5px solid #fcd34d",
                  borderRadius: 14,
                  padding: "12px 14px",
                  marginBottom: i < bookings.length - 1 ? 10 : 0,
                }}
              >
                {/* Tên + giờ */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111" }}>{b.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#78716c", marginTop: 2 }}>{b.phone}</p>
                  </div>
                  <div
                    style={{
                      background: "#f59e0b",
                      color: "#fff",
                      borderRadius: 8,
                      padding: "4px 10px",
                      fontSize: 13,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {b.time}
                  </div>
                </div>

                {/* Info rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 6, fontSize: 12, color: "#57534e" }}>
                    <span>✂️</span>
                    <span>{b.services}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, fontSize: 12, color: "#57534e" }}>
                    <span>💰</span>
                    <span style={{ fontWeight: 600, color: "#d97706" }}>{b.totalPrice?.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  <Link
                    to={`/queue?date=${b.date}`}
                    onClick={dismiss}
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
                  <button
                    onClick={() => handleCancel(b)}
                    disabled={cancelling === b.phone}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      borderRadius: 9,
                      border: "1.5px solid #fca5a5",
                      background: cancelling === b.phone ? "#fef2f2" : "#fff",
                      color: "#dc2626",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: cancelling === b.phone ? "not-allowed" : "pointer",
                      opacity: cancelling === b.phone ? 0.7 : 1,
                    }}
                  >
                    {cancelling === b.phone ? "Đang hủy..." : "Hủy lịch"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer actions */}
          <div style={{ padding: "10px 16px 20px", borderTop: "1px solid #f5f5f5", display: "flex", gap: 8 }}>
            <Link
              to="/my-bookings"
              onClick={dismiss}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "10px 0",
                borderRadius: 11,
                border: "1.5px solid #e5e5e5",
                background: "#fff",
                color: "#111",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              📋 Tất cả lịch hẹn
            </Link>
            <button
              onClick={dismiss}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 11,
                border: "none",
                background: "#f5f5f5",
                color: "#666",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Bỏ qua
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
