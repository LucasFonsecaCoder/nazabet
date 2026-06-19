import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

// Rota que qualquer usuário logado pode acessar
export function PrivateRoute({ children }) {
  const { loggedUser } = useUser();
  if (!loggedUser) return <Navigate to="/login" />;
  return children;
}

// Rota exclusiva para admin
export function AdminRoute({ children }) {
  const { loggedUser } = useUser();
  if (!loggedUser) return <Navigate to="/login" />;
  if (!loggedUser.isAdmin) return <Navigate to="/" />;
  return children;
}
