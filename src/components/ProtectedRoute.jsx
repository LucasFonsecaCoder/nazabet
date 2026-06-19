import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export function PrivateRoute({ children }) {
  const { loggedUser, isInitializing } = useUser();
  
  // Se ainda estiver carregando do localStorage, não redirecione ainda
  if (isInitializing) return null; 
  
  // Se finalizou o carregamento e não tem usuário, manda pro login
  if (!loggedUser) return <Navigate to="/login" replace />;
  
  return children;
}

export function AdminRoute({ children }) {
  const { loggedUser, isInitializing } = useUser();
  
  if (isInitializing) return null;
  if (!loggedUser) return <Navigate to="/login" replace />;
  if (!loggedUser.isAdmin) return <Navigate to="/dashboard" replace />;
  
  return children;
}