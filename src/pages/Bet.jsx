import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const ODDS_TABLE = {
  star: {
    2.5: { over: 1.10, under: 4.00 },
    4.5: { over: 1.35, under: 2.50 },
    6.5: { over: 1.75, under: 1.60 },
    8.5: { over: 2.40, under: 1.30 },
    10.5: { over: 3.80, under: 1.12 },
  },
  regular: {
    2.5: { over: 1.25, under: 2.50 },
    4.5: { over: 1.55, under: 1.75 },
    6.5: { over: 2.25, under: 1.45 },
    8.5: { over: 3.40, under: 1.20 },
    10.5: { over: 5.50, under: 1.06 },
  }
};

export default function Bet() {
  const { loggedUser, login } = useUser(); // Adicionei o 'login' aqui
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [stake, setStake] = useState("");

  // ESTA FUNÇÃO PRECISA ESTAR AQUI PARA OS JOGOS APARECEREM
  async function loadGames() {
    try {
      const snapshot = await getDocs(collection(db, "games"));
      const openGames = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((game) => game.status === "open");
      setGames(openGames);
    } catch (e) {
      console.error("Erro ao carregar jogos:", e);
    }
  }

  useEffect(() => {
    if (loggedUser) {
      loadGames();
    }
  }, [loggedUser]);

  const getOdd = (category, line, type) => {
    const cat = category?.toLowerCase() === 'star' ? 'star' : 'regular';
    return ODDS_TABLE[cat][line][type];
  };

  async function handleBet() {
    if (!loggedUser) return;
    if (!stake || Number(stake) <= 0) { alert("Digite um valor."); return; }
    if (Number(stake) > loggedUser.balance) { alert("Saldo insuficiente."); return; }

    const newBalance = loggedUser.balance - Number(stake);
    const possibleReturn = Number(stake) * selectedMarket.odd;

    await addDoc(collection(db, "userBets"), {
      userId: loggedUser.id,
      userName: loggedUser.name,
      gameId: selectedGame.id,
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.name,
      marketType: selectedMarket.type,
      line: selectedMarket.line,
      odd: selectedMarket.odd,
      stake: Number(stake),
      possibleReturn,
      status: "pending",
      createdAt: new Date(),
    });

    await updateDoc(doc(db, "users", loggedUser.id), {
      balance: newBalance,
    });

    // Atualiza saldo localmente para não precisar recarregar e evitar ser expulso
    login({ ...loggedUser, balance: newBalance });

    alert("Aposta realizada com sucesso!");
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => {
            if (selectedPlayer) setSelectedPlayer(null);
            else if (selectedGame) setSelectedGame(null);
            else navigate("/dashboard");
          }}
          className="mb-6 text-gray-500 hover:text-gray-800 font-semibold flex items-center"
        >
          ← Voltar
        </button>

        <h1 className="text-3xl font-black text-gray-900 mb-6">🎯 Apostar</h1>

        {!loggedUser ? (
          <p className="text-center text-gray-400">Carregando dados da conta...</p>
        ) : (
          <>
            {!selectedGame && (
              <div className="space-y-4">
                {games.length === 0 && <p className="text-center text-gray-400">Nenhum jogo aberto.</p>}
                {games.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => setSelectedGame(game)}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-400 cursor-pointer transition-all"
                  >
                    <h2 className="text-xl font-bold">{game.teamAName} x {game.teamBName}</h2>
                    <p className="text-blue-600 font-medium text-sm mt-1">Toque para selecionar jogador</p>
                  </div>
                ))}
              </div>
            )}
            {/* ... restante do seu código igual ... */}
            {selectedGame && !selectedPlayer && (
              <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold mb-6 text-center">{selectedGame.teamAName} vs {selectedGame.teamBName}</h2>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-gray-400 uppercase text-xs mb-3">{selectedGame.teamAName}</h3>
                    {selectedGame.teamAPlayers?.map(p => (
                      <button key={p.id} onClick={() => setSelectedPlayer(p)} className="block w-full text-left bg-gray-50 p-3 rounded-xl mb-2 hover:bg-blue-50 transition-colors">🏀 {p.name}</button>
                    ))}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-400 uppercase text-xs mb-3">{selectedGame.teamBName}</h3>
                    {selectedGame.teamBPlayers?.map(p => (
                      <button key={p.id} onClick={() => setSelectedPlayer(p)} className="block w-full text-left bg-gray-50 p-3 rounded-xl mb-2 hover:bg-blue-50 transition-colors">🏀 {p.name}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {selectedPlayer && (
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-2xl font-bold mb-2">{selectedPlayer.name}</h2>
                <div className="space-y-4 mb-6">
                  {[2.5, 4.5, 6.5, 8.5, 10.5].map(line => (
                    <div key={line} className="grid grid-cols-2 gap-2">
                      <button onClick={() => setSelectedMarket({type: 'over', line, odd: getOdd(selectedPlayer.category, line, 'over'), label: `Mais de ${line} pts`})} className="bg-green-50 text-green-700 py-3 rounded-xl font-bold text-xs">Over {line} ({getOdd(selectedPlayer.category, line, 'over').toFixed(2)})</button>
                      <button onClick={() => setSelectedMarket({type: 'under', line, odd: getOdd(selectedPlayer.category, line, 'under'), label: `Menos de ${line} pts`})} className="bg-blue-50 text-blue-700 py-3 rounded-xl font-bold text-xs">Under {line} ({getOdd(selectedPlayer.category, line, 'under').toFixed(2)})</button>
                    </div>
                  ))}
                </div>
                {selectedMarket && (
  <div className="bg-gray-50 rounded-2xl p-5 border-t-4 border-blue-500">
    <p className="text-sm text-gray-500 font-bold mb-1">{selectedMarket.label}</p>
    <input
      type="number"
      placeholder="Valor (R$)"
      value={stake}
      onChange={(e) => setStake(e.target.value)}
      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4"
    />
    {/* AQUI ESTÁ O CÁLCULO QUE FALTAVA */}
    <p className="text-sm text-gray-600 mb-4">
      Ganho Esperado: <span className="font-bold text-green-600">
        R$ {(Number(stake) * selectedMarket.odd || 0).toFixed(2)}
      </span>
    </p>
    <button onClick={handleBet} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold">
      Confirmar Aposta
    </button>
  </div>
)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}