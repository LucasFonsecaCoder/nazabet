import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function History() {
  const { loggedUser } = useUser();
  const navigate = useNavigate();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true); // Adicionado estado de loading

  // Agora o efeito só roda quando o loggedUser estiver disponível
  useEffect(() => {
    if (loggedUser) {
      loadBets();
    } else {
      setLoading(false);
    }
  }, [loggedUser]);

  async function loadBets() {
    try {
      setLoading(true);
      // Otimização: usamos query com 'where' para buscar apenas as apostas deste user no servidor
      const q = query(collection(db, "userBets"), where("userId", "==", loggedUser.id));
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      
      setBets(data);
    } catch (error) {
      console.error("Erro ao carregar apostas:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteBet(id) {
    if (!window.confirm("Deseja excluir esta aposta?")) return;
    await deleteDoc(doc(db, "userBets", id));
    loadBets();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto">
        <button
  onClick={() => navigate("/dashboard")} // Força a volta para o dashboard
  className="mb-6 text-gray-500 hover:text-gray-800 font-semibold flex items-center"
>
  ← Voltar
</button>

        <h1 className="text-3xl font-black text-gray-900 mb-8">📜 Histórico</h1>

        {loading ? (
          <div className="text-center text-gray-400">Carregando histórico...</div>
        ) : bets.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-gray-500">
            Nenhuma aposta encontrada.
          </div>
        ) : (
          <div className="space-y-4">
            {bets.map((bet) => (
              <div key={bet.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{bet.playerName}</h2>
                    <p className="text-sm text-gray-500 font-medium">
                      {bet.marketType === "over" ? "📈 Mais de" : "📉 Menos de"} {bet.line} pts
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    bet.status === "won" ? "bg-green-100 text-green-700" : 
                    bet.status === "lost" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {bet.status === "won" ? "Ganha" : bet.status === "lost" ? "Perdida" : "Pendente"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-sm bg-gray-50 p-4 rounded-2xl">
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase font-bold">Odd</p>
                    <p className="font-bold">{bet.odd?.toFixed(2) || "0.00"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase font-bold">Apostado</p>
                    <p className="font-bold">R$ {bet.stake?.toFixed(2) || "0.00"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase font-bold">Retorno</p>
                    <p className="font-bold text-green-600">R$ {(bet.possibleReturn || 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    {bet.createdAt?.toDate ? bet.createdAt.toDate().toLocaleDateString("pt-BR") : "Data indisponível"}
                  </p>
                  <button 
                    onClick={() => deleteBet(bet.id)} 
                    className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg text-xs font-bold transition-all"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}