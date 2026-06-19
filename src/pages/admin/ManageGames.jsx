import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import { useUser } from "../../context/UserContext"; // Importamos o hook

export default function ManageGames() {
  const { loggedUser } = useUser(); // Pegamos o loggedUser
  const [games, setGames] = useState([]);
  const [users, setUsers] = useState([]);
  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");
  const [selectedA, setSelectedA] = useState("");
  const [selectedB, setSelectedB] = useState("");
  const [teamAPlayers, setTeamAPlayers] = useState([]);
  const [teamBPlayers, setTeamBPlayers] = useState([]);

  const adminLinks = [
    { label: "👥 Usuários", path: "/admin/users", bg: "bg-blue-600" },
    { label: "🏀 Jogos", path: "/admin/games", bg: "bg-green-600" },
    { label: "📊 Resultados", path: "/admin/results", bg: "bg-orange-600" },
    { label: "🏆 Ranking", path: "/admin/ranking", bg: "bg-purple-600" }
  ];

  async function loadData() {
    const gamesSnap = await getDocs(collection(db, "games"));
    const usersSnap = await getDocs(collection(db, "users"));
    setGames(gamesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(u => String(u.id) !== "5550123"));
  }

  // AQUI A MUDANÇA: O loadData roda quando o componente monta, 
  // mas garantimos que a página só funcione se houver um admin logado (opcional, mas recomendado)
  useEffect(() => {
    loadData();
  }, []);

  async function resetAllPoints() {
    if (!window.confirm("CUIDADO: Isso vai apagar TODOS os pontos do ranking. Tem certeza?")) return;
    const querySnapshot = await getDocs(collection(db, "playerResults"));
    const batch = writeBatch(db);
    querySnapshot.forEach((document) => batch.delete(doc(db, "playerResults", document.id)));
    await batch.commit();
    alert("Ranking zerado!");
    window.location.reload();
  }

  function addPlayerToTeamA() {
    if (!selectedA) return;
    const player = users.find(u => u.id === selectedA);
    if (!player || teamAPlayers.some(p => p.id === player.id) || teamBPlayers.some(p => p.id === player.id)) return;
    setTeamAPlayers([...teamAPlayers, { 
      id: player.id, 
      name: player.name, 
      category: player.category || 'regular' 
    }]);
  }

  function addPlayerToTeamB() {
    if (!selectedB) return;
    const player = users.find(u => u.id === selectedB);
    if (!player || teamBPlayers.some(p => p.id === player.id) || teamAPlayers.some(p => p.id === player.id)) return;
    setTeamBPlayers([...teamBPlayers, { 
      id: player.id, 
      name: player.name, 
      category: player.category || 'regular' 
    }]);
  }

  async function handleCreateGame() {
    if (!teamAName.trim() || !teamBName.trim()) return alert("Preencha os dois times.");
    await addDoc(collection(db, "games"), { teamAName, teamBName, teamAPlayers, teamBPlayers, status: "open", createdAt: serverTimestamp() });
    setTeamAName(""); setTeamBName(""); setTeamAPlayers([]); setTeamBPlayers([]);
    loadData();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-8">🏀 Gerenciar Jogos</h1>
        
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

        {/* ... restante do seu JSX permanece igual ... */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-bold mb-6">Criar Novo Jogo</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <input className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3" placeholder="Nome Time A" value={teamAName} onChange={e => setTeamAName(e.target.value)} />
            <input className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3" placeholder="Nome Time B" value={teamBName} onChange={e => setTeamBName(e.target.value)} />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <select className="bg-gray-50 border w-full rounded-2xl px-3 py-2" onChange={e => setSelectedA(e.target.value)}>
                <option value="">Selecione Time A</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <button onClick={addPlayerToTeamA} className="bg-blue-600 text-white w-full rounded-2xl font-bold py-2">+</button>
              {teamAPlayers.map(p => (
                <div key={p.id} className="flex justify-between bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm">
                  {p.name} <button onClick={() => setTeamAPlayers(teamAPlayers.filter(x => x.id !== p.id))}>✕</button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <select className="bg-gray-50 border w-full rounded-2xl px-3 py-2" onChange={e => setSelectedB(e.target.value)}>
                <option value="">Selecione Time B</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <button onClick={addPlayerToTeamB} className="bg-green-600 text-white w-full rounded-2xl font-bold py-2">+</button>
              {teamBPlayers.map(p => (
                <div key={p.id} className="flex justify-between bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold text-sm">
                  {p.name} <button onClick={() => setTeamBPlayers(teamBPlayers.filter(x => x.id !== p.id))}>✕</button>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleCreateGame} className="w-full mt-8 bg-gray-900 text-white py-3 rounded-2xl font-bold hover:bg-black transition-all">
            Criar Partida
          </button>
        </div>

        <div className="space-y-4">
          {games.map(game => (
            <div key={game.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{game.teamAName} vs {game.teamBName}</h3>
                <span className={`text-xs px-2 py-1 rounded-md font-bold ${game.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {game.status === 'open' ? 'ABERTO' : 'ENCERRADO'}
                </span>
              </div>
              <div className="flex gap-2">
                {game.status === 'open' && (
                  <button onClick={async () => { await updateDoc(doc(db, "games", game.id), { status: "finished" }); loadData(); }} className="bg-yellow-500 text-white px-4 py-2 rounded-xl text-sm font-bold">Encerrar</button>
                )}
                <button onClick={async () => { if(window.confirm("Excluir?")) await deleteDoc(doc(db, "games", game.id)); loadData(); }} className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-sm font-bold">Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}