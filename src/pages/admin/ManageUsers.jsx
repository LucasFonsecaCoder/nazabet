import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import { useUser } from "../../context/UserContext"; // Importe o hook

export default function ManageUsers() {
  const { loggedUser } = useUser(); // Hook para verificar sessão
  const [name, setName] = useState("");
  const [category, setCategory] = useState("regular");
  const [users, setUsers] = useState([]);

  const adminLinks = [
    { label: "👥 Usuários", path: "/admin/users", bg: "bg-blue-600" },
    { label: "🏀 Jogos", path: "/admin/games", bg: "bg-green-600" },
    { label: "📊 Resultados", path: "/admin/results", bg: "bg-orange-600" },
    { label: "🏆 Ranking", path: "/admin/ranking", bg: "bg-purple-600" }
  ];

  async function loadUsers() {
    const snapshot = await getDocs(collection(db, "users"));
    setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  }

  // AQUI A MUDANÇA: O loadUsers reage ao loggedUser
  useEffect(() => {
    if (loggedUser) {
      loadUsers();
    }
  }, [loggedUser]);

  async function resetAllPoints() {
    if (!window.confirm("CUIDADO: Isso vai apagar TODOS os pontos do ranking. Tem certeza?")) return;
    const querySnapshot = await getDocs(collection(db, "playerResults"));
    const batch = writeBatch(db);
    querySnapshot.forEach((document) => batch.delete(doc(db, "playerResults", document.id)));
    await batch.commit();
    alert("Ranking zerado!");
    window.location.reload();
  }

  async function handleAddUser() {
    if (!name.trim()) return;
    await addDoc(collection(db, "users"), { 
      name, 
      category, 
      balance: 20, 
      isAdmin: false, 
      createdAt: serverTimestamp() 
    });
    setName("");
    loadUsers();
  }

  async function handleDelete(id) {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    await deleteDoc(doc(db, "users", id));
    loadUsers();
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-8">⚙️ Painel Administrativo</h1>

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

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-bold mb-6">Novo Usuário</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <input 
              className="md:col-span-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Nome do jogador" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
            <select 
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="star">⭐ Estrela</option>
              <option value="regular">🔹 Regular</option>
              <option value="support">🟢 Apoio</option>
            </select>
            <button 
              onClick={handleAddUser} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl py-3 transition-all"
            >
              Adicionar
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {users.map((user) => (
            user.id !== "5550123" && (
              <div key={user.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex justify-between items-center transition-all hover:shadow-md">
                <div>
                  <h3 className={`font-bold text-lg ${user.category === 'star' ? 'text-yellow-500' : 'text-gray-900'}`}>
                    {user.category === 'star' ? '⭐ ' : ''}
                    {user.name}
                  </h3>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-md font-bold text-gray-600">💰 R$ {user.balance}</span>
                    <span className="text-xs bg-blue-50 px-2 py-1 rounded-md font-bold text-blue-600 uppercase">{user.category}</span>
                  </div>
                  {user.isAdmin && <p className="text-xs text-yellow-600 font-bold mt-2">👑 ADMINISTRADOR</p>}
                </div>
                
                {!user.isAdmin && (
                  <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all">
                    Excluir
                  </button>
                )}
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}