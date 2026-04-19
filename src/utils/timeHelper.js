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
