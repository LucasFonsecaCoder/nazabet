import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Login() {
  const [query, setQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true); // Adicionado estado de carregamento
  const { login } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const snap = await getDocs(collection(db, "users"));
        setAllUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  function handleInput(e) {
    const val = e.target.value;
    setQuery(val);
    if (val.length < 2) {
      setSuggestions([]);
      return;
    }
    setSuggestions(
      allUsers.filter((u) => u.name.toLowerCase().includes(val.toLowerCase()))
    );
  }

  function handleSelect(user) {
    login(user);
    // Redirecionamento baseado na flag isAdmin
    navigate(user.isAdmin ? "/admin/users" : "/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8">
        
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏀</div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">NazaBet</h1>
          <p className="text-gray-500 font-medium mt-2">Bem-vindo!</p>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-4">Carregando lista...</p>
        ) : (
          <>
            <div className="relative mb-6">
              <input
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                placeholder="Digite seu nome..."
                value={query}
                onChange={handleInput}
                autoFocus
              />
            </div>

            {suggestions.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                {suggestions.map((u) => (
                  <button
                    key={u.id}
                    className="w-full text-left px-5 py-4 hover:bg-blue-50 transition-colors flex items-center justify-between border-b border-gray-50 last:border-0"
                    onClick={() => handleSelect(u)}
                  >
                    <span className="font-bold text-gray-800">{u.name}</span>
                    {u.isAdmin && (
                      <span className="text-[10px] uppercase tracking-widest bg-red-100 text-red-600 px-2 py-0.5 rounded-md font-bold">
                        Admin
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {query.length >= 2 && suggestions.length === 0 && (
              <p className="text-sm text-gray-400 text-center mt-2">
                Usuário não encontrado.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}