import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Notification from "../components/Notification.jsx";
import { authApi } from "../services/api.js";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenError, setTokenError] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let ignore = false;

    async function validateToken() {
      if (!token) {
        setTokenError("重置链接无效或已过期");
        setValidating(false);
        return;
      }
      setTokenError("");
      setValidating(true);
      try {
        await authApi.validateResetToken(token);
        if (!ignore) {
          setTokenError("");
        }
      } catch (err) {
        if (!ignore) {
          const message = err.response?.data?.message ?? "重置链接无效或已过期";
          setTokenError(message);
        }
      } finally {
        if (!ignore) {
          setValidating(false);
        }
      }
    }

    validateToken();
    return () => {
      ignore = true;
    };
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setFieldErrors({});

    try {
      const payload = { ...form, token };
      const { data } = await authApi.resetPassword(payload);
      setMessage(data.message ?? "密码重置成功，请登录");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
      const text = err.response?.data?.message ?? "重置失败，请稍后重试";
      setTokenError(text);
    } finally {
      setLoading(false);
    }
  };

  const disabled = validating || Boolean(tokenError);

  return (
    <div className="page">
      <div className="card">
        <h1>重置密码</h1>
        <Notification type="success" message={message} onClose={() => setMessage("")} />
        <Notification type="error" message={tokenError} onClose={() => setTokenError("")} />

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password">新密码</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="请输入新密码"
              value={form.password}
              onChange={handleChange}
              required
              disabled={disabled}
            />
            {fieldErrors.password ? <small className="input-error">{fieldErrors.password}</small> : null}
          </div>
          <div>
            <label htmlFor="confirmPassword">确认新密码</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="请再次输入"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              disabled={disabled}
            />
            {fieldErrors.confirmPassword ? (
              <small className="input-error">{fieldErrors.confirmPassword}</small>
            ) : null}
          </div>
          <button type="submit" disabled={disabled || loading}>
            {loading ? "正在提交..." : "确认修改"}
          </button>
        </form>

        <div className="link-row">
          <Link to="/">返回登录</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
