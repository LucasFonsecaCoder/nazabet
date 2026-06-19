import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [loggedUser, setLoggedUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true); // Controla o carregamento inicial

  useEffect(() => {
    const saved = localStorage.getItem("loggedUser");
    if (saved) {
      try {
        setLoggedUser(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao ler usuário salvo", e);
        localStorage.removeItem("loggedUser");
      }
    }
    setIsInitializing(false); // Carregamento do localStorage finalizado
  }, []);

  function login(user) {
    setLoggedUser(user);
    localStorage.setItem("loggedUser", JSON.stringify(user));
  }

  function logout() {
    setLoggedUser(null);
    localStorage.removeItem("loggedUser");
  }

  return (
    <UserContext.Provider value={{ loggedUser, login, logout, isInitializing }}>
      {!isInitializing && children} 
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}