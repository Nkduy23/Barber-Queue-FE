import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/minhbao-removebg-preview.png";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Icon components
const EyeIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đăng nhập thất bại");
        return;
      }
      localStorage.setItem("token", data.token);
      navigate("/admin");
    } catch {
      setError("Không kết nối được server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left: ảnh + overlay */}
      <div className="hidden md:flex flex-col justify-between relative overflow-hidden bg-neutral-900">
        <div className="flex-1 flex items-end justify-center pt-12 px-8">
          <img src={logo} alt="Baw Barber" className="w-full max-w-[420px] object-contain drop-shadow-2xl select-none" draggable={false} />
        </div>
        <div className="px-10 pb-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent pt-16">
          <div className="font-serif text-[30px] leading-tight text-white mb-1">Baw Men's Hair Designer</div>
          <p className="text-white/50 text-[13px] m-0 tracking-wide">Admin Dashboard</p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-8 bg-white min-h-screen md:min-h-0">
        <div className="w-full max-w-[340px]">
          {/* Nút quay về home */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] text-c-text-2 hover:text-c-text no-underline transition-colors mb-10 group">
            <ArrowLeftIcon />
            <span>Về trang chủ</span>
          </Link>

          <div className="mb-10">
            <p className="label mb-3">— Quản trị viên</p>
            <h1 className="font-serif text-[36px] text-c-text m-0">Đăng nhập</h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block label mb-2">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" className="input-field" required />
            </div>

            <div>
              <label className="block label mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-field pr-10" required />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-c-text-3 hover:text-c-text transition-colors bg-transparent border-none cursor-pointer p-0"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error && <div className="bg-red-bg border border-red-border rounded-[var(--r-md)] px-4 py-3 text-c-red text-[13px]">⚠️ {error}</div>}

            <button type="submit" disabled={loading} className="btn-primary justify-center mt-2 py-3 text-[14px]" style={{ opacity: loading ? 0.65 : 1 }}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
