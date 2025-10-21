import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../components/Notification.jsx";
import { authApi } from "../services/api.js";
import { useAuth } from "../state/AuthContext.jsx";

function LoginPage() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data } = await authApi.login(form);
      login(data.user);
      setSuccess(data.message ?? "登录成功");
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      const message = err.response?.data?.message ?? "登录失败，请检查用户名或密码";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>用户登录</h1>
        <Notification type="success" message={success} onClose={() => setSuccess("")} />
        <Notification type="error" message={error} onClose={() => setError("")} />

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="identifier">用户名 / 邮箱</label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              placeholder="请输入用户名或邮箱"
              value={form.identifier}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password">密码</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="请输入密码"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "正在登录..." : "登录"}
          </button>
        </form>

        <div className="link-row">
          <Link to="/register">立即注册</Link>
          <Link to="/forgot-password">忘记密码？</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
