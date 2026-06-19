import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext"; // Importação necessária

export default function Ranking() {
  const { loggedUser } = useUser();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // O Ranking só carrega se o usuário estiver logado
  useEffect(() => {
    if (loggedUser) {
      loadRanking();
    } else {
      setLoading(false);
    }
  }, [loggedUser]);

  async function loadRanking() {
    try {
      const snap = await getDocs(collection(db, "playerResults"));
      const totals = {};

      snap.docs.forEach((doc) => {
        const data = doc.data();
        const pId = data.playerId;
        const points = Number(data.points) || 0;

        if (!totals[pId]) {
          totals[pId] = { name: data.playerName, totalPoints: 0 };
        }
        totals[pId].totalPoints += points;
      });

      const sortedRanking = Object.values(totals).sort((a, b) => b.totalPoints - a.totalPoints);
      setRanking(sortedRanking);
    } catch (error) {
      console.error("Erro ao carregar ranking:", error);
    } finally {
      setLoading(false);
    }
  }

  const getPositionStyle = (index) => {
    if (index === 0) return "text-yellow-500 font-black"; 
    if (index === 1) return "text-gray-400 font-bold";    
    if (index === 2) return "text-amber-700 font-bold";   
    return "text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <button
  onClick={() => navigate("/dashboard")} // Força a volta para o dashboard
  className="mb-6 text-gray-500 hover:text-gray-800 font-semibold flex items-center"
>
  ← Voltar
</button>

        <h1 className="text-3xl font-black text-gray-900 mb-8 text-center">🏆 Ranking Geral</h1>
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          {loading ? (
            <p className="text-center text-gray-400">Calculando ranking...</p>
          ) : ranking.length === 0 ? (
            <p className="text-center text-gray-400">Nenhum dado de pontuação ainda.</p>
          ) : (
            ranking.map((player, index) => (
              <div 
                key={index} 
                className={`flex justify-between items-center py-4 border-b border-gray-50 last:border-0 ${index < 3 ? 'bg-gray-50 px-4 -mx-4 rounded-2xl' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 text-lg ${getPositionStyle(index)}`}>
                    {index + 1}º
                  </span>
                  <span className="font-bold text-gray-900">{player.name}</span>
                </div>
                
                <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                  {player.totalPoints} pts
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}