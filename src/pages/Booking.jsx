import { useState } from "react";
import { Link } from "react-router-dom";
import { calcWaitMinutes, formatWaitTime, calcETAFromScheduled, todayVN } from "../utils/timeHelper";
import { useSlots, useServices } from "../hooks/useQueue";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Field = ({ label, children }) => (
  <div className="mb-4 md:mb-5">
    <label className="block text-[12px] md:text-[13px] font-medium text-c-text-2 mb-2">{label}</label>
    {children}
  </div>
);

function maxBookingDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
}

export default function Booking() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayVN());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [note, setNote] = useState("");
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { slots, loadingSlots, activeBarbers } = useSlots(selectedDate);
  const { services, loadingServices } = useServices();

  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

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
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Đặt lịch thất bại");
      setTicket(data);
    } catch {
      setError("Không kết nối được tới máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Ticket ── */
  if (ticket) {
    const eta = calcETAFromScheduled(`${ticket.booking_date ?? selectedDate} ${selectedSlot}`, ticket.total_duration ?? totalDuration);
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 md:p-6 bg-bg-2">
        <div className="max-w-md w-full bg-white rounded-[var(--r-2xl)] border border-border overflow-hidden shadow-[var(--shadow-lg)] animate-fade-up">
          <div className="bg-c-text text-white p-2 text-center">
            <p className="label text-white/40 pt-2">Số định danh của bạn</p>
            <div className="font-serif text-[56px] md:text-[60px] pb-2 leading-none text-white">#{ticket.display_position ?? ticket.position}</div>
          </div>
          <div className="p-6 md:p-9">
            <p className="font-serif text-[18px] md:text-[20px] text-center text-c-text mb-5 md:mb-6">🎉 Đặt lịch thành công!</p>
            {[
              { label: "Họ tên", value: ticket.name },
              { label: "Số điện thoại", value: ticket.phone },
              { label: "Ngày hẹn", value: selectedDate },
              { label: "Giờ hẹn", value: selectedSlot },
              { label: "Dịch vụ", value: selectedServices.map((s) => s.name).join(", ") || "—" },
              { label: "Tổng thời gian", value: `~${totalDuration} phút` },
              { label: "Tổng tiền", value: `${totalPrice.toLocaleString("vi-VN")}k`, accent: true },
              { label: "Người phía trước", value: `${ticket.peopleAhead ?? 0} người` },
              ...(eta ? [{ label: "Dự kiến xong", value: `~${eta}`, accent: true }] : []),
            ].map(({ label, value, accent }) => (
              <div key={label} className="flex justify-between items-center py-2 md:py-2.5 border-b border-border last:border-0">
                <span className="text-[12px] md:text-[13px] text-c-text-3">{label}</span>
                <span className={`text-[12px] md:text-[13px] font-semibold ${accent ? "text-c-amber" : "text-c-text"}`}>{value}</span>
              </div>
            ))}
            <div className="mt-6 md:mt-7 flex flex-col gap-2.5">
              <Link to="/queue" className="btn-primary justify-center">
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
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="bg-bg-2 min-h-[80vh]">
      <div className="max-w-xl mx-auto px-4 md:px-5 py-6 md:py-14">
        <div className="bg-white border border-border rounded-[var(--r-2xl)] overflow-hidden shadow-[var(--shadow-sm)]">
          <div className="px-5 md:px-8 py-5 md:py-7 border-b border-border">
            <h2 className="font-serif text-[20px] md:text-[24px] text-c-text m-0 mb-1">Đặt lịch cắt tóc</h2>
            <p className="text-[12px] md:text-[13px] text-c-text-2 m-0">
              Chọn dịch vụ, ngày và giờ
              {activeBarbers > 0 && <span className="ml-2 text-c-green font-medium">· {activeBarbers} thợ đang làm</span>}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-5 md:px-8 py-5 md:py-8">
            <Field label="Họ và tên *">
              <input type="text" placeholder="Nguyễn Văn A" value={name} onChange={(e) => setName(e.target.value)} className="input-field" required autoComplete="name" />
            </Field>

            <Field label="Số điện thoại *">
              <input type="tel" placeholder="0815 934 934" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" required autoComplete="tel" inputMode="numeric" />
            </Field>

            {/* ── Dịch vụ ── */}
            <div className="mb-4 md:mb-5">
              <label className="block text-[12px] md:text-[13px] font-medium text-c-text-2 mb-2">
                Chọn dịch vụ *{" "}
                {selectedServiceIds.length > 0 && (
                  <span className="text-c-green font-semibold">
                    ({totalDuration} phút · {totalPrice.toLocaleString("vi-VN")}k)
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
                          {svc.price}k · {svc.duration} phút
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Chọn ngày ── */}
            <Field label="Ngày hẹn *">
              <input type="date" value={selectedDate} min={todayVN()} max={maxBookingDate()} onChange={(e) => handleDateChange(e.target.value)} className="input-field" required />
            </Field>

            {/* ── Slot ── */}
            <div className="mb-4 md:mb-5">
              <label className="block text-[12px] md:text-[13px] font-medium text-c-text-2 mb-2">Chọn giờ hẹn *</label>
              {loadingSlots ? (
                <div className="grid grid-cols-4 gap-2">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="skeleton h-10 rounded-[var(--r-md)]" />
                    ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="text-[12px] md:text-[13px] text-c-text-3 py-4 text-center border border-border rounded-[var(--r-md)]">Không có slot nào ngày này</div>
              ) : (
                <div className="grid grid-cols-4 gap-1.5 md:gap-2">
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
                                ? "bg-bg-2 text-c-text-3 border-border cursor-not-allowed opacity-50"
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

            <Field label="Ghi chú (tuỳ chọn)">
              <input type="text" placeholder="Ví dụ: tóc dài, undercut..." value={note} onChange={(e) => setNote(e.target.value)} className="input-field" />
            </Field>

            <div className="bg-amber-bg border border-amber-border rounded-[var(--r-md)] p-3 md:p-4 mb-5 md:mb-6 flex gap-2.5 md:gap-3 items-start">
              <span className="text-sm flex-shrink-0">ℹ️</span>
              <p className="text-[11px] md:text-[13px] text-c-text-2 m-0 leading-relaxed">
                Mỗi SĐT chỉ đặt <b>1 lần/ngày</b>. Tới lượt có <b>5 phút</b> để có mặt — quá thời gian sẽ bị bỏ qua.
              </p>
            </div>

            {error && <div className="bg-red-bg border border-red-border rounded-[var(--r-md)] px-4 py-3 mb-4 md:mb-5 text-c-red text-[12px] md:text-[13px]">⚠️ {error}</div>}

            <button
              type="submit"
              className="btn-primary w-full justify-center py-3 text-[13px] md:text-[14px]"
              disabled={loading || !selectedSlot || !selectedServiceIds.length}
              style={{ opacity: loading || !selectedSlot || !selectedServiceIds.length ? 0.55 : 1 }}
            >
              {loading ? "Đang xử lý..." : selectedSlot && selectedServiceIds.length ? `Đặt ${selectedDate} ${selectedSlot} · ${totalPrice.toLocaleString("vi-VN")}k →` : "Chọn dịch vụ & giờ để đặt"}
            </button>
          </form>
        </div>

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
