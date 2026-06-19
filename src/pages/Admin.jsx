import { useState, useEffect } from "react";
import {
  collection, addDoc, getDocs,
  updateDoc, deleteDoc, doc, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from "../context/UserContext"; // Importação necessária

const CATEGORIES = [
  { value: "star",    label: "⭐ Star"    },
  { value: "regular", label: "🔹 Regular" },
  { value: "support", label: "🟢 Support" },
];

const INITIAL_BALANCE = 20;

export default function ManageUsers() {
  const { loggedUser } = useUser(); // Adicionado para proteção
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("regular");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  // AQUI A MUDANÇA: Reage ao estado do loggedUser
  useEffect(() => {
    if (loggedUser) {
      loadUsers();
    }
  }, [loggedUser]);

  async function addUser() {
    if (!name.trim()) return;
    setLoading(true);
    await addDoc(collection(db, "users"), {
      name: name.trim(),
      category,
      balance: INITIAL_BALANCE,
      betsHistory: [],
      winsHistory: [],
      lossesHistory: [],
      isAdmin: false,
      createdAt: new Date().toISOString().split("T")[0],
    });
    setName("");
    setCategory("regular");
    await loadUsers();
    setLoading(false);
  }

  function startEdit(user) {
    setEditingId(user.id);
    setEditData({ name: user.name, category: user.category, balance: user.balance });
  }

  async function saveEdit(id) {
    await updateDoc(doc(db, "users", id), {
      name: editData.name,
      category: editData.category,
      balance: Number(editData.balance),
    });
    setEditingId(null);
    loadUsers();
  }

  async function removeUser(id) {
    if (!confirm("Remover este usuário?")) return;
    await deleteDoc(doc(db, "users", id));
    loadUsers();
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">👤 Gerenciar Usuários</h1>

      {/* Se não estiver logado, nem mostra o formulário */}
      {!loggedUser ? (
        <p className="text-center text-gray-500">Carregando...</p>
      ) : (
        <>
          {/* Formulário de adição */}
          <div className="bg-white rounded-2xl shadow p-4 mb-6">
            <h2 className="font-semibold mb-3">Adicionar Usuário</h2>
            <div className="flex flex-col gap-2">
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Nome do jogador"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addUser()}
              />
              <select
                className="border rounded-lg px-3 py-2"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                onClick={addUser}
                disabled={loading}
              >
                {loading ? "Adicionando..." : "Adicionar Usuário"}
              </button>
            </div>
          </div>

          {/* Lista de usuários */}
          <div className="space-y-2">
            {users.map(user => (
              <div key={user.id} className="bg-white rounded-xl shadow p-4">
                {editingId === user.id ? (
                  <div className="flex flex-col gap-2">
                    <input
                      className="border rounded px-2 py-1"
                      value={editData.name}
                      onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
                    />
                    <select
                      className="border rounded px-2 py-1"
                      value={editData.category}
                      onChange={e => setEditData(p => ({ ...p, category: e.target.value }))}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      className="border rounded px-2 py-1"
                      value={editData.balance}
                      onChange={e => setEditData(p => ({ ...p, balance: e.target.value }))}
                      placeholder="Saldo"
                    />
                    <div className="flex gap-2">
                      <button className="bg-green-500 text-white px-3 py-1 rounded flex-1" onClick={() => saveEdit(user.id)}>Salvar</button>
                      <button className="bg-gray-300 px-3 py-1 rounded flex-1" onClick={() => setEditingId(null)}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {CATEGORIES.find(c => c.value === user.category)?.label} {user.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        💰 {user.balance} moedas · Criado em {user.createdAt}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-blue-500 text-sm border border-blue-300 px-2 py-1 rounded" onClick={() => startEdit(user)}>Editar</button>
                      <button className="text-red-500 text-sm border border-red-300 px-2 py-1 rounded" onClick={() => removeUser(user.id)}>Remover</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}