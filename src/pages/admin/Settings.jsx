import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function todayVN() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
}

export default function Settings() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  // Ngày đang được chọn để xem/chỉnh setting
  const [selectedDate, setSelectedDate] = useState(todayVN());
  const [isToday, setIsToday] = useState(true);

  const [stats, setStats] = useState(null);
  // Default close_time giờ là 20:00
  const [form, setForm] = useState({ open_time: "08:00", close_time: "20:00", slot_minutes: 30 });
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [toast, setToast] = useState(null);

  // Lấy stats (chỉ cho hôm nay)
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/queue/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin/login");
        return;
      }
      const json = await res.json();
      setStats(json);
    } catch (err) {
      console.error(err);
    }
  }, [token, navigate]);

  // Lấy settings cho ngày được chọn
  const fetchSettingsForDate = useCallback(
    async (date) => {
      setLoadingSettings(true);
      try {
        // Gọi /api/queue/slots với date để lấy settings ngày đó
        const res = await fetch(`${API}/api/queue/slots?date=${date}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Fetch failed");
        const json = await res.json();
        if (json.settings) {
          setForm({
            open_time: json.settings.open_time?.slice(0, 5) || "08:00",
            close_time: json.settings.close_time?.slice(0, 5) || "20:00",
            slot_minutes: json.settings.slot_minutes || 30,
          });
        } else {
          // Không có setting riêng cho ngày này → dùng default
          setForm({ open_time: "08:00", close_time: "20:00", slot_minutes: 30 });
        }
      } catch {
        setForm({ open_time: "08:00", close_time: "20:00", slot_minutes: 30 });
      } finally {
        setLoadingSettings(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchStats();
  }, [fetchStats, token, navigate]);

  useEffect(() => {
    setIsToday(selectedDate === todayVN());
    fetchSettingsForDate(selectedDate);
  }, [selectedDate, fetchSettingsForDate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/queue/settings`, {
        method: "PATCH",
        headers: auth,
        body: JSON.stringify({ ...form, date: selectedDate }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(json.error || "Lỗi lưu cài đặt", "err");
      } else {
        showToast(isToday ? "✓ Đã lưu cài đặt hôm nay" : `✓ Đã lưu cài đặt cho ${formatDate(selectedDate)}`);
        if (isToday) fetchStats();
      }
    } catch {
      showToast("Lỗi kết nối", "err");
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const calcSlotCount = () => {
    if (!form.open_time || !form.close_time || !form.slot_minutes) return 0;
    const [oh, om] = form.open_time.split(":").map(Number);
    const [ch, cm] = form.close_time.split(":").map(Number);
    const totalMin = ch * 60 + cm - (oh * 60 + om);
    return totalMin > 0 ? Math.floor(totalMin / form.slot_minutes) : 0;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const getDaysBetween = (dateStr) => {
    const today = new Date(todayVN());
    const selected = new Date(dateStr);
    const diff = Math.round((selected - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return null;
    if (diff === 1) return "ngày mai";
    if (diff > 1) return `${diff} ngày nữa`;
    return null;
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 left-4 md:left-auto md:right-5 z-50 px-5 py-3 rounded-[var(--r-md)] text-[13px] font-medium shadow-[var(--shadow-md)] animate-fade-in text-center md:text-left
          ${toast.type === "err" ? "bg-red-bg border border-red-border text-c-red" : "bg-green-bg border border-green-border text-c-green"}`}
        >
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-4 md:gap-5">
        {/* ── Left: Form ── */}
        <div className="flex flex-col gap-4 md:gap-5">
          {/* Date selector */}
          <div className="bg-white border border-border rounded-[var(--r-xl)] p-4 md:p-5">
            <p className="label mb-1">Chọn ngày cài đặt</p>
            <p className="text-[11px] md:text-[12px] text-c-text-3 m-0 mb-3">
              Có thể cài trước cho ngày tương lai. Nếu không có cài đặt riêng, mặc định <span className="font-semibold text-c-text">8:00 → 20:00</span>
            </p>

            <div className="flex gap-2 flex-wrap mb-3">
              {/* Quick select buttons */}
              {[
                { label: "Hôm nay", value: todayVN() },
                {
                  label: "Ngày mai",
                  value: new Date(new Date(todayVN()).getTime() + 86400000).toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }),
                },
              ].map((q) => (
                <button
                  key={q.value}
                  onClick={() => setSelectedDate(q.value)}
                  className={`px-3 py-1.5 text-[11px] md:text-[12px] font-semibold rounded-[var(--r-md)] border transition-all cursor-pointer
                    ${selectedDate === q.value ? "bg-c-text text-white border-c-text" : "bg-white text-c-text-2 border-border hover:border-border-2"}`}
                >
                  {q.label}
                </button>
              ))}
            </div>

            <input
              type="date"
              value={selectedDate}
              min={todayVN()}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="w-full px-3 py-2.5 text-[13px] border border-border rounded-[var(--r-md)] bg-bg-2 text-c-text outline-none focus:border-border-2 transition-colors"
            />

            {/* Date label */}
            <div className="mt-2.5 flex items-center gap-2">
              {isToday ? (
                <span className="text-[11px] font-semibold text-c-green bg-green-bg border border-green-border px-2 py-0.5 rounded-full">● Hôm nay</span>
              ) : (
                <span className="text-[11px] font-semibold text-c-amber bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  ◆ {getDaysBetween(selectedDate) || formatDate(selectedDate)}
                </span>
              )}
              <span className="text-[11px] text-c-text-3">{formatDate(selectedDate)}</span>
            </div>
          </div>

          {/* Giờ hoạt động */}
          <div className="bg-white border border-border rounded-[var(--r-xl)] p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="label m-0">Giờ hoạt động</p>
              {loadingSettings && <span className="text-[11px] text-c-text-3">Đang tải...</span>}
            </div>

            <div className="flex flex-col gap-3 md:gap-4">
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <div>
                  <label className="text-[10px] md:text-[11px] font-semibold text-c-text-3 uppercase tracking-wide block mb-1.5">Giờ mở cửa</label>
                  <input
                    type="time"
                    value={form.open_time}
                    onChange={(e) => setForm((f) => ({ ...f, open_time: e.target.value }))}
                    className="w-full px-3 py-2.5 text-[13px] border border-border rounded-[var(--r-md)] bg-bg-2 text-c-text outline-none focus:border-border-2 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] md:text-[11px] font-semibold text-c-text-3 uppercase tracking-wide block mb-1.5">Giờ đóng cửa</label>
                  <input
                    type="time"
                    value={form.close_time}
                    onChange={(e) => setForm((f) => ({ ...f, close_time: e.target.value }))}
                    className="w-full px-3 py-2.5 text-[13px] border border-border rounded-[var(--r-md)] bg-bg-2 text-c-text outline-none focus:border-border-2 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] md:text-[11px] font-semibold text-c-text-3 uppercase tracking-wide block mb-1.5">Thời lượng mỗi slot</label>
                <div className="flex gap-1.5 md:gap-2">
                  {[15, 20, 30, 45, 60].map((min) => (
                    <button
                      key={min}
                      onClick={() => setForm((f) => ({ ...f, slot_minutes: min }))}
                      className={`flex-1 py-2 text-[11px] md:text-[12px] font-semibold rounded-[var(--r-md)] border transition-all cursor-pointer
                        ${form.slot_minutes === min ? "bg-c-text text-white border-c-text" : "bg-white text-c-text-2 border-border hover:border-border-2"}`}
                    >
                      {min}p
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-bg-2 rounded-[var(--r-md)] px-3 md:px-4 py-2.5 md:py-3 border border-border">
                <p className="m-0 text-[11px] md:text-[12px] text-c-text-2">
                  → <span className="font-semibold text-c-text">{calcSlotCount()} slots</span> từ <span className="font-semibold text-c-text">{form.open_time}</span> đến{" "}
                  <span className="font-semibold text-c-text">{form.close_time}</span>
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving || loadingSettings}
                className="w-full py-2.5 rounded-[var(--r-md)] text-[13px] md:text-[14px] font-semibold text-white bg-c-text border-none hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : isToday ? "Lưu cho hôm nay" : `Lưu cho ${getDaysBetween(selectedDate) || formatDate(selectedDate)}`}
              </button>
            </div>
          </div>

          {/* Ghi chú */}
          <div className="bg-white border border-border rounded-[var(--r-xl)] px-4 md:px-6 py-4 md:py-5">
            <p className="label mb-2 md:mb-3">Lưu ý</p>
            {[
              "Mặc định tất cả các ngày là 8:00 → 20:00 nếu không set riêng",
              "Cài đặt cho từng ngày sẽ ghi đè lên mặc định",
              "Các slot đã đặt không bị ảnh hưởng khi thay đổi",
              "Thay đổi slot_minutes ảnh hưởng đến booking mới",
            ].map((note) => (
              <div key={note} className="flex items-start gap-2 py-1.5 md:py-2 border-b border-border last:border-0">
                <span className="text-c-amber text-[11px] md:text-[12px] mt-0.5 flex-shrink-0">⚠</span>
                <p className="m-0 text-[11px] md:text-[12px] text-c-text-2">{note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Stats (chỉ hiện khi xem hôm nay) ── */}
        <div className="flex flex-col gap-4 md:gap-5">
          {isToday ? (
            <div className="bg-white border border-border rounded-[var(--r-xl)] p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-5">
                <p className="label m-0">Trạng thái hôm nay</p>
                <button
                  onClick={fetchStats}
                  className="text-[10px] md:text-[11px] px-2.5 md:px-3 py-1 md:py-1.5 rounded-[var(--r-sm)] border border-border text-c-text-3 hover:bg-bg-2 cursor-pointer bg-transparent transition-all"
                >
                  ↻ Làm mới
                </button>
              </div>

              {!stats ? (
                <div className="py-8 text-center text-c-text-3 text-[13px]">Đang tải...</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-5">
                    {[
                      { label: "Đang chờ", value: stats.waitingCount, color: "text-c-text" },
                      { label: "Thợ đang làm", value: stats.activeBarbers, color: "text-c-green" },
                      { label: "Chờ ước tính", value: `~${stats.estimatedWaitMinutes}p`, color: "text-c-text" },
                      { label: "Đang phục vụ", value: stats.currentServing.length, color: "text-blue-500" },
                    ].map((s) => (
                      <div key={s.label} className="bg-bg-2 border border-border rounded-[var(--r-lg)] px-3 md:px-4 py-3 md:py-4">
                        <p className="label mb-1 text-[9px] md:text-[10.5px]">{s.label}</p>
                        <p className={`font-serif text-[22px] md:text-[28px] m-0 leading-none ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {stats.currentServing.length > 0 && (
                    <div>
                      <p className="label mb-2 md:mb-3">Đang phục vụ ngay lúc này</p>
                      {stats.currentServing.map((s) => (
                        <div key={s.id} className="flex items-center justify-between py-2.5 md:py-3 border-b border-border last:border-0">
                          <div className="min-w-0">
                            <p className="m-0 text-[12px] md:text-[13px] font-semibold text-c-green truncate">{s.name}</p>
                            <p className="m-0 text-[10px] md:text-[11px] text-c-text-3">
                              {s.phone}
                              {s.barber_name ? ` · ${s.barber_name}` : ""}
                            </p>
                          </div>
                          <span className="text-[10px] md:text-[11px] text-c-text-3 bg-green-bg border border-green-border px-2 md:px-2.5 py-1 rounded-full flex-shrink-0 ml-2">Đang cắt</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* Khi chọn ngày tương lai: hiển thị hướng dẫn */
            <div className="bg-white border border-border rounded-[var(--r-xl)] p-4 md:p-6">
              <p className="label mb-3">Cài đặt trước cho ngày tương lai</p>
              <div className="bg-bg-2 border border-border rounded-[var(--r-lg)] p-4 mb-4">
                <p className="text-[13px] font-semibold text-c-text m-0 mb-1">{formatDate(selectedDate)}</p>
                {getDaysBetween(selectedDate) && <p className="text-[11px] text-c-text-3 m-0">Còn {getDaysBetween(selectedDate)}</p>}
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  { icon: "🎉", text: "Ngày lễ / sự kiện đặc biệt → mở cửa sớm hơn hoặc muộn hơn" },
                  { icon: "📅", text: "Cuối tuần → có thể điều chỉnh slot ngắn hơn cho đông khách" },
                  { icon: "🌙", text: "Ngày cao điểm → kéo dài đến tận 21h-22h" },
                ].map((tip) => (
                  <div key={tip.text} className="flex items-start gap-2.5 py-2 border-b border-border last:border-0">
                    <span className="text-[14px] flex-shrink-0 mt-0.5">{tip.icon}</span>
                    <p className="m-0 text-[11px] md:text-[12px] text-c-text-2">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
