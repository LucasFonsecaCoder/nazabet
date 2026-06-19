import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [loggedUser, setLoggedUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

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
    setIsInitializing(false);
  }, []);

  function login(user) {
    setLoggedUser(user);
    localStorage.setItem("loggedUser", JSON.stringify(user));
  }

  function logout() {
    setLoggedUser(null);
    localStorage.removeItem("loggedUser");
  }

  // Se estiver inicializando, renderiza um loader ou nada.
  // Isso evita que componentes filhos tentem ler loggedUser antes da hora.
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ loggedUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de um UserProvider");
  }
  return context;
}