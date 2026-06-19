import { useEffect, useState } from "react";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import { useUser } from "../../context/UserContext"; // Adicionado

export default function RankingAdmin() {
  const { loggedUser } = useUser(); // Adicionado
  const [ranking, setRanking] = useState([]);

  const adminLinks = [
    { label: "👥 Usuários", path: "/admin/users", bg: "bg-blue-600" },
    { label: "🏀 Jogos", path: "/admin/games", bg: "bg-green-600" },
    { label: "📊 Resultados", path: "/admin/results", bg: "bg-orange-600" },
    { label: "🏆 Ranking", path: "/admin/ranking", bg: "bg-purple-600" }
  ];

  async function resetAllPoints() {
    if (!window.confirm("CUIDADO: Isso vai apagar TODOS os pontos do ranking. Tem certeza?")) return;
    const querySnapshot = await getDocs(collection(db, "playerResults"));
    const batch = writeBatch(db);
    querySnapshot.forEach((document) => batch.delete(doc(db, "playerResults", document.id)));
    await batch.commit();
    alert("Ranking zerado!");
    window.location.reload();
  }

  // AQUI A MUDANÇA: O ranking só carrega quando o user estiver pronto
  useEffect(() => {
    async function fetchRanking() {
      const snap = await getDocs(collection(db, "playerResults"));
      const scores = {};
      
      snap.docs.forEach(doc => {
        const { playerId, playerName, points } = doc.data();
        if (String(playerId) !== "5550123") {
          scores[playerId] = (scores[playerId] || { name: playerName, total: 0 });
          scores[playerId].total += Number(points || 0);
        }
      });
      
      setRanking(Object.values(scores).sort((a, b) => b.total - a.total));
    }

    if (loggedUser) {
      fetchRanking();
    }
  }, [loggedUser]); // Reage se o login for recuperado

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black mb-8">🏆 Ranking Geral</h1>
        
        <div className="flex flex-wrap gap-3 mb-8 pb-2">
          {adminLinks.map(item => (
            <Link key={item.path} to={item.path} className={`${item.bg} text-white px-5 py-2 rounded-xl font-bold hover:opacity-90 transition-all whitespace-nowrap`}>
              {item.label}
            </Link>
          ))}
          <button onClick={resetAllPoints} className="bg-red-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-red-700 transition-all whitespace-nowrap">
            ⚠️ Zerar Ranking
          </button>
          <Link to="/" className="bg-gray-800 text-white px-5 py-2 rounded-xl font-bold hover:bg-black transition-all ml-auto">
            ⬅️ Sair
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          {ranking.length > 0 ? ranking.map((p, i) => (
            <div key={i} className="flex justify-between py-4 border-b last:border-0 px-2">
              <span className="font-bold text-lg">{i + 1}º {p.name}</span>
              <span className="text-purple-600 font-black text-lg">{p.total} pts</span>
            </div>
          )) : (
            <p className="text-center text-gray-400 py-10">
              {loggedUser ? "Nenhum dado de ranking encontrado." : "Carregando..."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}