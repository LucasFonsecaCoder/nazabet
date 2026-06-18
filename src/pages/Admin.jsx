import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, onSnapshot, doc, updateDoc, query, orderBy
} from "firebase/firestore";

export default function AdminPanel({ user, onLogout }) {
  const [tab, setTab] = useState("times");

  // ── STATE DOS DADOS ──
  const [teams, setTeams]     = useState([]);
  const [players, setPlayers] = useState([]);
  const [games, setGames]     = useState([]);
  const [bets, setBets]       = useState([]);

  // ── LISTENERS FIRESTORE ──
  useEffect(() => {
    const unsubs = [
      onSnapshot(query(collection(db, "teams"),   orderBy("name")),   s => setTeams(s.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(collection(db, "players"), orderBy("name")),   s => setPlayers(s.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(collection(db, "games"),   orderBy("createdAt", "desc")), s => setGames(s.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(collection(db, "bets"),    orderBy("createdAt", "desc")), s => setBets(s.docs.map(d => ({ id: d.id, ...d.data() })))),
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  // ── TIMES ──
  const [teamName, setTeamName]       = useState("");
  const [teamMembers, setTeamMembers] = useState("");

  const addTeam = async () => {
    if (!teamName.trim()) return;
    const members = teamMembers.split(",").map(m => m.trim()).filter(Boolean);
    await addDoc(collection(db, "teams"), { name: teamName.trim(), members, createdAt: Date.now() });
    setTeamName(""); setTeamMembers("");
  };

  // ── JOGADORES ──
  const [playerName, setPlayerName] = useState("");
  const [playerTeam, setPlayerTeam] = useState("");

  const addPlayer = async () => {
    if (!playerName.trim()) return;
    await addDoc(collection(db, "players"), { name: playerName.trim(), team: playerTeam, createdAt: Date.now() });
    setPlayerName(""); setPlayerTeam("");
  };

  // ── JOGOS ──
  const [gameTeamA,  setGameTeamA]  = useState("");
  const [gameTeamB,  setGameTeamB]  = useState("");
  const [gamePoints, setGamePoints] = useState("12");

  const addGame = async () => {
    if (!gameTeamA || !gameTeamB || gameTeamA === gameTeamB) return;
    await addDoc(collection(db, "games"), {
      teamA: gameTeamA, teamB: gameTeamB,
      totalPoints: Number(gamePoints),
      status: "aberto", createdAt: Date.now()
    });
    setGameTeamA(""); setGameTeamB(""); setGamePoints("12");
  };

  // ── MERCADOS ──
  const [betGame,        setBetGame]        = useState("");
  const [betDescription, setBetDescription] = useState("");
  const [betOdd,         setBetOdd]         = useState("");

  const addBetMarket = async () => {
    if (!betGame || !betDescription || !betOdd) return;
    const game = games.find(g => g.id === betGame);
    await addDoc(collection(db, "bets"), {
      gameId: betGame,
      gameLabel: game ? `${game.teamA} vs ${game.teamB}` : "",
      description: betDescription,
      odd: parseFloat(betOdd),
      status: "aberta",
      createdAt: Date.now()
    });
    setBetDescription(""); setBetOdd("");
  };

  // ── RESOLVER RESULTADO ──
  const resolveBet = async (betId, result) => {
    // 1. Atualiza o mercado
    await updateDoc(doc(db, "bets", betId), { status: result });

    // 2. Atualiza as apostas dos usuários nesse mercado
    const { getDocs, where } = await import("firebase/firestore");
    const q = query(collection(db, "userBets"), where("betId", "==", betId));
    const snap = await getDocs(q);
    const updates = snap.docs.map(d => {
      const ub = d.data();
      const won = result === "ganha";
      const payout = won ? parseFloat((ub.amount * ub.odd).toFixed(2)) : 0;
      return updateDoc(doc(db, "userBets", d.id), { result, payout });
    });
    await Promise.all(updates);
  };

  const tabs = ["times", "jogadores", "jogos", "mercados", "resultados"];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">⚙️ Admin — {user.nome}</h1>
        <button onClick={onLogout} className="text-sm text-gray-400 hover:text-white">Sair</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto mb-6">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition ${
              tab === t ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── TIMES ── */}
      {tab === "times" && (
        <div className="space-y-3">
          <h2 className="font-bold text-lg">Adicionar Time</h2>
          <input placeholder="Nome do time" value={teamName}
            onChange={e => setTeamName(e.target.value)}
            className="w-full bg-gray-700 rounded-xl px-4 py-3 outline-none" />
          <input placeholder="Membros (separados por vírgula)" value={teamMembers}
            onChange={e => setTeamMembers(e.target.value)}
            className="w-full bg-gray-700 rounded-xl px-4 py-3 outline-none" />
          <button onClick={addTeam}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold">
            Adicionar Time
          </button>
          <div className="mt-4 space-y-2">
            {teams.map(t => (
              <div key={t.id} className="bg-gray-800 rounded-xl p-3">
                <p className="font-bold">{t.name}</p>
                <p className="text-sm text-gray-400">{t.members?.join(", ") || "Sem membros"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── JOGADORES ── */}
      {tab === "jogadores" && (
        <div className="space-y-3">
          <h2 className="font-bold text-lg">Adicionar Jogador</h2>
          <input placeholder="Nome do jogador" value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            className="w-full bg-gray-700 rounded-xl px-4 py-3 outline-none" />
          <select value={playerTeam} onChange={e => setPlayerTeam(e.target.value)}
            className="w-full bg-gray-700 rounded-xl px-4 py-3 outline-none">
            <option value="">Selecionar time</option>
            {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
          <button onClick={addPlayer}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold">
            Adicionar Jogador
          </button>
          <div className="mt-4 space-y-2">
            {players.map(p => (
              <div key={p.id} className="bg-gray-800 rounded-xl p-3">
                <p className="font-bold">{p.name}</p>
                <p className="text-sm text-gray-400">{p.team || "Sem time"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── JOGOS ── */}
      {tab === "jogos" && (
        <div className="space-y-3">
          <h2 className="font-bold text-lg">Adicionar Jogo</h2>
          <select value={gameTeamA} onChange={e => setGameTeamA(e.target.value)}
            className="w-full bg-gray-700 rounded-xl px-4 py-3 outline-none">
            <option value="">Time A</option>
            {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
          <select value={gameTeamB} onChange={e => setGameTeamB(e.target.value)}
            className="w-full bg-gray-700 rounded-xl px-4 py-3 outline-none">
            <option value="">Time B</option>
            {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
          <input type="number" placeholder="Total de pontos (ex: 12)" value={gamePoints}
            onChange={e => setGamePoints(e.target.value)}
            className="w-full bg-gray-700 rounded-xl px-4 py-3 outline-none" />
          <button onClick={addGame}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold">
            Adicionar Jogo
          </button>
          <div className="mt-4 space-y-2">
            {games.map(g => (
              <div key={g.id} className="bg-gray-800 rounded-xl p-3">
                <p className="font-bold">{g.teamA} vs {g.teamB}</p>
                <p className="text-sm text-gray-400">Jogo de {g.totalPoints} pts · {g.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MERCADOS ── */}
      {tab === "mercados" && (
        <div className="space-y-3">
          <h2 className="font-bold text-lg">Criar Mercado de Aposta</h2>
          <select value={betGame} onChange={e => setBetGame(e.target.value)}
            className="w-full bg-gray-700 rounded-xl px-4 py-3 outline-none">
            <option value="">Selecionar jogo</option>
            {games.map(g => (
              <option key={g.id} value={g.id}>{g.teamA} vs {g.teamB}</option>
            ))}
          </select>
          <input placeholder='Ex: "Lucas faz +6.5pts"' value={betDescription}
            onChange={e => setBetDescription(e.target.value)}
            className="w-full bg-gray-700 rounded-xl px-4 py-3 outline-none" />
          <input type="number" step="0.01" placeholder="Odd (ex: 1.60)" value={betOdd}
            onChange={e => setBetOdd(e.target.value)}
            className="w-full bg-gray-700 rounded-xl px-4 py-3 outline-none" />
          <button onClick={addBetMarket}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold">
            Criar Mercado
          </button>
          <div className="mt-4 space-y-2">
            {bets.map(b => (
              <div key={b.id} className="bg-gray-800 rounded-xl p-3">
                <p className="font-bold">{b.description}</p>
                <p className="text-sm text-gray-400">
                  Odd: {b.odd} · {b.gameLabel} · {b.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RESULTADOS ── */}
      {tab === "resultados" && (
        <div className="space-y-3">
          <h2 className="font-bold text-lg">Liberar Resultados</h2>
          {bets.filter(b => b.status === "aberta").length === 0 && (
            <p className="text-gray-400">Nenhuma aposta aberta.</p>
          )}
          {bets.filter(b => b.status === "aberta").map(b => (
            <div key={b.id} className="bg-gray-800 rounded-xl p-4 space-y-2">
              <p className="font-bold">{b.description}</p>
              <p className="text-sm text-gray-400">Odd: {b.odd} · {b.gameLabel}</p>
              <div className="flex gap-2">
                <button onClick={() => resolveBet(b.id, "ganha")}
                  className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-xl font-bold">
                  ✅ Ganhou
                </button>
                <button onClick={() => resolveBet(b.id, "perdida")}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-xl font-bold">
                  ❌ Perdeu
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
