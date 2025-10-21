import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Notification from "../components/Notification.jsx";
import { userApi } from "../services/api.js";
import { useAuth } from "../state/AuthContext.jsx";

function DashboardPage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(user);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    async function fetchProfile() {
      if (!user?.username) {
        return;
      }
      try {
        const { data } = await userApi.fetchByIdentifier(user.username);
        if (!ignore) {
          setProfile(data);
        }
      } catch (err) {
        if (!ignore) {
          const message = err.response?.data?.message ?? "获取用户信息失败";
          setError(message);
        }
      }
    }

    fetchProfile();
    return () => {
      ignore = true;
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const createdAt = profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : "-";
  const updatedAt = profile?.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "-";

  return (
    <div className="page">
      <div className="card">
        <h1>控制台</h1>
        <Notification type="error" message={error} onClose={() => setError("")} />

        <p>
          <strong>当前用户：</strong>
          {profile?.username}
        </p>
        <p>
          <strong>邮箱：</strong>
          {profile?.email}
        </p>
        <p>
          <strong>创建时间：</strong>
          {createdAt}
        </p>
        <p>
          <strong>最近更新：</strong>
          {updatedAt}
        </p>

        <button type="button" onClick={handleLogout} style={{ marginTop: "24px" }}>
          退出登录
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;
