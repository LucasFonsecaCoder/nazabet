import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, onSnapshot, query, where, orderBy
} from "firebase/firestore";
import { useUser } from "../context/UserContext"; // Importação do contexto

const SALDO_INICIAL = 20;

export default function UserPanel() {
  const { loggedUser, logout } = useUser(); // Pegando do contexto
  const [bets, setBets] = useState([]);
  const [myBets, setMyBets] = useState([]);
  const [selectedBet, setSelectedBet] = useState(null);
  const [amount, setAmount] = useState("");

  // Saldo calculado
  const spent = myBets.reduce((acc, b) => acc + b.amount, 0);
  const won = myBets.filter(b => b.result === "ganha").reduce((acc, b) => acc + b.payout, 0);
  const balance = parseFloat((SALDO_INICIAL - spent + won).toFixed(2));

  // ── MERCADOS ABERTOS ──
  useEffect(() => {
    const q = query(collection(db, "bets"), where("status", "==", "aberta"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => setBets(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  // ── MINHAS APOSTAS ──
  useEffect(() => {
    if (!loggedUser?.name) return;
    const q = query(
      collection(db, "userBets"), 
      where("userName", "==", loggedUser.name), 
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, snap => setMyBets(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [loggedUser]);

  const placeBet = async () => {
    const value = parseFloat(amount);
    if (!selectedBet || isNaN(value) || value <= 0 || value > balance) return;
    
    const payout = parseFloat((value * selectedBet.odd).toFixed(2));
    
    await addDoc(collection(db, "userBets"), {
      userName: loggedUser.name,
      betId: selectedBet.id,
      description: selectedBet.description,
      odd: selectedBet.odd,
      amount: value,
      potentialPayout: payout,
      payout: 0,
      result: "pendente",
      createdAt: Date.now()
    });
    
    setSelectedBet(null);
    setAmount("");
  };

  // Proteção caso o usuário não tenha carregado ainda
  if (!loggedUser) {
    return <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold">👋 {loggedUser.name}</h1>
          <p className="text-green-400 font-bold text-lg">R$ {balance.toFixed(2)}</p>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-white">Sair</button>
      </div>

      {/* Apostas disponíveis */}
      <h2 className="font-bold text-lg mb-3">Apostas Disponíveis</h2>
      {bets.length === 0 && <p className="text-gray-400 mb-6">Nenhuma aposta disponível.</p>}
      <div className="space-y-2 mb-6">
        {bets.map(b => (
          <button key={b.id} onClick={() => setSelectedBet(b)}
            className={`w-full text-left bg-gray-800 hover:bg-gray-700 rounded-xl p-4 transition border-2 ${
              selectedBet?.id === b.id ? "border-blue-500" : "border-transparent"
            }`}>
            <p className="font-bold">{b.description}</p>
            <p className="text-sm text-gray-400">{b.gameLabel}</p>
            <p className="text-blue-400 font-bold">Odd: {b.odd}x</p>
          </button>
        ))}
      </div>

      {/* Formulário */}
      {selectedBet && (
        <div className="bg-gray-800 rounded-2xl p-4 mb-6 space-y-3">
          <p className="font-bold">🎯 {selectedBet.description}</p>
          <p className="text-blue-400">Odd: {selectedBet.odd}x</p>
          <input type="number" placeholder="Valor (R$)" value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full bg-gray-700 rounded-xl px-4 py-3 outline-none" />
          <button onClick={placeBet} className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold">
            Confirmar Aposta
          </button>
        </div>
      )}

      {/* Minhas apostas */}
      <h2 className="font-bold text-lg mb-3">Minhas Apostas</h2>
      <div className="space-y-2">
        {myBets.map(b => (
          <div key={b.id} className="bg-gray-800 rounded-xl p-4">
            <p className="font-bold">{b.description}</p>
            <p className="text-sm text-gray-400">
              Apostado: R$ {b.amount.toFixed(2)} · Odd: {b.odd}x
            </p>
            <span className={`text-xs font-bold px-2 py-1 rounded-full mt-1 inline-block ${
              b.result === "pendente" ? "bg-yellow-600" :
              b.result === "ganha"   ? "bg-green-600" : "bg-red-600"
            }`}>
              {b.result.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}