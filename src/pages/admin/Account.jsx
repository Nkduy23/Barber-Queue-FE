import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Validate username: chỉ a-z, 0-9, _, - ; tối thiểu 3 ký tự ──
function validateUsername(val) {
  if (!val) return "Vui lòng nhập username";
  if (val.length < 3) return "Tối thiểu 3 ký tự";

  // Nếu có ký tự ngoài a-z 0-9 _ -
  if (!/^[a-z0-9_-]+$/.test(val)) {
    return "Chỉ dùng a-z, 0-9, _ hoặc - (không dấu, không khoảng trắng)";
  }

  return null;
}

// ── Icons ─────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// ── Reusable ──────────────────────────────────────────────────
function PasswordField({ label, placeholder, value, onChange, show, onToggle }) {
  return (
    <div>
      <label className="text-[10px] md:text-[11px] font-semibold text-c-text-3 uppercase tracking-wide block mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2.5 text-[13px] border border-border rounded-[var(--r-md)] bg-bg-2 text-c-text outline-none focus:border-border-2 transition-colors pr-10"
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-c-text-3 hover:text-c-text transition-colors bg-transparent border-none cursor-pointer p-0">
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 md:px-4 py-2 text-[12px] md:text-[13px] font-semibold rounded-[var(--r-md)] border transition-all cursor-pointer whitespace-nowrap
        ${active ? "bg-c-text text-white border-c-text" : "bg-white text-c-text-2 border-border hover:border-border-2 hover:bg-bg-2"}`}
    >
      {children}
    </button>
  );
}

const inputClass = "w-full px-3 py-2.5 text-[13px] border border-border rounded-[var(--r-md)] bg-bg-2 text-c-text outline-none focus:border-border-2 transition-colors";

// ════════════════════════════════════════════════════════════
export default function Account() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const myRole = localStorage.getItem("userRole") || "barber";
  const myId = parseInt(localStorage.getItem("userId") || "0");

  const [tab, setTab] = useState("password");
  const [toast, setToast] = useState(null);

  // Shared barbers state — dùng cả tab Users lẫn tab Thợ
  const [barbers, setBarbers] = useState([]);

  // ── Change password ────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwShow, setPwShow] = useState({ current: false, new: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);

  // ── User management ────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "barber", barber_id: "" });
  const [usernameError, setUsernameError] = useState(null);
  const [newPwShow, setNewPwShow] = useState(false);
  const [creating, setCreating] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState(null);

  // ── Barber management ──────────────────────────────────────
  const [barbersLoading, setBarbersLoading] = useState(false);
  const [newBarber, setNewBarber] = useState({ name: "", default_commission: 60 });
  const [creatingBarber, setCreatingBarber] = useState(false);
  const [togglingBarberId, setTogglingBarberId] = useState(null);
  const [editingBarber, setEditingBarber] = useState(null);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch barbers (shared, gọi khi tab Thợ hoặc khi cần sync dropdown) ──
  const fetchBarbers = useCallback(async () => {
    setBarbersLoading(true);
    try {
      const res = await fetch(`${API}/api/barbers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setBarbers(await res.json());
    } catch {
    } finally {
      setBarbersLoading(false);
    }
  }, [token]);

  // ── Fetch users ────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin/login");
        return;
      }
      if (res.ok) setUsers(await res.json());
    } catch {
    } finally {
      setUsersLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    if (myRole === "admin") {
      fetchUsers();
      fetchBarbers();
    }
  }, [token, navigate, myRole, fetchUsers, fetchBarbers]);

  // ── Password strength ──────────────────────────────────────
  const strength = (() => {
    const p = pwForm.newPassword;
    if (!p) return null;
    if (p.length < 6) return { label: "Quá ngắn", color: "bg-c-red", width: "25%" };
    if (p.length < 8) return { label: "Yếu", color: "bg-c-amber", width: "50%" };
    if (!/[0-9]/.test(p) || !/[a-zA-Z]/.test(p)) return { label: "Trung bình", color: "bg-yellow-400", width: "65%" };
    if (p.length >= 10 && /[^a-zA-Z0-9]/.test(p)) return { label: "Rất mạnh", color: "bg-c-green", width: "100%" };
    return { label: "Mạnh", color: "bg-c-green", width: "85%" };
  })();

  // ── Handlers ──────────────────────────────────────────────

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) return showToast("Vui lòng điền đầy đủ thông tin", "err");
    if (pwForm.newPassword.length < 6) return showToast("Mật khẩu mới phải có ít nhất 6 ký tự", "err");
    if (pwForm.newPassword !== pwForm.confirmPassword) return showToast("Mật khẩu xác nhận không khớp", "err");
    if (pwForm.newPassword === pwForm.currentPassword) return showToast("Mật khẩu mới phải khác mật khẩu cũ", "err");
    setPwLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/change-password`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) showToast(data.error || "Lỗi đổi mật khẩu", "err");
      else {
        showToast("✓ Đổi mật khẩu thành công — Vui lòng đăng nhập lại");
        setTimeout(() => {
          ["token", "refreshToken", "userRole", "userId", "barber_id"].forEach((k) => localStorage.removeItem(k));
          navigate("/admin/login");
        }, 2000);
      }
    } catch {
      showToast("Lỗi kết nối server", "err");
    } finally {
      setPwLoading(false);
    }
  };

  const handleCreateUser = async () => {
    const err = validateUsername(newUser.username);
    if (err) return showToast(err, "err");
    if (!newUser.password.trim()) return showToast("Vui lòng nhập mật khẩu", "err");
    if (newUser.password.length < 6) return showToast("Mật khẩu phải có ít nhất 6 ký tự", "err");
    setCreating(true);
    try {
      const res = await fetch(`${API}/api/auth/users`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUser.username,
          password: newUser.password,
          role: newUser.role,
          barber_id: newUser.barber_id ? parseInt(newUser.barber_id) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) showToast(data.error || "Lỗi tạo tài khoản", "err");
      else {
        showToast(`✓ Đã tạo tài khoản "${newUser.username}"`);
        setNewUser({ username: "", password: "", role: "barber", barber_id: "" });
        setUsernameError(null);
        fetchUsers();
        fetchBarbers(); // sync lại has_account trong dropdown
      }
    } catch {
      showToast("Lỗi kết nối server", "err");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleUser = async (u) => {
    const action = u.is_active ? "khóa" : "mở khóa";
    if (!window.confirm(`${u.is_active ? "Khóa" : "Mở khóa"} tài khoản "${u.username}"?`)) return;
    setTogglingUserId(u.id);
    try {
      const res = await fetch(`${API}/api/auth/users/${u.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !u.is_active }),
      });
      const data = await res.json();
      if (!res.ok) showToast(data.error || "Lỗi cập nhật", "err");
      else {
        showToast(`✓ Đã ${action} tài khoản "${u.username}"`);
        fetchUsers();
      }
    } catch {
      showToast("Lỗi kết nối server", "err");
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleCreateBarber = async () => {
    if (!newBarber.name.trim()) return showToast("Vui lòng nhập tên thợ", "err");
    setCreatingBarber(true);
    try {
      const res = await fetch(`${API}/api/barbers`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBarber.name.trim(), default_commission: newBarber.default_commission }),
      });
      const data = await res.json();
      if (!res.ok) showToast(data.error || "Lỗi tạo thợ", "err");
      else {
        showToast(`✓ Đã thêm thợ "${data.name}"`);
        setNewBarber({ name: "", default_commission: 60 });
        fetchBarbers();
      }
    } catch {
      showToast("Lỗi kết nối server", "err");
    } finally {
      setCreatingBarber(false);
    }
  };

  const handleToggleBarber = async (b) => {
    setTogglingBarberId(b.id);
    try {
      const res = await fetch(`${API}/api/barbers/${b.id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) showToast(data.error || "Lỗi cập nhật", "err");
      else {
        showToast(`✓ Thợ "${data.name}" ${data.is_active ? "đang hiển thị" : "đã ẩn"}`);
        fetchBarbers();
      }
    } catch {
      showToast("Lỗi kết nối server", "err");
    } finally {
      setTogglingBarberId(null);
    }
  };

  const handleEditBarber = async () => {
    if (!editingBarber?.name.trim()) return showToast("Tên không được để trống", "err");
    try {
      const res = await fetch(`${API}/api/barbers/${editingBarber.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingBarber.name.trim(),
          default_commission: editingBarber.default_commission,
        }),
      });
      const data = await res.json();
      if (!res.ok) showToast(data.error || "Lỗi cập nhật", "err");
      else {
        showToast(`✓ Đã đổi tên thành "${data.name}"`);
        setEditingBarber(null);
        fetchBarbers();
      }
    } catch {
      showToast("Lỗi kết nối server", "err");
    }
  };

  const availableBarbers = barbers.filter((b) => b.is_active);

  return (
    <div className="max-w-2xl">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 left-4 md:left-auto md:right-5 z-50 px-5 py-3 rounded-[var(--r-md)] text-[13px] font-medium shadow-[var(--shadow-md)] animate-fade-in text-center md:text-left
            ${toast.type === "err" ? "bg-red-bg border border-red-border text-c-red" : "bg-green-bg border border-green-border text-c-green"}`}
        >
          {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 md:mb-5 overflow-x-auto pb-1">
        <TabBtn active={tab === "password"} onClick={() => setTab("password")}>
          🔑 Mật khẩu
        </TabBtn>
        {myRole === "admin" && (
          <>
            <TabBtn active={tab === "users"} onClick={() => setTab("users")}>
              👥 Tài khoản
            </TabBtn>
            <TabBtn active={tab === "barbers"} onClick={() => setTab("barbers")}>
              ✂️ Thợ
            </TabBtn>
          </>
        )}
      </div>

      {/* ══ Tab: Đổi mật khẩu ══ */}
      {tab === "password" && (
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-border rounded-[var(--r-xl)] p-5 md:p-7 flex flex-col gap-4">
            <div className="mb-1">
              <p className="label mb-1">Đổi mật khẩu</p>
              <p className="text-[12px] text-c-text-3 m-0">Sau khi đổi bạn sẽ được chuyển về trang đăng nhập</p>
            </div>
            <PasswordField
              label="Mật khẩu hiện tại"
              placeholder="••••••••"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
              show={pwShow.current}
              onToggle={() => setPwShow((s) => ({ ...s, current: !s.current }))}
            />
            <PasswordField
              label="Mật khẩu mới"
              placeholder="Tối thiểu 6 ký tự"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
              show={pwShow.new}
              onToggle={() => setPwShow((s) => ({ ...s, new: !s.new }))}
            />
            {strength && (
              <div className="-mt-2">
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                </div>
                <p className="text-[10px] text-c-text-3 mt-1">{strength.label}</p>
              </div>
            )}
            <PasswordField
              label="Xác nhận mật khẩu mới"
              placeholder="Nhập lại mật khẩu mới"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              show={pwShow.confirm}
              onToggle={() => setPwShow((s) => ({ ...s, confirm: !s.confirm }))}
            />
            {pwForm.confirmPassword && (
              <p className={`-mt-2 text-[11px] ${pwForm.newPassword === pwForm.confirmPassword ? "text-c-green" : "text-c-red"}`}>
                {pwForm.newPassword === pwForm.confirmPassword ? "✓ Mật khẩu khớp" : "✗ Mật khẩu chưa khớp"}
              </p>
            )}
            <button
              onClick={handleChangePassword}
              disabled={pwLoading}
              className="w-full py-3 rounded-[var(--r-md)] text-[13px] md:text-[14px] font-semibold text-white bg-c-text border-none hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 mt-1"
            >
              {pwLoading ? "Đang xử lý..." : "Đổi mật khẩu →"}
            </button>
          </div>
          <div className="bg-white border border-border rounded-[var(--r-xl)] px-5 py-4">
            <p className="label mb-2 text-[10px]">Lưu ý bảo mật</p>
            {["Mật khẩu phải có ít nhất 6 ký tự", "Sau khi đổi, tất cả thiết bị sẽ bị đăng xuất", "Không chia sẻ mật khẩu với người khác"].map((note) => (
              <div key={note} className="flex items-start gap-2 py-1.5 border-b border-border last:border-0">
                <span className="text-c-text-3 text-[12px] mt-0.5 flex-shrink-0">•</span>
                <p className="m-0 text-[11px] md:text-[12px] text-c-text-2">{note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ Tab: Tài khoản ══ */}
      {tab === "users" && myRole === "admin" && (
        <div className="flex flex-col gap-4 md:gap-5">
          {/* Tạo tài khoản */}
          <div className="bg-white border border-border rounded-[var(--r-xl)] p-5 md:p-6">
            <p className="label mb-1">Tạo tài khoản mới</p>
            <p className="text-[12px] text-c-text-3 m-0 mb-4">Tạo cho admin hoặc thợ cắt</p>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] md:text-[11px] font-semibold text-c-text-3 uppercase tracking-wide block mb-1.5">Username</label>
                  <input
                    type="text"
                    placeholder="vd: barber_hai"
                    value={newUser.username}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewUser((u) => ({ ...u, username: val }));
                      setUsernameError(validateUsername(val));
                    }}
                    className={`${inputClass} ${usernameError && newUser.username ? "border-red-border" : ""}`}
                  />
                  {newUser.username && <p className={`text-[10px] mt-1 ${usernameError ? "text-c-red" : "text-c-green"}`}>{usernameError || "✓ Hợp lệ"}</p>}
                </div>
                <div>
                  <label className="text-[10px] md:text-[11px] font-semibold text-c-text-3 uppercase tracking-wide block mb-1.5">Vai trò</label>
                  <select value={newUser.role} onChange={(e) => setNewUser((u) => ({ ...u, role: e.target.value }))} className={inputClass}>
                    <option value="barber">Thợ cắt</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] md:text-[11px] font-semibold text-c-text-3 uppercase tracking-wide block mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={newPwShow ? "text" : "password"}
                    placeholder="Tối thiểu 6 ký tự"
                    value={newUser.password}
                    onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))}
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setNewPwShow((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-c-text-3 hover:text-c-text transition-colors bg-transparent border-none cursor-pointer p-0"
                  >
                    {newPwShow ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {newUser.role === "barber" && (
                <div>
                  <label className="text-[10px] md:text-[11px] font-semibold text-c-text-3 uppercase tracking-wide block mb-1.5">
                    Gắn với thợ <span className="font-normal text-c-text-3">(tùy chọn)</span>
                  </label>
                  <select value={newUser.barber_id} onChange={(e) => setNewUser((u) => ({ ...u, barber_id: e.target.value }))} className={inputClass}>
                    <option value="">-- Chưa gắn --</option>
                    {availableBarbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                        {b.has_account ? " ✓ đã có TK" : ""}
                      </option>
                    ))}
                  </select>
                  {availableBarbers.length === 0 && (
                    <p className="text-[11px] text-c-amber mt-1.5">
                      Chưa có thợ nào —{" "}
                      <button onClick={() => setTab("barbers")} className="underline cursor-pointer bg-transparent border-none p-0 text-c-amber font-semibold">
                        thêm thợ trước
                      </button>
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={handleCreateUser}
                disabled={creating}
                className="w-full py-2.5 rounded-[var(--r-md)] text-[13px] font-semibold text-white bg-c-text border-none hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {creating ? "Đang tạo..." : "+ Tạo tài khoản"}
              </button>
            </div>
          </div>

          {/* Danh sách users */}
          <div className="bg-white border border-border rounded-[var(--r-xl)] p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="label m-0">
                Danh sách tài khoản <span className="text-c-text-3 font-normal text-[11px]">({users.length})</span>
              </p>
              <button
                onClick={fetchUsers}
                className="text-[10px] md:text-[11px] px-2.5 py-1 rounded-[var(--r-sm)] border border-border text-c-text-3 hover:bg-bg-2 cursor-pointer bg-transparent transition-all"
              >
                ↻ Làm mới
              </button>
            </div>
            {usersLoading ? (
              <div className="py-6 text-center text-c-text-3 text-[13px]">Đang tải...</div>
            ) : users.length === 0 ? (
              <div className="py-6 text-center text-c-text-3 text-[13px]">Chưa có tài khoản nào</div>
            ) : (
              <div className="divide-y divide-border">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-3 gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="m-0 text-[13px] font-semibold text-c-text">{u.username}</p>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0
                          ${u.role === "admin" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}
                        >
                          {u.role === "admin" ? "Admin" : "Thợ"}
                        </span>
                        {!u.is_active && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-bg text-c-red border border-red-border flex-shrink-0">Đã khóa</span>}
                      </div>
                      <p className="m-0 text-[11px] text-c-text-3 mt-0.5">
                        {u.barber_name ? `✂️ ${u.barber_name}` : "Chưa gắn thợ"}
                        {" · "}
                        {new Date(u.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    {u.id === myId ? (
                      <span className="text-[10px] text-c-text-3 flex-shrink-0 px-2 py-1 bg-bg-2 rounded-[var(--r-sm)] border border-border">Bạn</span>
                    ) : (
                      <button
                        onClick={() => handleToggleUser(u)}
                        disabled={togglingUserId === u.id}
                        className={`flex-shrink-0 px-2.5 py-1.5 rounded-[var(--r-md)] text-[11px] font-semibold border transition-all cursor-pointer disabled:opacity-50
                          ${u.is_active ? "text-c-amber bg-amber-50 border-amber-200 hover:bg-amber-100" : "text-c-green bg-green-bg border-green-border hover:opacity-80"}`}
                      >
                        {togglingUserId === u.id ? "..." : u.is_active ? "Khóa" : "Mở khóa"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ Tab: Thợ ══ */}
      {tab === "barbers" && myRole === "admin" && (
        <div className="flex flex-col gap-4 md:gap-5">
          {/* Form thêm thợ */}
          <div className="bg-white border border-border rounded-[var(--r-xl)] p-5 md:p-6">
            <p className="label mb-1">Thêm thợ mới</p>
            <p className="text-[12px] text-c-text-3 m-0 mb-4">Sau khi thêm, sang tab Tài khoản để tạo login và gắn cho thợ</p>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-[1fr_90px] gap-3">
                <div>
                  <label className="text-[10px] md:text-[11px] font-semibold text-c-text-3 uppercase tracking-wide block mb-1.5">Tên thợ</label>
                  <input
                    type="text"
                    placeholder="vd: Nguyễn Văn A"
                    value={newBarber.name}
                    onChange={(e) => setNewBarber((b) => ({ ...b, name: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateBarber()}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-[10px] md:text-[11px] font-semibold text-c-text-3 uppercase tracking-wide block mb-1.5">Hoa hồng</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newBarber.default_commission}
                      onChange={(e) => setNewBarber((b) => ({ ...b, default_commission: parseInt(e.target.value) || 60 }))}
                      className={inputClass}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-c-text-3">%</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCreateBarber}
                disabled={creatingBarber}
                className="w-full py-2.5 rounded-[var(--r-md)] text-[13px] font-semibold text-white bg-c-text border-none hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {creatingBarber ? "Đang thêm..." : "+ Thêm thợ"}
              </button>
            </div>
          </div>

          {/* Danh sách thợ */}
          <div className="bg-white border border-border rounded-[var(--r-xl)] p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="label m-0">
                Danh sách thợ <span className="text-c-text-3 font-normal text-[11px]">({barbers.length})</span>
              </p>
              <button
                onClick={fetchBarbers}
                className="text-[10px] md:text-[11px] px-2.5 py-1 rounded-[var(--r-sm)] border border-border text-c-text-3 hover:bg-bg-2 cursor-pointer bg-transparent transition-all"
              >
                ↻ Làm mới
              </button>
            </div>
            {barbersLoading ? (
              <div className="py-6 text-center text-c-text-3 text-[13px]">Đang tải...</div>
            ) : barbers.length === 0 ? (
              <div className="py-6 text-center text-c-text-3 text-[13px]">Chưa có thợ nào</div>
            ) : (
              <div className="divide-y divide-border">
                {barbers.map((b) => (
                  <div key={b.id} className="py-3">
                    {editingBarber?.id === b.id ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={editingBarber.name}
                            autoFocus
                            onChange={(e) => setEditingBarber((eb) => ({ ...eb, name: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEditBarber();
                              if (e.key === "Escape") setEditingBarber(null);
                            }}
                            className={`${inputClass} flex-1`}
                            placeholder="Tên thợ"
                          />
                          <div className="relative w-24 flex-shrink-0">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editingBarber.default_commission}
                              onChange={(e) => setEditingBarber((eb) => ({ ...eb, default_commission: parseInt(e.target.value) || 0 }))}
                              className={inputClass}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-c-text-3">%</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleEditBarber}
                            className="px-3 py-2 text-[12px] font-semibold text-white bg-c-text rounded-[var(--r-md)] border-none cursor-pointer hover:opacity-90 flex-shrink-0"
                          >
                            Lưu
                          </button>
                          <button
                            onClick={() => setEditingBarber(null)}
                            className="px-3 py-2 text-[12px] font-semibold text-c-text-3 bg-bg-2 rounded-[var(--r-md)] border border-border cursor-pointer hover:bg-white flex-shrink-0"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-semibold text-c-text">{b.name}</span>
                            {!b.is_active && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-bg-2 text-c-text-3 border border-border flex-shrink-0">Đã ẩn</span>}
                            {b.has_account ? (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">@{b.account_username}</span>
                            ) : (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-bg-2 text-c-text-3 border border-border flex-shrink-0">Chưa có TK</span>
                            )}
                          </div>
                          <p className="m-0 text-[11px] text-c-text-3 mt-0.5">
                            Hoa hồng: <span className="font-semibold text-c-text">{b.default_commission}%</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => setEditingBarber({ id: b.id, name: b.name, default_commission: b.default_commission })}
                            className="p-1.5 rounded-[var(--r-sm)] text-c-text-3 hover:text-c-text hover:bg-bg-2 border border-transparent hover:border-border transition-all cursor-pointer bg-transparent"
                            title="Sửa tên"
                          >
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleToggleBarber(b)}
                            disabled={togglingBarberId === b.id}
                            className={`px-2.5 py-1.5 rounded-[var(--r-md)] text-[11px] font-semibold border transition-all cursor-pointer disabled:opacity-50
                              ${b.is_active ? "text-c-text-3 bg-bg-2 border-border hover:border-border-2" : "text-c-green bg-green-bg border-green-border hover:opacity-80"}`}
                          >
                            {togglingBarberId === b.id ? "..." : b.is_active ? "Ẩn" : "Hiện"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Flow hint */}
          <div className="bg-white border border-border rounded-[var(--r-xl)] px-5 py-4">
            <p className="label mb-2 text-[10px]">Flow khuyến nghị</p>
            {[
              { step: "1", text: "Thêm thợ ở tab này trước" },
              { step: "2", text: "Sang tab Tài khoản → Tạo tài khoản → Gắn với thợ vừa tạo" },
              { step: "3", text: "Thợ dùng tài khoản đó để đăng nhập xem lịch công việc" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3 py-1.5 border-b border-border last:border-0">
                <span className="w-5 h-5 rounded-full bg-c-text text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{item.step}</span>
                <p className="m-0 text-[11px] md:text-[12px] text-c-text-2">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
