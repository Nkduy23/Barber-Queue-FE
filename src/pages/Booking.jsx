import { useState } from "react";
import { Link } from "react-router-dom";
import { calcWaitMinutes, formatWaitTime, calcEstimatedTime } from "../utils/timeHelper";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Field = ({ label, children }) => (
  <div className="mb-5">
    <label className="block text-[13px] font-medium text-c-text-2 mb-2">{label}</label>
    {children}
  </div>
);

export default function Booking() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đặt lịch thất bại");
        return;
      }
      setTicket(data);
    } catch {
      setError("Không kết nối được tới máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  /* Ticket */
  if (ticket) {
    const waitMins = calcWaitMinutes(ticket.peopleAhead ?? 0);
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-bg-2">
        <div className="max-w-md w-full bg-white rounded-[var(--r-2xl)] border border-border overflow-hidden shadow-[var(--shadow-lg)] animate-fade-up">
          {/* Header */}
          <div className="bg-c-text text-white p-10 text-center">
            <p className="label text-white/40 mb-3">Số thứ tự của bạn</p>
            <div className="font-serif text-[88px] leading-none text-white">#{ticket.position}</div>
          </div>
          {/* Body */}
          <div className="p-9">
            <p className="font-serif text-[20px] text-center text-c-text mb-6">🎉 Đặt lịch thành công!</p>
            {[
              { label: "Họ tên", value: ticket.name },
              { label: "Số điện thoại", value: ticket.phone },
              { label: "Người phía trước", value: `${ticket.peopleAhead ?? 0} người` },
              { label: "Thời gian chờ", value: formatWaitTime(waitMins) },
              { label: "Dự kiến tới lượt", value: calcEstimatedTime(waitMins), accent: true },
            ].map(({ label, value, accent }) => (
              <div key={label} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                <span className="text-[13px] text-c-text-3">{label}</span>
                <span className={`text-[14px] font-semibold ${accent ? "text-c-amber" : "text-c-text"}`}>{value}</span>
              </div>
            ))}
            <div className="mt-7 flex flex-col gap-2.5">
              <Link to="/queue" className="btn-primary justify-center">
                Theo dõi hàng chờ →
              </Link>
              <button onClick={() => setTicket(null)} className="btn-ghost justify-center">
                Đặt lịch cho người khác
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Form */
  return (
    <div className="bg-bg-2 min-h-[80vh]">
      <div className="max-w-xl mx-auto px-5 py-14">
        <div className="bg-white border border-border rounded-[var(--r-2xl)] overflow-hidden shadow-[var(--shadow-sm)]">
          {/* Header */}
          <div className="px-8 py-7 border-b border-border">
            <h2 className="font-serif text-[24px] text-c-text m-0 mb-1">Thông tin của bạn</h2>
            <p className="text-[13px] text-c-text-2 m-0">Điền thông tin để nhận số thứ tự trong hàng chờ</p>
          </div>
          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8">
            <Field label="Họ và tên *">
              <input type="text" placeholder="Nguyễn Văn A" value={name} onChange={(e) => setName(e.target.value)} className="input-field" required />
            </Field>
            <Field label="Số điện thoại *">
              <input type="tel" placeholder="0901 234 567" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" required />
            </Field>
            {/* Notice */}
            <div className="bg-amber-bg border border-amber-border rounded-[var(--r-md)] p-4 mb-6 flex gap-3 items-start">
              <span className="text-sm flex-shrink-0">ℹ️</span>
              <p className="text-[13px] text-c-text-2 m-0 leading-relaxed">
                Mỗi số điện thoại chỉ được đặt <b>1 lần/ngày</b>. Khi tới lượt, bạn có <b>5 phút</b> để xác nhận.
              </p>
            </div>
            {error && <div className="bg-red-bg border border-red-border rounded-[var(--r-md)] px-4 py-3 mb-5 text-c-red text-[13px]">⚠️ {error}</div>}
            <button type="submit" className="btn-primary w-full justify-center py-3 text-[14px]" disabled={loading} style={{ opacity: loading ? 0.65 : 1 }}>
              {loading ? "Đang xử lý..." : "Vào hàng chờ →"}
            </button>
          </form>
        </div>

        {/* Info chips */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { icon: "⚡", title: "Thời gian thực", desc: "Cập nhật tức thì" },
            { icon: "⏱", title: "~25 phút/lượt", desc: "Trung bình mỗi khách" },
            { icon: "📱", title: "Theo dõi dễ dàng", desc: "Xem trên điện thoại" },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-border rounded-[var(--r-lg)] p-4 text-center">
              <div className="text-xl mb-2">{item.icon}</div>
              <p className="text-[12px] font-semibold text-c-text m-0 mb-0.5">{item.title}</p>
              <p className="text-[11px] text-c-text-3 m-0">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
