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
    <div className="auth-layout">
      <aside className="auth-hero">
        <div className="auth-hero__header">
          <span className="auth-badge">欢迎回来</span>
          <h1>
            统一账户登录，
            <br />
            即刻继续你的工作
          </h1>
          <p>使用同一套凭证访问系统所有模块，支持桌面与移动端安全登录。</p>
        </div>
        <div className="auth-hero__cards">
          <div className="auth-feature-card">
            <strong>多端同步</strong>
            <p>一次登录，网页与移动应用实时同步，保持工作连续性。</p>
          </div>
          <div className="auth-feature-card">
            <strong>企业级安全</strong>
            <p>支持邮件、短信找回密码，后续可扩展多因素认证。</p>
          </div>
        </div>
      </aside>

      <main className="auth-panel">
        <div className="auth-panel__inner">
          <div className="auth-panel__header">
            <h2>登录账号</h2>
            <p>请输入您的用户名或邮箱继续使用服务</p>
          </div>

          <Notification type="success" message={success} onClose={() => setSuccess("")} />
          <Notification type="error" message={error} onClose={() => setError("")} />

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__field">
              <label htmlFor="identifier">用户名 / 邮箱</label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                placeholder="例如：alice 或 alice@example.com"
                value={form.identifier}
                onChange={handleChange}
                required
              />
            </div>
            <div className="auth-form__field">
              <div className="auth-form__label-row">
                <label htmlFor="password">密码</label>
                <Link to="/forgot-password">忘记密码？</Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="请输入登录密码"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button className="auth-form__submit" type="submit" disabled={loading}>
              {loading ? "正在登录..." : "登录"}
            </button>
          </form>

          <div className="auth-panel__footer">
            还没有账号？
            <Link to="/register">立即注册</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
