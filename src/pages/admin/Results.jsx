import { useEffect, useState } from "react";
import { 
  collection, getDocs, query, where, writeBatch, doc, increment 
} from "firebase/firestore";
import { db } from "../../firebase";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext"; // Importação necessária

export default function Results() {
  const { loggedUser } = useUser(); // Adicionado
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [savedResults, setSavedResults] = useState({});
  const [playerPoints, setPlayerPoints] = useState({});

  const adminLinks = [
    { label: "👥 Usuários", path: "/admin/users", bg: "bg-blue-600" },
    { label: "🏀 Jogos", path: "/admin/games", bg: "bg-green-600" },
    { label: "📊 Resultados", path: "/admin/results", bg: "bg-orange-600" },
    { label: "🏆 Ranking", path: "/admin/ranking", bg: "bg-purple-600" }
  ];

  // AQUI A MUDANÇA: O loadGames reage ao loggedUser
  useEffect(() => {
    if (loggedUser) {
      loadGames();
    }
  }, [loggedUser]);

  async function loadGames() {
    const snap = await getDocs(collection(db, "games"));
    setGames(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(g => g.status === "finished" || g.status === "paid"));
  }

  async function resetAllPoints() {
    if (!window.confirm("CUIDADO: Isso vai apagar TODOS os pontos do ranking. Tem certeza?")) return;
    const querySnapshot = await getDocs(collection(db, "playerResults"));
    const batch = writeBatch(db);
    querySnapshot.forEach((document) => batch.delete(doc(db, "playerResults", document.id)));
    await batch.commit();
    alert("Ranking zerado!");
    window.location.reload();
  }

  async function loadSavedResults(gameId) {
    const q = query(collection(db, "playerResults"), where("gameId", "==", gameId));
    const snap = await getDocs(q);
    const results = {};
    snap.docs.forEach(d => results[d.data().playerId] = d.data().points);
    setSavedResults(results);
  }

  function updatePoints(playerId, value) {
    setPlayerPoints(prev => ({ ...prev, [playerId]: Number(value) }));
  }

  async function saveResults() {
    if (!selectedGame || !loggedUser) return; // Segurança extra
    const allPlayers = [...(selectedGame.teamAPlayers || []), ...(selectedGame.teamBPlayers || [])];
    const batch = writeBatch(db);

    for (const player of allPlayers) {
      if (String(player.id) === "5550123") continue;

      const resultRef = doc(collection(db, "playerResults"));
      batch.set(resultRef, { 
        gameId: selectedGame.id, 
        playerId: player.id, 
        playerName: player.name, 
        points: playerPoints[player.id] ?? savedResults[player.id] ?? 0 
      });
    }

    const betsSnapshot = await getDocs(query(collection(db, "userBets"), where("gameId", "==", selectedGame.id), where("status", "==", "pending")));
    betsSnapshot.docs.forEach((betDoc) => {
      const bet = betDoc.data();
      const pPoints = playerPoints[bet.playerId] ?? savedResults[bet.playerId] ?? 0;
      const isWon = bet.marketType === 'over' ? pPoints > bet.line : pPoints < bet.line;
      batch.update(doc(db, "userBets", betDoc.id), { status: isWon ? 'won' : 'lost' });
      if (isWon) batch.update(doc(db, "users", bet.userId), { balance: increment(bet.possibleReturn) });
    });

    batch.update(doc(db, "games", selectedGame.id), { status: "paid" });
    await batch.commit();
    alert("Resultados processados!");
    setSelectedGame(null);
    loadGames();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-8">📊 Processamento de Resultados</h1>
        
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

        {!selectedGame ? (
          <div className="grid gap-4">
            {games.length === 0 && <p className="text-center text-gray-400">Nenhum jogo finalizado pendente.</p>}
            {games.map(game => (
              <div key={game.id} onClick={() => { setSelectedGame(game); loadSavedResults(game.id); }} 
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all flex justify-between items-center">
                <h2 className="font-bold text-lg">{game.teamAName} vs {game.teamBName}</h2>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${game.status === "paid" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                  {game.status === "paid" ? "💰 PAGO" : "🔴 AGUARDANDO PAGAMENTO"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-black mb-8 text-center">{selectedGame.teamAName} vs {selectedGame.teamBName}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[ { name: selectedGame.teamAName, players: selectedGame.teamAPlayers, color: "blue" }, 
                 { name: selectedGame.teamBName, players: selectedGame.teamBPlayers, color: "red" } ].map((team, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className={`font-bold uppercase text-${team.color}-600`}>{team.name}</h3>
                  {team.players?.map(p => (
                    String(p.id) !== "5550123" && (
                      <div key={p.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
                        <span className="font-medium text-sm">{p.name}</span>
                        <input type="number" className="w-20 bg-white border border-gray-200 rounded-xl px-3 py-2 text-center font-bold" 
                          defaultValue={savedResults[p.id] || 0} onChange={(e) => updatePoints(p.id, e.target.value)} />
                      </div>
                    )
                  ))}
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-10 pt-6 border-t border-gray-100">
              <button onClick={() => setSelectedGame(null)} className="flex-1 bg-gray-100 font-bold py-4 rounded-2xl hover:bg-gray-200">Voltar</button>
              {selectedGame.status !== "paid" && (
                <button onClick={saveResults} className="flex-1 bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 shadow-lg shadow-green-200">
                  Salvar e Pagar Apostas 💰
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}