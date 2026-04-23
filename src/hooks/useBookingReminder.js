// ─────────────────────────────────────────────────────────────
// useBookingReminder.js
// Quản lý lịch hẹn local (localStorage)
// Keys:
//   REMINDER_KEY  = "booking_reminders_v3"  → map { "date_phone": booking }
//   HISTORY_KEY   = "booking_history"        → array (mọi lịch đã từng đặt)
// ─────────────────────────────────────────────────────────────

const REMINDER_KEY = "booking_reminders_v3";
const HISTORY_KEY = "booking_history";
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Helpers ──────────────────────────────────────────────────

function getReminderMap() {
  try {
    return JSON.parse(localStorage.getItem(REMINDER_KEY) || "{}");
  } catch {
    return {};
  }
}

function setReminderMap(map) {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(map));
}

function getHistoryList() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function setHistoryList(list) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

// ── Public API ───────────────────────────────────────────────

/** Lưu 1 lịch mới vào reminder map + history */
export function saveBookingReminder(booking) {
  // { name, phone, date, time, services, totalPrice }
  const key = `${booking.date}_${booking.phone}`;
  const entry = { ...booking, savedAt: Date.now() };

  // reminder map (active)
  const map = getReminderMap();
  map[key] = entry;
  setReminderMap(map);

  // history (append, dedup by key)
  const history = getHistoryList().filter((h) => !(h.date === booking.date && h.phone === booking.phone));
  history.unshift(entry);
  // giới hạn 50 bản ghi lịch sử
  setHistoryList(history.slice(0, 50));
}

/** Lấy tất cả lịch hẹn đang active của 1 ngày */
export function getBookingReminder(date) {
  const map = getReminderMap();
  return Object.values(map).filter((b) => b.date === date);
}

/** Lấy set các ngày đang có lịch hẹn active */
export function getBookedDates() {
  const map = getReminderMap();
  const dates = new Set();
  for (const b of Object.values(map)) {
    if (b.date) dates.add(b.date);
  }
  return dates;
}

/** Lấy toàn bộ lịch sử đã từng đặt */
export function getBookingHistory() {
  return getHistoryList();
}

/**
 * Hủy 1 lịch:
 *  1. Xóa khỏi reminder map (local)
 *  2. Giữ trong history nhưng đánh dấu cancelled: true
 *  3. Gọi API DELETE để xóa khỏi DB
 * Trả về { ok, error }
 */
export async function cancelBooking(date, phone) {
  const key = `${date}_${phone}`;

  // Xóa khỏi reminder map
  const map = getReminderMap();
  delete map[key];
  setReminderMap(map);

  // Đánh dấu cancelled trong history
  const history = getHistoryList().map((h) => (h.date === date && h.phone === phone ? { ...h, cancelled: true } : h));
  setHistoryList(history);

  // Gọi API xóa DB
  try {
    const res = await fetch(`${API}/api/queue/cancel`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, booking_date: date }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || "Không thể hủy lịch" };
    return { ok: true };
  } catch {
    // Network error — vẫn xóa local thành công, báo lỗi nhẹ
    return { ok: false, error: "Đã xóa cục bộ nhưng không kết nối được máy chủ" };
  }
}

/**
 * Cập nhật thông tin 1 lịch trong local (sau khi rebook thành công)
 * Không gọi API — dùng khi user đặt lại với phone/date mới
 */
export function updateLocalReminder(oldDate, oldPhone, newBooking) {
  const oldKey = `${oldDate}_${oldPhone}`;
  const newKey = `${newBooking.date}_${newBooking.phone}`;
  const map = getReminderMap();
  delete map[oldKey];
  map[newKey] = { ...newBooking, savedAt: Date.now() };
  setReminderMap(map);
}
