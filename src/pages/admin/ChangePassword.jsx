import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

const PasswordField = ({ label, field, placeholder, show, setShow, form, setForm }) => (
  <div>
    <label className="text-[10px] md:text-[11px] font-semibold text-c-text-3 uppercase tracking-wide block mb-1.5">{label}</label>

    <div className="relative">
      <input
        type={show[field] ? "text" : "password"}
        placeholder={placeholder}
        value={form[field + "Password"]}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            [`${field}Password`]: e.target.value,
          }))
        }
        className="input-field pr-10 text-[13px]"
      />

      <button type="button" onClick={() => setShow((s) => ({ ...s, [field]: !s[field] }))} className="absolute right-3 top-1/2 -translate-y-1/2">
        {show[field] ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  </div>
);

export default function ChangePassword() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return showToast("Vui lòng điền đầy đủ thông tin", "err");
    }
    if (form.newPassword.length < 6) {
      return showToast("Mật khẩu mới phải có ít nhất 6 ký tự", "err");
    }
    if (form.newPassword !== form.confirmPassword) {
      return showToast("Mật khẩu xác nhận không khớp", "err");
    }
    if (form.newPassword === form.currentPassword) {
      return showToast("Mật khẩu mới phải khác mật khẩu cũ", "err");
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/change-password`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Lỗi đổi mật khẩu", "err");
      } else {
        showToast("✓ Đổi mật khẩu thành công — Vui lòng đăng nhập lại");
        // Xoá token vì server đã revoke tất cả refresh tokens
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userRole");
          localStorage.removeItem("userId");
          localStorage.removeItem("barber_id");
          navigate("/admin/login");
        }, 2000);
      }
    } catch {
      showToast("Lỗi kết nối server", "err");
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.newPassword;
    if (!p) return null;
    if (p.length < 6) return { label: "Quá ngắn", color: "bg-c-red", width: "25%" };
    if (p.length < 8) return { label: "Yếu", color: "bg-c-amber", width: "50%" };
    if (!/[0-9]/.test(p) || !/[a-zA-Z]/.test(p)) return { label: "Trung bình", color: "bg-yellow-400", width: "65%" };
    if (p.length >= 10 && /[^a-zA-Z0-9]/.test(p)) return { label: "Rất mạnh", color: "bg-c-green", width: "100%" };
    return { label: "Mạnh", color: "bg-c-green", width: "85%" };
  })();

  return (
    <div className="max-w-md">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 left-4 md:left-auto md:right-5 z-50 px-5 py-3 rounded-[var(--r-md)] text-[13px] font-medium shadow-[var(--shadow-md)] animate-fade-in text-center md:text-left
            ${toast.type === "err" ? "bg-red-bg border border-red-border text-c-red" : "bg-green-bg border border-green-border text-c-green"}`}
        >
          {toast.msg}
        </div>
      )}

      {/* Form card */}
      <div className="bg-white border border-border rounded-[var(--r-xl)] p-5 md:p-7 flex flex-col gap-4">
        <div className="mb-1">
          <p className="label mb-1">Đổi mật khẩu</p>
          <p className="text-[12px] text-c-text-3 m-0">Sau khi đổi bạn sẽ được chuyển về trang đăng nhập</p>
        </div>
        <PasswordField label="Mật khẩu hiện tại" field="current" placeholder="••••••••" show={show} setShow={setShow} form={form} setForm={setForm} />{" "}
        <PasswordField label="Mật khẩu mới" field="new" placeholder="Tối thiểu 6 ký tự" show={show} setShow={setShow} form={form} setForm={setForm} /> {/* Strength bar */}
        {strength && (
          <div className="-mt-2">
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
            </div>
            <p className="text-[10px] text-c-text-3 mt-1">{strength.label}</p>
          </div>
        )}
        <PasswordField label="Xác nhận mật khẩu mới" field="confirm" placeholder="Nhập lại mật khẩu mới" show={show} setShow={setShow} form={form} setForm={setForm} /> {/* Match indicator */}
        {form.confirmPassword && (
          <p className={`-mt-2 text-[11px] ${form.newPassword === form.confirmPassword ? "text-c-green" : "text-c-red"}`}>
            {form.newPassword === form.confirmPassword ? "✓ Mật khẩu khớp" : "✗ Mật khẩu chưa khớp"}
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-[var(--r-md)] text-[13px] md:text-[14px] font-semibold text-white bg-c-text border-none hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 mt-1"
        >
          {loading ? "Đang xử lý..." : "Đổi mật khẩu →"}
        </button>
      </div>

      {/* Info box */}
      <div className="mt-4 bg-white border border-border rounded-[var(--r-xl)] px-5 py-4">
        <p className="label mb-2 text-[10px]">Lưu ý bảo mật</p>
        {["Mật khẩu phải có ít nhất 6 ký tự", "Sau khi đổi, tất cả thiết bị sẽ bị đăng xuất", "Không chia sẻ mật khẩu với người khác"].map((note) => (
          <div key={note} className="flex items-start gap-2 py-1.5 border-b border-border last:border-0">
            <span className="text-c-text-3 text-[12px] mt-0.5 flex-shrink-0">•</span>
            <p className="m-0 text-[11px] md:text-[12px] text-c-text-2">{note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
