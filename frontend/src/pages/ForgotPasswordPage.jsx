import { useState } from "react";
import { Link } from "react-router-dom";
import Notification from "../components/Notification.jsx";
import { authApi } from "../services/api.js";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("request");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);

    try {
      const { data } = await authApi.requestOtp({ email });
      setSuccess(data.message ?? "验证码已发送，请查收邮件");
      setStep("verify");
    } catch (err) {
      const message = err.response?.data?.message ?? "发送失败，请确认邮箱是否正确";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);

    try {
      const { data } = await authApi.verifyOtp({ email, code });
      setSuccess(data.message ?? "验证成功，重置链接已发送至邮箱");
      setStep("done");
    } catch (err) {
      const message = err.response?.data?.message ?? "验证码验证失败";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const { data } = await authApi.requestOtp({ email });
      setSuccess(data.message ?? "验证码已重新发送");
    } catch (err) {
      const message = err.response?.data?.message ?? "验证码发送失败，请稍后重试";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (step === "request") {
      return (
        <form onSubmit={handleRequestOtp}>
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
            {loading ? "发送中..." : "发送验证码"}
          </button>
        </form>
      );
    }

    if (step === "verify") {
      return (
        <form onSubmit={handleVerifyOtp}>
          <div>
            <label htmlFor="otp">输入验证码</label>
            <input
              id="otp"
              type="text"
              name="otp"
              placeholder="请输入邮箱收到的验证码"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "验证中..." : "验证验证码"}
          </button>
          <button type="button" className="link-button" onClick={handleResend} disabled={loading}>
            未收到验证码？重新发送
          </button>
        </form>
      );
    }

    return (
      <div>
        <p>验证码校验成功，请前往邮箱点击“重置密码”链接完成操作。</p>
        <Link className="link-button" to="/">
          返回登录
        </Link>
      </div>
    );
  };

  return (
    <div className="page">
      <div className="card">
        <h1>找回密码</h1>
        <Notification type="success" message={success} onClose={() => setSuccess("")} />
        <Notification type="error" message={error} onClose={() => setError("")} />

        {step !== "request" ? (
          <p style={{ marginBottom: "16px", fontSize: "14px", color: "#57606a" }}>
            验证邮件已发送到 <strong>{email}</strong>，请在 5 分钟内输入验证码。
          </p>
        ) : (
          <p style={{ marginBottom: "16px", fontSize: "14px", color: "#57606a" }}>
            输入注册邮箱，我们将发送六位验证码用于确认身份。
          </p>
        )}

        {renderForm()}

        <div className="link-row">
          <Link to="/">返回登录</Link>
          <Link to="/register">注册新账号</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
