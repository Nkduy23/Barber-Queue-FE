import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Settings() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const todayVN = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });

  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ open_time: "08:00", close_time: "19:00", slot_minutes: 30 });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/queue/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin/login");
        return;
      }
      const json = await res.json();
      setStats(json);
      if (json.settings) {
        setForm({
          open_time: json.settings.open_time || "08:00",
          close_time: json.settings.close_time || "19:00",
          slot_minutes: json.settings.slot_minutes || 30,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    Promise.resolve().then(() => fetchStats());
  }, [fetchStats, token, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/queue/settings`, {
        method: "PATCH",
        headers: auth,
        body: JSON.stringify({ ...form, date: todayVN }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(json.error || "Lỗi lưu cài đặt", "err");
      } else {
        showToast("✓ Đã lưu cài đặt");
        fetchStats();
      }
    } catch {
      showToast("Lỗi kết nối", "err");
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const calcSlotCount = () => {
    if (!form.open_time || !form.close_time || !form.slot_minutes) return 0;
    const [oh, om] = form.open_time.split(":").map(Number);
    const [ch, cm] = form.close_time.split(":").map(Number);
    const totalMin = ch * 60 + cm - (oh * 60 + om);
    return totalMin > 0 ? Math.floor(totalMin / form.slot_minutes) : 0;
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
          {/* Giờ hoạt động */}
          <div className="bg-white border border-border rounded-[var(--r-xl)] p-4 md:p-6">
            <p className="label mb-1">Giờ hoạt động hôm nay</p>
            <p className="text-[11px] md:text-[12px] text-c-text-3 m-0 mb-4 md:mb-5">
              Ngày: <span className="font-semibold text-c-text">{todayVN}</span>
            </p>

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
                disabled={saving}
                className="w-full py-2.5 rounded-[var(--r-md)] text-[13px] md:text-[14px] font-semibold text-white bg-c-text border-none hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu cài đặt"}
              </button>
            </div>
          </div>

          {/* Ghi chú */}
          <div className="bg-white border border-border rounded-[var(--r-xl)] px-4 md:px-6 py-4 md:py-5">
            <p className="label mb-2 md:mb-3">Lưu ý</p>
            {["Cài đặt chỉ áp dụng cho ngày hôm nay", "Các slot đã đặt không bị ảnh hưởng", "Thay đổi slot_minutes ảnh hưởng booking mới"].map((note) => (
              <div key={note} className="flex items-start gap-2 py-1.5 md:py-2 border-b border-border last:border-0">
                <span className="text-c-amber text-[11px] md:text-[12px] mt-0.5 flex-shrink-0">⚠</span>
                <p className="m-0 text-[11px] md:text-[12px] text-c-text-2">{note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Stats ── */}
        <div className="flex flex-col gap-4 md:gap-5">
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
        </div>
      </div>
    </div>
  );
}
