import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const persisted = window.localStorage.getItem("demo3-user");
    return persisted ? JSON.parse(persisted) : null;
  });

  useEffect(() => {
    if (user) {
      window.localStorage.setItem("demo3-user", JSON.stringify(user));
    } else {
      window.localStorage.removeItem("demo3-user");
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      login: (userData) => setUser(userData),
      logout: () => setUser(null)
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
