import { useState } from "react";
import Login from "./pages/Login";
import AdminPanel from "./pages/Admin";
import UserPanel from "./pages/User";

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) return <Login onLogin={setUser} />;
  if (user.role === "admin") return <AdminPanel user={user} onLogout={() => setUser(null)} />;
  return <UserPanel user={user} onLogout={() => setUser(null)} />;
}
