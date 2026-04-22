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
 * Tính ETA = scheduled_time + duration thực tế của dịch vụ
 * Bóc HH:MM trực tiếp từ string — tránh lỗi timezone
 *
 * @param {string} scheduledTimeStr - chuỗi chứa "HH:MM" (VD: "2026-04-22 14:00:00Z")
 * @param {number} duration - số phút thực tế của dịch vụ (từ total_duration của entry)
 */
export function calcETAFromScheduled(scheduledTimeStr, duration = AVG_MINUTES) {
  if (!scheduledTimeStr) return null;
  // Match HH:MM sau ký tự T hoặc space (bỏ qua phần date YYYY-MM-DD)
  const m = String(scheduledTimeStr).match(/[T ](\d{2}):(\d{2})/);
  if (!m) return null;
  const totalMin = parseInt(m[1]) * 60 + parseInt(m[2]) + duration;
  const h = Math.floor(totalMin / 60) % 24;
  const min = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function toVNDate(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
}
