import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toVNDate } from "../../utils/timeHelper";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PERIODS = [
  { label: "Hôm nay", days: 0 },
  { label: "7 ngày", days: 7 },
  { label: "30 ngày", days: 30 },
  { label: "Tháng này", days: -1 },
];

const PIE_COLORS = ["#D97706", "#16A34A", "#2563EB", "#9333EA", "#DB2777", "#EA580C"];

function PieChart({ data, total, percents }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 56;
  const inner = 32; // donut hole

  let cumAngle = -Math.PI / 2;
  const slices = data.map((s, idx) => {
    const pct = total ? s.revenue / total : 0;
    const angle = pct * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + r * Math.cos(cumAngle);
    const y2 = cy + r * Math.sin(cumAngle);
    const ix1 = cx + inner * Math.cos(cumAngle - angle);
    const iy1 = cy + inner * Math.sin(cumAngle - angle);
    const ix2 = cx + inner * Math.cos(cumAngle);
    const iy2 = cy + inner * Math.sin(cumAngle);
    const large = angle > Math.PI ? 1 : 0;
    const d = `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${inner} ${inner} 0 ${large} 0 ${ix1} ${iy1} Z`;
    return { d, color: PIE_COLORS[idx % PIE_COLORS.length], pct: Math.round(pct * 100) };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      {slices.map((s, i) => (
        <path key={i} d={s.d} fill={s.color} opacity={0.9} />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill="var(--c-text-3)" fontFamily="inherit">
        Tổng
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--c-text)" fontFamily="inherit">
        {Number(total).toLocaleString("vi-VN")}k
      </text>
    </svg>
  );
}

function getDateRange(days) {
  const todayVN = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  if (days === 0) return { from: todayVN, to: todayVN };
  if (days === -1) {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString("en-CA");
    return { from, to: todayVN };
  }
  const from = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  from.setDate(from.getDate() - days + 1);
  return { from: from.toLocaleDateString("en-CA"), to: todayVN };
}

function distributePercents(data, total) {
  if (!total) return data.map(() => 0);
  const raw = data.map((s) => (s.revenue / total) * 100);
  const floored = raw.map(Math.floor);
  const remainders = raw.map((v, i) => ({ i, r: v - floored[i] }));
  let leftover = 100 - floored.reduce((a, b) => a + b, 0);
  remainders.sort((a, b) => b.r - a.r);
  remainders.forEach(({ i }) => {
    if (leftover <= 0) return;
    floored[i]++;
    leftover--;
  });
  return floored;
}

export default function RevenueStats() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole") || "barber";
  const myBarberId = localStorage.getItem("barber_id");

  const [periodIdx, setPeriodIdx] = useState(0);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const [revenue, setRevenue] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [salary, setSalary] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("revenue");
  const [expandedBarber, setExpandedBarber] = useState(null);

  // Commission edit state
  const [editingCommission, setEditingCommission] = useState(null); // { barber_id, service_id, percent }
  const [savingCommission, setSavingCommission] = useState(false);
  const [toast, setToast] = useState(null);

  const percents = revenue?.byService ? distributePercents(revenue.byService, revenue.totalRevenue) : [];

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getRange = useCallback(() => {
    if (useCustom && customFrom && customTo) return { from: customFrom, to: customTo };
    return getDateRange(PERIODS[periodIdx].days);
  }, [useCustom, customFrom, customTo, periodIdx]);

  const fetchAll = useCallback(async () => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    setLoading(true);
    const { from, to } = getRange();
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const barberParam = role === "barber" && myBarberId ? `&barber_id=${myBarberId}` : "";

      const [revRes, salRes, comRes, svcRes] = await Promise.all([
        fetch(`${API}/api/dashboard/revenue?from=${from}&to=${to}${barberParam}`, { headers }),
        fetch(`${API}/api/dashboard/salary?from=${from}&to=${to}${barberParam}`, { headers }),
        fetch(`${API}/api/dashboard/commissions`, { headers }),
        fetch(`${API}/api/services`, { headers }),
        role === "admin" ? fetch(`${API}/api/dashboard/barbers?from=${from}&to=${to}`, { headers }) : Promise.resolve(null),
      ]);

      if (revRes.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin/login");
        return;
      }

      const [revJson, salJson, comJson, svcJson] = await Promise.all([revRes.json(), salRes.json(), comRes.json(), svcRes.json()]);

      setRevenue(revJson);
      setSalary(salJson);
      setCommissions(comJson);
      setServices(svcJson);

      if (role === "admin") {
        const barberRes = await fetch(`${API}/api/dashboard/barbers?from=${from}&to=${to}`, { headers });
        const barberJson = await barberRes.json();
        setBarbers(Array.isArray(barberJson) ? barberJson : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, navigate, getRange, role, myBarberId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const saveCommission = async () => {
    if (!editingCommission) return;
    setSavingCommission(true);
    try {
      const res = await fetch(`${API}/api/dashboard/commissions`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(editingCommission),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(json.error || "Lỗi lưu", "err");
      } else {
        showToast("✓ Đã lưu hoa hồng");
        setEditingCommission(null);
        fetchAll();
      }
    } catch {
      showToast("Lỗi kết nối", "err");
    } finally {
      setSavingCommission(false);
    }
  };

  const { from, to } = getRange();

  // Group commissions by barber
  const commissionsByBarber = commissions.reduce((acc, c) => {
    if (!acc[c.barber_id]) acc[c.barber_id] = { name: c.barber_name, items: [] };
    acc[c.barber_id].items.push(c);
    return acc;
  }, {});

  const TABS =
    role === "admin"
      ? [
          { key: "revenue", label: "Doanh thu" },
          { key: "salary", label: "Lương thợ" },
          { key: "commissions", label: "Hoa hồng" },
        ]
      : [
          { key: "salary", label: "Thu nhập của tôi" },
          { key: "commissions", label: "Hoa hồng" },
        ];

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

      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {PERIODS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => {
              setPeriodIdx(i);
              setUseCustom(false);
            }}
            className={`text-[11px] md:text-[12px] px-3 py-2 rounded-[var(--r-md)] border transition-all cursor-pointer
              ${!useCustom && periodIdx === i ? "bg-c-text text-white border-c-text" : "bg-white text-c-text-2 border-border hover:bg-bg-2"}`}
          >
            {p.label}
          </button>
        ))}
        <div className="flex items-center gap-1.5 bg-white border border-border rounded-[var(--r-md)] px-3 py-1.5">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => {
              setCustomFrom(e.target.value);
              setUseCustom(true);
            }}
            className="text-[11px] text-c-text bg-transparent border-none outline-none cursor-pointer"
          />
          <span className="text-c-text-3 text-[11px]">—</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => {
              setCustomTo(e.target.value);
              setUseCustom(true);
            }}
            className="text-[11px] text-c-text bg-transparent border-none outline-none cursor-pointer"
          />
        </div>
        <button onClick={fetchAll} className="text-[11px] md:text-[12px] px-3 py-2 rounded-[var(--r-md)] border border-border text-c-text-2 hover:bg-bg-2 cursor-pointer bg-white transition-all">
          ↻ Tải lại
        </button>
        <span className="text-[11px] text-c-text-3 ml-auto hidden sm:block">
          {from} → {to}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-2 border border-border rounded-[var(--r-lg)] p-1 mb-5 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-[12px] font-semibold rounded-[var(--r-md)] transition-all cursor-pointer border-none
              ${activeTab === t.key ? "bg-white text-c-text shadow-sm" : "bg-transparent text-c-text-3 hover:text-c-text"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-c-text-3 text-[13px]">Đang tải...</div>
      ) : (
        <>
          {/* ── TAB: REVENUE ── */}
          {activeTab === "revenue" && revenue && (
            <div className="flex flex-col gap-4 md:gap-5">
              {/* Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
                {[
                  { label: "Tổng doanh thu", value: revenue.totalRevenue ? `${revenue.totalRevenue.toLocaleString("vi-VN")}k` : "0k", color: "text-c-amber" },
                  { label: "Khách hoàn thành", value: revenue.totalCustomers, color: "text-c-green" },
                  { label: "TB / khách", value: revenue.totalCustomers ? `${Math.round(revenue.totalRevenue / revenue.totalCustomers).toLocaleString("vi-VN")}k` : "—", color: "text-c-text" },
                  { label: "Số ngày", value: revenue.daily?.length || 0, color: "text-c-text-2" },
                ].map((s) => (
                  <div key={s.label} className="bg-white border border-border rounded-[var(--r-lg)] px-4 py-4">
                    <p className="label mb-1 text-[9px] md:text-[10.5px]">{s.label}</p>
                    <p className={`font-serif text-[22px] md:text-[28px] m-0 leading-none ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* By service + Daily — 2 cột trên desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-start">
                {/* By service */}
                {revenue.byService?.length > 0 && (
                  <div className="bg-white border border-border rounded-[var(--r-xl)] p-4 md:p-6">
                    <p className="label mb-4">Theo dịch vụ</p>
                    <div className="flex flex-col gap-6 items-center">
                      <PieChart data={revenue.byService} total={revenue.totalRevenue} percents={percents} />
                      <div className="flex flex-col gap-2 w-full">
                        {revenue.byService.map((s, idx) => (
                          <div key={s.service_name} className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                            <span className="text-[12px] text-c-text font-medium flex-1 truncate">{s.service_name}</span>
                            <span className="text-[11px] text-c-text-3 tabular-nums w-8 text-right">{percents[idx]}%</span>
                            <span className="text-[11px] font-semibold text-c-text tabular-nums w-20 text-right">{Number(s.revenue).toLocaleString("vi-VN")}k</span>
                            <span className="text-[11px] text-c-text-3 tabular-nums w-12 text-right">{s.count} lượt</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Daily table */}
                {revenue.daily?.length > 0 && (
                  <div className="bg-white border border-border rounded-[var(--r-xl)] overflow-hidden">
                    <div className="px-4 md:px-6 py-4 border-b border-border">
                      <p className="label m-0">Theo ngày</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[13px]">
                        <thead>
                          <tr className="border-b border-border bg-bg-2">
                            {["Ngày", "Khách", "Doanh thu", "TB / khách"].map((h) => (
                              <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-c-text-3 uppercase tracking-wide">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {revenue.daily.map((d) => (
                            <tr key={d.booking_date} className="border-b border-border hover:bg-bg-2 transition-colors">
                              <td className="px-5 py-3 font-medium text-c-text tabular-nums">{toVNDate(d.booking_date)}</td>
                              <td className="px-5 py-3 text-c-text-2 tabular-nums">{d.total_customers}</td>
                              <td className="px-5 py-3 font-semibold text-c-amber tabular-nums">{Number(d.revenue).toLocaleString("vi-VN")}k</td>
                              <td className="px-5 py-3 text-c-text-2 tabular-nums">{d.total_customers ? `${Math.round(d.revenue / d.total_customers).toLocaleString("vi-VN")}k` : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* By barber (admin only) */}
              {role === "admin" && barbers.length > 0 && (
                <div className="bg-white border border-border rounded-[var(--r-xl)] overflow-hidden">
                  <div className="px-4 md:px-6 py-4 border-b border-border">
                    <p className="label m-0">Hiệu suất thợ</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-border bg-bg-2">
                          {["Thợ", "Khách xong", "Tổng khách", "Doanh thu", "TB / lượt", "HH mặc định"].map((h) => (
                            <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-c-text-3 uppercase tracking-wide whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {barbers.map((b) => (
                          <tr key={b.barber_id} className="border-b border-border hover:bg-bg-2 transition-colors">
                            <td className="px-5 py-3 font-semibold text-c-text">{b.barber_name}</td>
                            <td className="px-5 py-3 text-c-green tabular-nums">{b.done_customers}</td>
                            <td className="px-5 py-3 text-c-text-2 tabular-nums">{b.total_customers}</td>
                            <td className="px-5 py-3 font-semibold text-c-amber tabular-nums">{Number(b.gross_revenue).toLocaleString("vi-VN")}k</td>
                            <td className="px-5 py-3 text-c-text-2 tabular-nums">{b.avg_service_minutes ? `${b.avg_service_minutes}p` : "—"}</td>
                            <td className="px-5 py-3 text-c-text-2 tabular-nums">{b.default_commission}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: SALARY ── */}
          {activeTab === "salary" && salary && (
            <div className="flex flex-col gap-4">
              {salary.salaries?.length === 0 ? (
                <div className="py-20 text-center text-c-text-3 text-[13px]">Không có dữ liệu kỳ này</div>
              ) : (
                salary.salaries?.map((b) => (
                  <div key={b.barber_id} className="bg-white border border-border rounded-[var(--r-xl)] overflow-hidden">
                    <button
                      onClick={() => setExpandedBarber(expandedBarber === b.barber_id ? null : b.barber_id)}
                      className="w-full px-4 md:px-6 py-4 flex items-center justify-between border-b border-border hover:bg-bg-2 transition-colors cursor-pointer bg-transparent text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="m-0 text-[14px] font-semibold text-c-text">{b.barber_name}</p>
                          <p className="m-0 text-[11px] text-c-text-3">
                            {b.total_customers} khách · {b.transactions?.length} lượt dịch vụ
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="m-0 text-[10px] text-c-text-3 uppercase tracking-wide">Doanh thu</p>
                          <p className="m-0 text-[14px] font-semibold text-c-amber tabular-nums">{Number(b.gross_revenue).toLocaleString("vi-VN")}k</p>
                        </div>
                        <div className="text-right">
                          <p className="m-0 text-[10px] text-c-text-3 uppercase tracking-wide">Hoa hồng</p>
                          <p className="m-0 text-[14px] font-bold text-c-green tabular-nums">{Number(b.total_commission).toLocaleString("vi-VN")}k</p>
                        </div>
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          viewBox="0 0 24 24"
                          className={`text-c-text-3 transition-transform ${expandedBarber === b.barber_id ? "rotate-180" : ""}`}
                        >
                          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>

                    {expandedBarber === b.barber_id && b.transactions?.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-[12px]">
                          <thead>
                            <tr className="border-b border-border bg-bg-2">
                              {["Ngày", "Khách", "Dịch vụ", "Giá", "HH%", "Hoa hồng"].map((h) => (
                                <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-c-text-3 uppercase tracking-wide whitespace-nowrap">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {b.transactions.map((t, i) => (
                              <tr key={i} className="border-b border-border hover:bg-bg-2 transition-colors">
                                <td className="px-4 py-2.5 text-c-text-3 tabular-nums">{t.date}</td>
                                <td className="px-4 py-2.5 text-c-text font-medium">{t.customer}</td>
                                <td className="px-4 py-2.5 text-c-text-2">{t.service}</td>
                                <td className="px-4 py-2.5 text-c-amber tabular-nums">{Number(t.price).toLocaleString("vi-VN")}k</td>
                                <td className="px-4 py-2.5 text-c-text-3 tabular-nums">{t.commission_percent}%</td>
                                <td className="px-4 py-2.5 text-c-green font-semibold tabular-nums">{Number(t.commission_amount).toLocaleString("vi-VN")}k</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-bg-2">
                              <td colSpan={3} className="px-4 py-2.5 text-[11px] font-semibold text-c-text-3 uppercase tracking-wide">
                                Tổng cộng
                              </td>
                              <td className="px-4 py-2.5 font-bold text-c-amber tabular-nums">{Number(b.gross_revenue).toLocaleString("vi-VN")}k</td>
                              <td />
                              <td className="px-4 py-2.5 font-bold text-c-green tabular-nums">{Number(b.total_commission).toLocaleString("vi-VN")}k</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── TAB: COMMISSIONS ── */}
          {activeTab === "commissions" && (
            <div className="flex flex-col gap-4">
              {role !== "admin" && <div className="bg-bg-2 border border-border rounded-[var(--r-md)] px-4 py-3 text-[12px] text-c-text-2">Chỉ xem — liên hệ admin để thay đổi hoa hồng.</div>}

              {Object.entries(commissionsByBarber).map(([barberId, data]) => (
                <div key={barberId} className="bg-white border border-border rounded-[var(--r-xl)] overflow-hidden">
                  <div className="px-4 md:px-6 py-4 border-b border-border flex items-center justify-between">
                    <p className="label m-0">{data.name}</p>
                    {role === "admin" && (
                      <button
                        onClick={() => setEditingCommission({ barber_id: parseInt(barberId), service_id: null, percent: "" })}
                        className="text-[11px] px-3 py-1.5 rounded-[var(--r-md)] border border-border text-c-text-2 hover:bg-bg-2 cursor-pointer bg-transparent transition-all"
                      >
                        + Thêm hoa hồng
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-border">
                    {data.items.map((c, i) => (
                      <div key={i} className="px-4 md:px-6 py-3 flex items-center justify-between">
                        <div>
                          <p className="m-0 text-[13px] font-medium text-c-text">{c.service_name || <span className="text-c-text-3 italic">Mặc định (tất cả dịch vụ)</span>}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[14px] font-bold text-c-green tabular-nums">{c.percent}%</span>
                          {role === "admin" && (
                            <button
                              onClick={() => setEditingCommission({ barber_id: c.barber_id, service_id: c.service_id, percent: c.percent })}
                              className="text-[10px] px-2 py-1 rounded-[var(--r-sm)] border border-border text-c-text-3 hover:bg-bg-2 cursor-pointer bg-transparent transition-all"
                            >
                              Sửa
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {Object.keys(commissionsByBarber).length === 0 && <div className="py-20 text-center text-c-text-3 text-[13px]">Chưa cấu hình hoa hồng nào</div>}
            </div>
          )}
        </>
      )}

      {/* ── Commission Edit Modal ── */}
      {editingCommission && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-[var(--r-xl)] border border-border w-full max-w-sm p-5 md:p-6">
            <p className="label mb-4">Chỉnh hoa hồng</p>
            <div className="flex flex-col gap-3 mb-4">
              <div>
                <label className="text-[10px] font-semibold text-c-text-3 uppercase tracking-wide block mb-1.5">Dịch vụ</label>
                <select
                  value={editingCommission.service_id ?? ""}
                  onChange={(e) => setEditingCommission((prev) => ({ ...prev, service_id: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full px-3 py-2.5 text-[13px] border border-border rounded-[var(--r-md)] bg-bg-2 text-c-text outline-none focus:border-border-2"
                >
                  <option value="">Mặc định (tất cả dịch vụ)</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-c-text-3 uppercase tracking-wide block mb-1.5">Hoa hồng (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={editingCommission.percent}
                  onChange={(e) => setEditingCommission((prev) => ({ ...prev, percent: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2.5 text-[13px] border border-border rounded-[var(--r-md)] bg-bg-2 text-c-text outline-none focus:border-border-2"
                  placeholder="VD: 40"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingCommission(null)}
                className="flex-1 py-2.5 rounded-[var(--r-md)] text-[13px] text-c-text-2 border border-border hover:bg-bg-2 cursor-pointer bg-white transition-all"
              >
                Huỷ
              </button>
              <button
                onClick={saveCommission}
                disabled={savingCommission}
                className="flex-1 py-2.5 rounded-[var(--r-md)] text-[13px] font-semibold text-white bg-c-text border-none hover:opacity-90 cursor-pointer transition-all disabled:opacity-50"
              >
                {savingCommission ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
