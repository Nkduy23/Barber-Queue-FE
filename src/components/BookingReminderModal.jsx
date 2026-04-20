// components/BookingReminderModal.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBookingReminder, clearBookingReminder } from "../hooks/useBookingReminder";

function getCountdown(dateStr, timeStr) {
  const appointment = new Date(`${dateStr}T${timeStr}:00+07:00`);
  const now = new Date();
  const diffMs = appointment - now;
  if (diffMs <= 0) return null;

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days} ngày ${hours} giờ nữa`;
  if (hours > 0) return `${hours} giờ ${minutes} phút nữa`;
  return `${minutes} phút nữa`;
}

function formatDate(dateStr) {
  // dateStr: "2025-07-20" → "Chủ nhật, 20/07/2025"
  const d = new Date(`${dateStr}T12:00:00+07:00`);
  const weekdays = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
  return `${weekdays[d.getDay()]}, ${d.toLocaleDateString("vi-VN")}`;
}

export default function BookingReminderModal() {
  const [reminder, setReminder] = useState(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // Delay nhỏ để không pop up ngay khi trang vừa load — tránh cảm giác bị "chặn"
    const timer = setTimeout(() => {
      const data = getBookingReminder();
      if (data) {
        setReminder(data);
        setVisible(true);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 280);
  };

  const handleCancel = () => {
    clearBookingReminder();
    handleClose();
  };

  if (!visible || !reminder) return null;

  const countdown = getCountdown(reminder.date, reminder.time);
  if (!countdown) return null; // đã qua giờ hẹn

  return (
    <>
      {/* Backdrop mờ nhẹ, click ra ngoài để đóng */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.25)",
          zIndex: 200,
          animation: closing ? "fadeOut 0.28s ease forwards" : "fadeIn 0.25s ease forwards",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 201,
          padding: "0 0 env(safe-area-inset-bottom, 0px)",
          animation: closing ? "slideDown 0.28s cubic-bezier(0.4,0,1,1) forwards" : "slideUp 0.38s cubic-bezier(0.16,1,0.3,1) forwards",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "20px 20px 0 0",
            padding: "24px 20px 20px",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.12)",
            maxWidth: "480px",
            margin: "0 auto",
          }}
        >
          {/* Handle bar */}
          <div
            style={{
              width: 36,
              height: 4,
              background: "#e5e5e5",
              borderRadius: 99,
              margin: "0 auto 20px",
            }}
          />

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#fffbeb",
                border: "1px solid #fde68a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              ✂️
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-sans)",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  lineHeight: 1.3,
                }}
              >
                Bạn có lịch hẹn sắp tới!
              </p>
              <p
                style={{
                  margin: "3px 0 0",
                  fontFamily: "var(--font-sans)",
                  fontSize: 12,
                  color: "#999",
                }}
              >
                Nhắc nhở từ lần đặt trước
              </p>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: "#f5f5f5",
                border: "none",
                borderRadius: "50%",
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#888",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          {/* Countdown badge */}
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}>⏰</span>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                fontWeight: 600,
                color: "#d97706",
              }}
            >
              {countdown}
            </span>
          </div>

          {/* Info rows */}
          <div
            style={{
              background: "#fcfcfc",
              border: "1px solid #e5e5e5",
              borderRadius: 10,
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            {[
              { icon: "👤", label: "Tên", value: reminder.name },
              { icon: "📅", label: "Ngày", value: formatDate(reminder.date) },
              { icon: "🕐", label: "Giờ", value: reminder.time },
              { icon: "✂️", label: "Dịch vụ", value: reminder.services || "—" },
              ...(reminder.totalPrice ? [{ icon: "💰", label: "Tổng tiền", value: `${Number(reminder.totalPrice).toLocaleString("vi-VN")}k`, accent: true }] : []),
            ].map(({ icon, label, value, accent }, i, arr) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 14px",
                  borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
              >
                <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 12,
                    color: "#999",
                    width: 60,
                    flexShrink: 0,
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 13,
                    fontWeight: 500,
                    color: accent ? "#d97706" : "#111",
                    flex: 1,
                    textAlign: "right",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              to="/queue"
              onClick={handleClose}
              style={{
                flex: 1,
                background: "#111",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "11px 0",
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              Xem hàng chờ →
            </Link>
            <button
              onClick={handleCancel}
              style={{
                background: "#f5f5f5",
                color: "#888",
                border: "none",
                borderRadius: 10,
                padding: "11px 14px",
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Huỷ lịch
            </button>
          </div>

          <p
            style={{
              textAlign: "center",
              margin: "12px 0 0",
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              color: "#bbb",
            }}
          >
            Nhấn vào bất kỳ đâu bên ngoài để đóng
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes slideDown {
          from { transform: translateY(0); }
          to   { transform: translateY(100%); }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
      `}</style>
    </>
  );
}
