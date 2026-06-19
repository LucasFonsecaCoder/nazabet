import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { loggedUser, logout } = useUser();

  // Função para lidar com o logout usando a função do seu Context
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        
        {/* Header/Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">🏀 NazaBet</h1>
        </div>

        {/* Card de Saldo */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-center border border-gray-200">
          <p className="text-gray-500 font-medium mb-1">Olá, {loggedUser?.name}! 👋</p>
          <p className="text-sm text-gray-400">Seu saldo atual</p>
          <p className="text-4xl font-extrabold text-green-600 mt-2">
            R$ {loggedUser?.balance?.toFixed(2) ?? "0.00"}
          </p>
        </div>

        {/* Grid de Botões */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Link to="/bet" className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-center transition-all shadow-md">
            🎯 Apostar
          </Link>
          <Link to="/history" className="bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-bold text-center transition-all shadow-md">
            📜 Histórico
          </Link>
        </div>

        {/* Botão de Ranking Full Width */}
        <Link to="/ranking" className="block w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-bold text-center transition-all shadow-md mb-8">
          🏆 Ranking
        </Link>

        {/* Botão Sair */}
        <button 
          onClick={handleLogout} 
          className="w-full text-red-500 font-semibold hover:bg-red-50 py-3 rounded-xl transition-all"
        >
          Sair
        </button>
      </div>
    </div>
  );
}