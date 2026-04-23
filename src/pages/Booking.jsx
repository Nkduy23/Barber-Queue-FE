import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toVNDate, calcETAFromScheduled, todayVN } from "../utils/timeHelper";
import { useSlots, useServices } from "../hooks/useQueue";
import { saveBookingReminder } from "../hooks/useBookingReminder";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function validatePhone(digits) {
  if (!digits) return "";
  if (digits.length < 9) return "Số điện thoại quá ngắn";
  if (digits.length > 10) return "Số điện thoại quá dài";
  if (!/^0[3-9]\d{8}$/.test(digits)) return "Số không hợp lệ (VD: 0999 999 999)";
  return "";
}

function formatPhoneDisplay(raw) {
  const d = raw.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 4) return d;
  if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
}

function generateDates() {
  const result = [];
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const iso = d.toLocaleDateString("en-CA");
    const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    result.push({ iso, label: weekdays[d.getDay()], day: d.getDate(), month: d.getMonth() + 1, isToday: i === 0 });
  }
  return result;
}

const DATES = generateDates();

function StepBar({ step }) {
  const steps = ["Dịch vụ", "Lịch hẹn", "Xác nhận"];
  return (
    <div className="flex items-center gap-0 mb-6 md:mb-8">
      {steps.map((s, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all"
                style={{
                  background: done ? "#111" : active ? "#111" : "#e5e5e5",
                  color: done || active ? "#fff" : "#999",
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              <span className="text-[9px] font-semibold mt-1 uppercase tracking-wide transition-colors" style={{ color: active ? "#111" : done ? "#555" : "#bbb" }}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-[1.5px] mx-1 mb-4 transition-colors" style={{ background: done ? "#111" : "#e5e5e5" }} />}
          </div>
        );
      })}
    </div>
  );
}

export default function Booking() {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState(searchParams.get("prefill_name") || "");
  const [phone, setPhone] = useState(searchParams.get("prefill_phone") || "");
  const [selectedDate, setSelectedDate] = useState(todayVN());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [note, setNote] = useState("");
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [barbers, setBarbers] = useState([]);

  const { services, loadingServices } = useServices();

  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  const { slots, loadingSlots, activeBarbers } = useSlots(selectedDate, totalDuration > 0 ? totalDuration : null);

  // ── Scroll to top khi ticket xuất hiện ──────────────────────
  useEffect(() => {
    if (ticket) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [ticket]);

  // Step: 0 = dịch vụ, 1 = lịch hẹn, 2 = xác nhận (form)
  const step = selectedServiceIds.length === 0 ? 0 : !selectedSlot ? 1 : 2;

  const toggleService = (id) => {
    setSelectedServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setSelectedSlot("");
  };

  const handleDateChange = (val) => {
    setSelectedDate(val);
    setSelectedSlot("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return setError("Vui lòng chọn giờ hẹn");
    if (!selectedServiceIds.length) return setError("Vui lòng chọn ít nhất 1 dịch vụ");
    const phoneErr = validatePhone(phone);
    if (phoneErr) return setError(phoneErr);
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          scheduled_time: selectedSlot,
          booking_date: selectedDate,
          service_ids: selectedServiceIds,
          note,
          barber_id: selectedBarber,
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Đặt lịch thất bại");
      setTicket(data);
      saveBookingReminder({
        name,
        phone,
        date: selectedDate,
        time: selectedSlot,
        services: selectedServices.map((s) => s.name).join(", "),
        totalPrice,
      });
    } catch {
      setError("Không kết nối được tới máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch(`${API}/api/queue/barbers`)
      .then((r) => r.json())
      .then(setBarbers);
  }, []);

  /* ── SUCCESS TICKET ── */
  if (ticket) {
    const eta = calcETAFromScheduled(`${selectedDate} ${selectedSlot}`, ticket.total_duration ?? totalDuration);
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 md:p-6 bg-bg-2">
        <div
          className="max-w-md w-full bg-white rounded-[var(--r-2xl)] border border-border overflow-hidden shadow-[var(--shadow-lg)]"
          style={{ animation: "ticketReveal 0.5s cubic-bezier(0.16,1,0.3,1) forwards" }}
        >
          <div className="bg-c-text text-white px-6 pt-6 pb-5 text-center relative overflow-hidden">
            {["#fde68a", "#bbf7d0", "#fecaca", "#bfdbfe", "#fde68a"].map((c, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: c,
                  top: `${10 + i * 12}%`,
                  left: `${8 + i * 18}%`,
                  animation: `confetti ${0.6 + i * 0.1}s ease-out forwards`,
                  opacity: 0,
                }}
              />
            ))}
            <div className="w-14 h-14 rounded-full border-2 border-white/30 flex items-center justify-center mx-auto mb-3" style={{ animation: "checkPop 0.4s 0.2s ease-out both" }}>
              <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 30, strokeDashoffset: 0, animation: "drawCheck 0.4s 0.4s ease-out both" }} />
              </svg>
            </div>
            <p className="label text-white/40 m-0 mb-1">Số thứ tự của bạn</p>
            <div className="font-serif leading-none text-white" style={{ fontSize: "clamp(52px,12vw,68px)", animation: "numPop 0.5s 0.3s cubic-bezier(0.16,1,0.3,1) both" }}>
              #{ticket.display_position ?? ticket.position}
            </div>
          </div>

          <div className="p-5 md:p-7">
            <p className="font-serif text-[17px] md:text-[19px] text-center text-c-text mb-5">🎉 Đặt lịch thành công!</p>

            <div className="bg-bg-2 border border-border rounded-[var(--r-lg)] overflow-hidden mb-5">
              {[
                { icon: "👤", label: "Họ tên", value: ticket.name },
                { icon: "📅", label: "Ngày", value: selectedDate },
                { icon: "🕐", label: "Giờ hẹn", value: selectedSlot },
                { icon: "✂️", label: "Dịch vụ", value: selectedServices.map((s) => s.name).join(", ") || "—" },
                { icon: "⏱", label: "Thời gian", value: `~${ticket.total_duration ?? totalDuration} phút` },
                { icon: "💰", label: "Tổng tiền", value: `${totalPrice.toLocaleString("vi-VN")}đ`, accent: true },
                // { icon: "👥", label: "Người trước", value: `${ticket.peopleAhead ?? 0} người` },
                ...(eta ? [{ icon: "🎯", label: "Dự kiến xong", value: `~${eta}`, accent: true }] : []),
              ].map(({ icon, label, value, accent }, i, arr) => (
                <div key={label} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                  <span className="text-[13px] flex-shrink-0">{icon}</span>
                  <span className="text-[12px] text-c-text-3 w-24 flex-shrink-0">{label}</span>
                  <span className="text-[12px] font-semibold flex-1 text-right" style={{ color: accent ? "#d97706" : "#111" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2.5">
              <Link to={`/queue?date=${toVNDate(ticket.booking_date) ?? selectedDate}`} className="btn-primary justify-center">
                Theo dõi hàng chờ →
              </Link>
              <button
                onClick={() => {
                  setTicket(null);
                  setSelectedSlot("");
                  setName("");
                  setPhone("");
                  setNote("");
                  setSelectedServiceIds([]);
                }}
                className="btn-ghost justify-center"
              >
                Đặt lịch cho người khác
              </button>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes ticketReveal { from { opacity:0; transform:translateY(24px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
          @keyframes checkPop    { from { opacity:0; transform:scale(0.5) } to { opacity:1; transform:scale(1) } }
          @keyframes numPop      { from { opacity:0; transform:scale(0.7) } to { opacity:1; transform:scale(1) } }
          @keyframes confetti    { 0%{opacity:0;transform:translateY(0) rotate(0deg)} 30%{opacity:1} 100%{opacity:0;transform:translateY(-40px) rotate(180deg)} }
        `}</style>
      </div>
    );
  }

  /* ── FORM ── */
  return (
    <div className="bg-bg-2 min-h-[80vh]">
      <div className="max-w-xl mx-auto px-4 md:px-5 py-6 md:py-14">
        <div className="bg-white border border-border rounded-[var(--r-2xl)] overflow-hidden shadow-[var(--shadow-sm)]">
          {/* Header */}
          <div className="px-5 md:px-8 pt-5 md:pt-7 pb-4 md:pb-5 border-b border-border">
            <h2 className="font-serif text-[20px] md:text-[24px] text-c-text m-0 mb-1">Đặt lịch cắt tóc</h2>
            <p className="text-[12px] md:text-[13px] text-c-text-2 m-0">
              Chọn dịch vụ, ngày và giờ
              {activeBarbers > 0 && <span className="ml-2 text-c-green font-medium">· {activeBarbers} thợ đang làm</span>}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-5 md:px-8 py-5 md:py-7">
            <StepBar step={step} />

            {/* ── 1. DỊCH VỤ ── */}
            <div className="mb-5 md:mb-6">
              <label className="block text-[12px] md:text-[13px] font-medium text-c-text-2 mb-2">
                1. Chọn dịch vụ *{" "}
                {selectedServiceIds.length > 0 && (
                  <span className="text-c-green font-semibold">
                    ({totalDuration} phút · {totalPrice.toLocaleString("vi-VN")}đ)
                  </span>
                )}
              </label>
              {loadingServices ? (
                <div className="grid grid-cols-2 gap-2">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="skeleton h-14 rounded-[var(--r-md)]" />
                    ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {services.map((svc) => {
                    const selected = selectedServiceIds.includes(svc.id);
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => toggleService(svc.id)}
                        className={`text-left px-3 py-2.5 rounded-[var(--r-md)] border transition-all cursor-pointer
                          ${selected ? "bg-c-text text-white border-c-text shadow-[var(--shadow-sm)]" : "bg-white text-c-text border-border hover:border-border-2 hover:bg-bg-2"}`}
                      >
                        <p className={`m-0 text-[12px] md:text-[13px] font-medium leading-tight ${selected ? "text-white" : "text-c-text"}`}>{svc.name}</p>
                        <p className={`m-0 text-[10px] md:text-[11px] mt-0.5 ${selected ? "text-white/70" : "text-c-text-3"}`}>
                          {svc.price.toLocaleString("vi-VN")}đ · {svc.duration} phút
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedServiceIds.length > 0 && !selectedSlot && <p className="mt-2 text-[11px] text-c-amber">⚡ Giờ trống được cập nhật theo tổng thời gian dịch vụ ({totalDuration} phút)</p>}
            </div>

            {/* ── 1.1. CHỌN THỢ ── */}
            <div className="mb-5">
              <label className="block text-[12px] font-medium text-c-text-2 mb-2">
                Chọn thợ <span className="text-c-text-3">(tuỳ chọn)</span>
              </label>
              <select value={selectedBarber ?? ""} onChange={(e) => setSelectedBarber(e.target.value ? Number(e.target.value) : null)} className="input-field">
                <option value="">Bất kỳ</option>
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ── 2. NGÀY ── */}
            <div className="mb-4 md:mb-5">
              <label className="block text-[12px] md:text-[13px] font-medium text-c-text-2 mb-2">2. Chọn ngày *</label>
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
                {DATES.map((date) => {
                  const isSel = selectedDate === date.iso;
                  return (
                    <button
                      key={date.iso}
                      type="button"
                      onClick={() => handleDateChange(date.iso)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: isSel ? "1.5px solid #111" : "1.5px solid #e5e5e5",
                        background: isSel ? "#111" : "#fff",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        minWidth: 52,
                        flexShrink: 0,
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <span style={{ fontSize: 10, fontWeight: 600, color: isSel ? "rgba(255,255,255,0.6)" : "#999", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {date.isToday ? "Nay" : date.label}
                      </span>
                      <span style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 700, lineHeight: 1.1, color: isSel ? "#fff" : "#111" }}>{date.day}</span>
                      <span style={{ fontSize: 10, color: isSel ? "rgba(255,255,255,0.5)" : "#bbb" }}>Th{date.month}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── 3. GIỜ ── */}
            <div className="mb-5 md:mb-6">
              <label className="block text-[12px] md:text-[13px] font-medium text-c-text-2 mb-2">
                3. Chọn giờ hẹn *{totalDuration > 0 && <span className="ml-1.5 text-c-text-3 font-normal">(cần {totalDuration} phút)</span>}
              </label>
              {loadingSlots ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="skeleton h-10 rounded-[var(--r-md)]" />
                    ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="text-[12px] md:text-[13px] text-c-text-3 py-5 text-center border border-border rounded-[var(--r-md)] bg-bg-2">😔 Không có slot nào ngày này</div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-2">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot === slot.time;
                    const isFull = slot.isFull;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={isFull}
                        onClick={() => !isFull && setSelectedSlot(slot.time)}
                        className={`py-2 md:py-2.5 px-1 text-[12px] md:text-[13px] font-medium rounded-[var(--r-md)] border transition-all
                          ${
                            isSelected
                              ? "bg-c-text text-white border-c-text shadow-[var(--shadow-sm)]"
                              : isFull
                                ? "bg-bg-2 text-c-text-3 border-border cursor-not-allowed opacity-45"
                                : "bg-white text-c-text border-border hover:border-border-2 hover:bg-bg-2 cursor-pointer"
                          }`}
                      >
                        {slot.label}
                        {!isFull && slot.available <= 1 && <span className="block text-[9px] text-c-amber mt-0.5">Còn {slot.available}</span>}
                        {isFull && <span className="block text-[9px] mt-0.5">Hết chỗ</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border my-5 md:my-6" />

            {/* ── 4. THÔNG TIN ── */}
            <p className="text-[11px] font-semibold text-c-text-3 uppercase tracking-wider mb-4">Thông tin của bạn</p>

            <div className="mb-4">
              <label className="block text-[12px] md:text-[13px] font-medium text-c-text-2 mb-2">Họ và tên *</label>
              <input type="text" placeholder="Nguyễn Văn A" value={name} onChange={(e) => setName(e.target.value)} className="input-field" required autoComplete="name" />
            </div>

            <div className="mb-4">
              <label className="block text-[12px] md:text-[13px] font-medium text-c-text-2 mb-2">Số điện thoại *</label>
              <input
                type="tel"
                placeholder="0999 999 999"
                value={formatPhoneDisplay(phone)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhone(raw);
                  setPhoneError(validatePhone(raw));
                }}
                onBlur={() => setPhoneError(validatePhone(phone))}
                className={`input-field ${phoneError ? "!border-c-red" : ""}`}
                required
                autoComplete="tel"
                inputMode="numeric"
              />
              {phoneError && <p className="mt-1.5 text-[11px] text-c-red">⚠ {phoneError}</p>}
            </div>

            <div className="mb-5">
              <label className="block text-[12px] md:text-[13px] font-medium text-c-text-2 mb-2">
                Ghi chú <span className="text-c-text-3">(tuỳ chọn)</span>
              </label>
              <textarea
                placeholder="Ví dụ: tóc dài, muốn undercut, không cạo mặt..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="input-field resize-none"
                style={{ resize: "none" }}
              />
            </div>

            <div className="bg-amber-bg border border-amber-border rounded-[var(--r-md)] p-3 md:p-4 mb-5 flex gap-2.5 items-start">
              <span className="text-sm flex-shrink-0">ℹ️</span>
              <p className="text-[11px] md:text-[12px] text-c-text-2 m-0 leading-relaxed">
                Mỗi SĐT chỉ đặt <b>1 lần/ngày</b>. Tới lượt có <b>5 phút</b> để có mặt — quá thời gian sẽ bị bỏ qua.
              </p>
            </div>

            {error && <div className="bg-red-bg border border-red-border rounded-[var(--r-md)] px-4 py-3 mb-4 text-c-red text-[12px] md:text-[13px]">⚠️ {error}</div>}

            <button
              type="submit"
              className="btn-primary w-full justify-center py-3 text-[13px] md:text-[14px]"
              disabled={loading || !selectedSlot || !selectedServiceIds.length}
              style={{ opacity: loading || !selectedSlot || !selectedServiceIds.length ? 0.55 : 1 }}
            >
              {loading
                ? "Đang xử lý..."
                : selectedSlot && selectedServiceIds.length
                  ? `Xác nhận · ${selectedDate} ${selectedSlot} · ${totalPrice.toLocaleString("vi-VN")}đ →`
                  : "Chọn dịch vụ & giờ để đặt"}
            </button>
          </form>
        </div>

        {/* Feature badges */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 mt-3 md:mt-4">
          {[
            { icon: "⚡", title: "Thời gian thực", desc: "Cập nhật tức thì" },
            { icon: "📅", title: "Đặt trước 7 ngày", desc: "Chủ động lịch" },
            { icon: "📱", title: "Theo dõi dễ", desc: "Xem trên phone" },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-border rounded-[var(--r-lg)] p-3 md:p-4 text-center">
              <div className="text-lg md:text-xl mb-1.5 md:mb-2">{item.icon}</div>
              <p className="text-[11px] md:text-[12px] font-semibold text-c-text m-0 mb-0.5 leading-tight">{item.title}</p>
              <p className="text-[10px] md:text-[11px] text-c-text-3 m-0">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
