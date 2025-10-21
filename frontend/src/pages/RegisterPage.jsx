import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../components/Notification.jsx";
import { authApi } from "../services/api.js";

const initialForm = {
  username: "",
  email: "",
  password: "",
  confirmPassword: ""
};

function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});
    setLoading(true);

    try {
      const { data } = await authApi.register(form);
      setSuccess(data.message ?? "注册成功，请使用账号登录");
      setTimeout(() => navigate("/"), 700);
    } catch (err) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
      const message = err.response?.data?.message ?? "注册失败，请稍后重试";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>用户注册</h1>
        <Notification type="success" message={success} onClose={() => setSuccess("")} />
        <Notification type="error" message={error} onClose={() => setError("")} />

        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="username">用户名</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="请输入用户名"
              value={form.username}
              onChange={handleChange}
              required
            />
            {fieldErrors.username ? <small className="input-error">{fieldErrors.username}</small> : null}
          </div>
          <div>
            <label htmlFor="email">邮箱</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="请输入邮箱"
              value={form.email}
              onChange={handleChange}
              required
            />
            {fieldErrors.email ? <small className="input-error">{fieldErrors.email}</small> : null}
          </div>
          <div>
            <label htmlFor="password">密码</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="请输入密码"
              value={form.password}
              onChange={handleChange}
              required
            />
            {fieldErrors.password ? <small className="input-error">{fieldErrors.password}</small> : null}
          </div>
          <div>
            <label htmlFor="confirmPassword">确认密码</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            {fieldErrors.confirmPassword ? (
              <small className="input-error">{fieldErrors.confirmPassword}</small>
            ) : null}
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "正在提交..." : "注册"}
          </button>
        </form>

        <div className="link-row">
          <Link to="/">返回登录</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
