import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen bg-bg-2 grid grid-cols-1 md:grid-cols-2">
      {/* Left: photo */}
      <div
        className="hidden md:flex flex-col justify-end p-12 relative bg-cover bg-center rounded-r-none"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80)" }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10">
          <div className="font-serif text-[34px] text-white mb-1">MinhBao</div>
          <p className="text-white/40 text-[13px] m-0">Admin Dashboard</p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[340px]">
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
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-field" required />
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
