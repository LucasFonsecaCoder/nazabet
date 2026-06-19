import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [loggedUser, setLoggedUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("loggedUser");
    if (saved) setLoggedUser(JSON.parse(saved));
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
    <UserContext.Provider value={{ loggedUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
