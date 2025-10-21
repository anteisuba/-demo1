import { useState } from "react";
import { Link } from "react-router-dom";
import Notification from "../components/Notification.jsx";
import { authApi } from "../services/api.js";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);

    try {
      const { data } = await authApi.forgotPassword({ email });
      setSuccess(data.message ?? "重置链接已发送，请检查邮箱");
    } catch (err) {
      const message = err.response?.data?.message ?? "发送失败，请确认邮箱是否正确";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>找回密码</h1>
        <Notification type="success" message={success} onClose={() => setSuccess("")} />
        <Notification type="error" message={error} onClose={() => setError("")} />

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">注册邮箱</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="请输入注册邮箱"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "发送中..." : "发送重置链接"}
          </button>
        </form>

        <div className="link-row">
          <Link to="/">返回登录</Link>
          <Link to="/register">注册新账号</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
