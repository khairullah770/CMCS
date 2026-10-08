"use client";
import { useEffect, useState } from "react";
import { Dashboard, Login } from "../components/ctms";

type SessionUser = {
  employeeId: string;
  email: string;
  password: string;
  name: string;
  firstName: string;
  role: string;
  department: string;
};
export default function Home() {
  const [user, setUser] = useState<SessionUser | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem("cmcsSession");
    if (saved) setUser(JSON.parse(saved));
  }, []);
  function login(next: SessionUser) {
    setUser(next);
    localStorage.setItem("cmcsSession", JSON.stringify(next));
  }
  function logout() {
    setUser(null);
    localStorage.removeItem("cmcsSession");
  }
  return user ? (
    <Dashboard user={user} onLogout={logout} />
  ) : (
    <Login onLogin={login} />
  );
}
