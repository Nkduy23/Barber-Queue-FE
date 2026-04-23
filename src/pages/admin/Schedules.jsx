import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function todayVN() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
}

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-CA");
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" });
}

// Generate array of date strings [from, to]
function dateRange(from, to) {
  const dates = [];
  let cur = from;
  while (cur <= to) {
    dates.push(cur);
    cur = addDays(cur, 1);
  }
  return dates;
}

export default function Schedules() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const today = todayVN();

  // View: "week" = 7 days, "range" = custom
  const [viewMode, setViewMode] = useState("week");
  const [weekStart, setWeekStart] = useState(today);
  const [customFrom, setCustomFrom] = useState(today);
  const [customTo, setCustomTo] = useState(addDays(today, 6));

  const [scheduleRows, setScheduleRows] = useState([]); // flat rows from /range
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({}); // { "barberId-date": true }
  const [toast, setToast] = useState(null);

  // Edit note modal
  const [noteModal, setNoteModal] = useState(null); // { barber_id, barber_name, work_date, note, is_working }

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getRange = useCallback(() => {
    if (viewMode === "week") return { from: weekStart, to: addDays(weekStart, 6) };
    return { from: customFrom, to: customTo };
  }, [viewMode, weekStart, customFrom, customTo]);

  const fetchSchedules = useCallback(async () => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    setLoading(true);
    const { from, to } = getRange();
    try {
      const res = await fetch(`${API}/api/schedules/range?from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin/login");
        return;
      }
      const json = await res.json();
      setScheduleRows(
        (Array.isArray(json) ? json : []).map((r) => ({
          ...r,
          work_date: r.work_date ? new Date(r.work_date).toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }) : null,
        })),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, navigate, getRange]);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchSchedules();
  }, [fetchSchedules, token, navigate]);

  const patchSchedule = async (barber_id, work_date, is_working, note = "") => {
    const key = `${barber_id}-${work_date}`;
    setSaving((s) => ({ ...s, [key]: true }));
    try {
      const res = await fetch(`${API}/api/schedules`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ barber_id, work_date, is_working, note }),
      });
      if (!res.ok) {
        const j = await res.json();
        showToast(j.error || "Lỗi lưu", "err");
      } else {
        // Optimistic update
        setScheduleRows((rows) => rows.map((r) => (r.barber_id === barber_id && r.work_date === work_date ? { ...r, is_working, note } : r)));
      }
    } catch {
      showToast("Lỗi kết nối", "err");
    } finally {
      setSaving((s) => {
        const n = { ...s };
        delete n[key];
        return n;
      });
    }
  };

  const bulkPatch = async (is_working) => {
    const { from, to } = getRange();
    const dates = dateRange(from, to);
    const barberIds = [...new Set(scheduleRows.map((r) => r.barber_id))];
    if (!barberIds.length) return;

    setSaving({ bulk: true });
    try {
      for (const work_date of dates) {
        const res = await fetch(`${API}/api/schedules/bulk`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ work_date, barber_ids: barberIds, is_working, note: "" }),
        });
        if (!res.ok) {
          showToast("Lỗi bulk update", "err");
          setSaving({});
          return;
        }
      }
      showToast(is_working ? "✓ Đánh dấu tất cả đi làm" : "✓ Đánh dấu tất cả nghỉ");
      fetchSchedules();
    } catch {
      showToast("Lỗi kết nối", "err");
    } finally {
      setSaving({});
    }
  };

  const saveNoteModal = async () => {
    if (!noteModal) return;
    await patchSchedule(noteModal.barber_id, noteModal.work_date, noteModal.is_working, noteModal.note);
    setNoteModal(null);
  };

  const { from, to } = getRange();
  const dates = dateRange(from, to);

  // Build: barbers x dates grid
  const barberIds = [...new Set(scheduleRows.map((r) => r.barber_id))];
  // barber map: id → name
  const barberMap = {};
  scheduleRows.forEach((r) => {
    barberMap[r.barber_id] = r.name;
  });

  // schedule lookup: "barberId-date" → { is_working, note }
  const schedLookup = {};
  scheduleRows.forEach((r) => {
    if (!r.work_date) return;
    const dateKey = new Date(r.work_date).toLocaleDateString("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    schedLookup[`${r.barber_id}-${dateKey}`] = r;
  });
  // Summary: how many working per day
  const dayStats = {};
  dates.forEach((d) => {
    let working = 0;
    barberIds.forEach((bid) => {
      const row = schedLookup[`${bid}-${d}`];
      if (!row || row.is_working) working++;
    });
    dayStats[d] = working;
  });

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

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {/* Week nav */}
        {viewMode === "week" && (
          <div className="flex items-center gap-1 bg-white border border-border rounded-[var(--r-lg)] p-1">
            <button
              onClick={() => setWeekStart((d) => addDays(d, -7))}
              className="px-2.5 py-1.5 rounded-[var(--r-md)] text-c-text-2 hover:bg-bg-2 cursor-pointer border-none bg-transparent text-[13px]"
            >
              ‹
            </button>
            <span className="text-[12px] font-medium text-c-text px-1">
              {from} — {to}
            </span>
            <button
              onClick={() => setWeekStart((d) => addDays(d, 7))}
              className="px-2.5 py-1.5 rounded-[var(--r-md)] text-c-text-2 hover:bg-bg-2 cursor-pointer border-none bg-transparent text-[13px]"
            >
              ›
            </button>
          </div>
        )}

        <button
          onClick={() => {
            setWeekStart(today);
            setViewMode("week");
          }}
          className="text-[11px] px-3 py-2 rounded-[var(--r-md)] border border-border text-c-text-2 hover:bg-bg-2 cursor-pointer bg-white transition-all"
        >
          Tuần này
        </button>

        {/* Custom range */}
        <div className="flex items-center gap-1.5 bg-white border border-border rounded-[var(--r-md)] px-3 py-1.5">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => {
              setCustomFrom(e.target.value);
              setViewMode("range");
            }}
            className="text-[11px] text-c-text bg-transparent border-none outline-none cursor-pointer"
          />
          <span className="text-c-text-3 text-[11px]">—</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => {
              setCustomTo(e.target.value);
              setViewMode("range");
            }}
            className="text-[11px] text-c-text bg-transparent border-none outline-none cursor-pointer"
          />
        </div>

        <button onClick={fetchSchedules} className="text-[11px] px-3 py-2 rounded-[var(--r-md)] border border-border text-c-text-2 hover:bg-bg-2 cursor-pointer bg-white transition-all">
          ↻ Tải lại
        </button>

        {/* Bulk actions */}
        <div className="flex gap-1.5 ml-auto">
          <button
            onClick={() => bulkPatch(true)}
            disabled={!!saving.bulk}
            className="text-[11px] px-3 py-2 rounded-[var(--r-md)] border border-green-border text-c-green hover:bg-green-bg cursor-pointer bg-white transition-all disabled:opacity-50"
          >
            ✓ Tất cả đi làm
          </button>
          <button
            onClick={() => bulkPatch(false)}
            disabled={!!saving.bulk}
            className="text-[11px] px-3 py-2 rounded-[var(--r-md)] border border-red-border text-c-red hover:bg-red-bg cursor-pointer bg-white transition-all disabled:opacity-50"
          >
            ✗ Tất cả nghỉ
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-c-text-3 text-[13px]">Đang tải...</div>
      ) : barberIds.length === 0 ? (
        <div className="py-20 text-center text-c-text-3 text-[13px]">Không có thợ nào đang hoạt động</div>
      ) : (
        <>
          {/* ── Desktop Grid ── */}
          <div className="hidden md:block bg-white border border-border rounded-[var(--r-xl)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="bg-bg-2 border-b border-border">
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-c-text-3 uppercase tracking-wide w-[140px] sticky left-0 bg-bg-2">Thợ</th>
                    {dates.map((d) => (
                      <th key={d} className={`px-3 py-3 text-center min-w-[90px] ${d === today ? "bg-amber-50" : ""}`}>
                        <p className={`m-0 text-[10px] font-bold uppercase tracking-wide ${d === today ? "text-c-amber" : "text-c-text-3"}`}>{formatDayLabel(d)}</p>
                        <p className="m-0 text-[10px] text-c-text-3 mt-0.5">
                          {dayStats[d]}/{barberIds.length} làm
                        </p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {barberIds.map((bid) => (
                    <tr key={bid} className="border-b border-border hover:bg-bg-2/50 transition-colors">
                      <td className="px-5 py-3 font-semibold text-c-text sticky left-0 bg-white border-r border-border">{barberMap[bid]}</td>
                      {dates.map((d) => {
                        const key = `${bid}-${d}`;
                        const row = schedLookup[key];
                        const isWorking = !row || row.is_working;
                        const note = row?.note || "";
                        const isSaving = !!saving[key];

                        return (
                          <td key={d} className={`px-2 py-2 text-center ${d === today ? "bg-amber-50/30" : ""}`}>
                            <div className="flex flex-col items-center gap-1">
                              <button
                                onClick={() => patchSchedule(bid, d, !isWorking, note)}
                                disabled={isSaving}
                                className={`w-full px-2 py-1.5 rounded-[var(--r-md)] text-[10px] font-bold border transition-all cursor-pointer disabled:opacity-50
                                  ${isWorking ? "bg-green-bg border-green-border text-c-green hover:opacity-80" : "bg-red-bg border-red-border text-c-red hover:opacity-80"}`}
                              >
                                {isSaving ? "..." : isWorking ? "Làm" : "Nghỉ"}
                              </button>
                              {note && (
                                <span className="text-[9px] text-c-text-3 max-w-[80px] truncate" title={note}>
                                  {note}
                                </span>
                              )}
                              <button
                                onClick={() => setNoteModal({ barber_id: bid, barber_name: barberMap[bid], work_date: d, is_working: isWorking, note })}
                                className="text-[9px] text-c-text-3 hover:text-c-text cursor-pointer bg-transparent border-none px-1 py-0.5 transition-colors"
                                title="Ghi chú"
                              >
                                ✎
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile Card View ── */}
          <div className="md:hidden flex flex-col gap-3">
            {barberIds.map((bid) => (
              <div key={bid} className="bg-white border border-border rounded-[var(--r-xl)] overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="font-semibold text-c-text text-[14px] m-0">{barberMap[bid]}</p>
                </div>
                <div className="p-3 grid grid-cols-2 gap-2">
                  {dates.map((d) => {
                    const key = `${bid}-${d}`;
                    const row = schedLookup[key];
                    const isWorking = !row || row.is_working;
                    const note = row?.note || "";
                    const isSaving = !!saving[key];

                    return (
                      <div key={d} className={`border rounded-[var(--r-md)] p-2.5 ${d === today ? "border-amber-200 bg-amber-50" : "border-border"}`}>
                        <p className={`m-0 text-[10px] font-semibold mb-1.5 ${d === today ? "text-c-amber" : "text-c-text-3"}`}>{formatDayLabel(d)}</p>
                        <button
                          onClick={() => patchSchedule(bid, d, !isWorking, note)}
                          disabled={isSaving}
                          className={`w-full py-1.5 rounded-[var(--r-sm)] text-[10px] font-bold border transition-all cursor-pointer disabled:opacity-50
                            ${isWorking ? "bg-green-bg border-green-border text-c-green" : "bg-red-bg border-red-border text-c-red"}`}
                        >
                          {isSaving ? "..." : isWorking ? "✓ Làm" : "✗ Nghỉ"}
                        </button>
                        {note && <p className="m-0 text-[9px] text-c-text-3 mt-1 truncate">{note}</p>}
                        <button
                          onClick={() => setNoteModal({ barber_id: bid, barber_name: barberMap[bid], work_date: d, is_working: isWorking, note })}
                          className="text-[9px] text-c-text-3 hover:text-c-text cursor-pointer bg-transparent border-none p-0 mt-1 transition-colors"
                        >
                          + Ghi chú
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-green-bg border border-green-border" />
              <span className="text-[11px] text-c-text-3">Đi làm</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-red-bg border border-red-border" />
              <span className="text-[11px] text-c-text-3">Nghỉ</span>
            </div>
            <span className="text-[11px] text-c-text-3 ml-auto">Click ô để đổi trạng thái</span>
          </div>
        </>
      )}

      {/* ── Note Modal ── */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-[var(--r-xl)] border border-border w-full max-w-sm p-5 md:p-6">
            <p className="label mb-1">Ghi chú lịch làm</p>
            <p className="text-[12px] text-c-text-3 mb-4">
              {noteModal.barber_name} · {noteModal.work_date}
            </p>
            <div className="flex flex-col gap-3 mb-4">
              <div>
                <label className="text-[10px] font-semibold text-c-text-3 uppercase tracking-wide block mb-1.5">Trạng thái</label>
                <div className="flex gap-2">
                  {[
                    { v: true, label: "Đi làm" },
                    { v: false, label: "Nghỉ" },
                  ].map((opt) => (
                    <button
                      key={String(opt.v)}
                      onClick={() => setNoteModal((m) => ({ ...m, is_working: opt.v }))}
                      className={`flex-1 py-2 text-[12px] font-semibold rounded-[var(--r-md)] border transition-all cursor-pointer
                        ${
                          noteModal.is_working === opt.v
                            ? opt.v
                              ? "bg-green-bg border-green-border text-c-green"
                              : "bg-red-bg border-red-border text-c-red"
                            : "bg-white text-c-text-2 border-border hover:bg-bg-2"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-c-text-3 uppercase tracking-wide block mb-1.5">Ghi chú (tuỳ chọn)</label>
                <input
                  type="text"
                  value={noteModal.note}
                  onChange={(e) => setNoteModal((m) => ({ ...m, note: e.target.value }))}
                  placeholder="VD: Nghỉ ốm, về quê..."
                  className="w-full px-3 py-2.5 text-[13px] border border-border rounded-[var(--r-md)] bg-bg-2 text-c-text outline-none focus:border-border-2"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setNoteModal(null)}
                className="flex-1 py-2.5 rounded-[var(--r-md)] text-[13px] text-c-text-2 border border-border hover:bg-bg-2 cursor-pointer bg-white transition-all"
              >
                Huỷ
              </button>
              <button onClick={saveNoteModal} className="flex-1 py-2.5 rounded-[var(--r-md)] text-[13px] font-semibold text-white bg-c-text border-none hover:opacity-90 cursor-pointer transition-all">
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
