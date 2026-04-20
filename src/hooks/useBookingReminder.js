// hooks/useBookingReminder.js
const STORAGE_KEY = "booking_reminder";

export function saveBookingReminder({ name, phone, date, time, services, totalPrice }) {
  const data = { name, phone, date, time, services, totalPrice, savedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getBookingReminder() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);

    // Xoá nếu đã qua ngày hẹn (so sánh ngày VN)
    const appointmentDate = new Date(`${data.date}T${data.time}:00+07:00`);
    const now = new Date();
    if (now > appointmentDate) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearBookingReminder() {
  localStorage.removeItem(STORAGE_KEY);
}
