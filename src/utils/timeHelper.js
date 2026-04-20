const AVG_MINUTES = 25;

export function calcWaitMinutes(position) {
  return position * AVG_MINUTES;
}

export function formatWaitTime(minutes) {
  if (!minutes || minutes <= 0) return "~0 phút";
  if (minutes < 60) return `~${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `~${h} giờ ${m} phút` : `~${h} giờ`;
}

// Giữ nguyên — Booking.jsx đang dùng
export function calcEstimatedTime(waitMinutes) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + waitMinutes);
  return now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

export function formatTime(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

export function formatScheduledTime(scheduledTimeStr) {
  if (!scheduledTimeStr) return "—";
  const match = String(scheduledTimeStr).match(/(\d{2}:\d{2})/);
  return match ? match[1] : "—";
}

export function formatDateTime(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

export function todayVN() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
}

/**
 * Tính ETA từ scheduled_time (VN naive string, có thể có "Z" suffix)
 * Bóc HH:MM trực tiếp từ string — KHÔNG dùng new Date() để tránh lỗi timezone
 * ETA = scheduled_time + avgMinutes (chỉ cộng 1 lần, không nhân position)
 */
export function calcETAFromScheduled(scheduledTimeStr, avgMinutes = AVG_MINUTES) {
  if (!scheduledTimeStr) return null;
  const m = String(scheduledTimeStr).match(/(\d{2}):(\d{2})/);
  if (!m) return null;
  const totalMin = parseInt(m[1]) * 60 + parseInt(m[2]) + avgMinutes;
  const h = Math.floor(totalMin / 60) % 24;
  const min = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}
