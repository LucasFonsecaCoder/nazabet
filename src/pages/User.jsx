import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, onSnapshot, query, where, orderBy
} from "firebase/firestore";

const SALDO_INICIAL = 20;

export default function UserPanel({ user, onLogout }) {
  const [bets, setBets]         = useState([]);
  const [myBets, setMyBets]     = useState([]);
  const [selectedBet, setSelectedBet] = useState(null);
  const [amount, setAmount]     = useState("");

  // Saldo calculado dinamicamente pelas apostas
  const spent = myBets.reduce((acc, b) => acc + b.amount, 0);
  const won   = myBets.filter(b => b.result === "ganha").reduce((acc, b) => acc + b.payout, 0);
  const balance = parseFloat((SALDO_INICIAL - spent + won).toFixed(2));

  // ── MERCADOS ABERTOS ──
  useEffect(() => {
    const q = query(collection(db, "bets"), where("status", "==", "aberta"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => setBets(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  // ── MINHAS APOSTAS (tempo real p/ receber resultado) ──
  useEffect(() => {
    if (!user.nome) return;
    const q = query(collection(db, "userBets"), where("userName", "==", user.nome), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => setMyBets(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user.nome]);

  // ── FAZER APOSTA ──
  const placeBet = async () => {
    const value = parseFloat(amount);
    if (!selectedBet || isNaN(value) || value <= 0 || value > balance) return;
    const payout = parseFloat((value * selectedBet.odd).toFixed(2));
    await addDoc(collection(db, "userBets"), {
      userName: user.nome,
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold">👋 {user.nome}</h1>
          <p className="text-green-400 font-bold text-lg">R$ {balance.toFixed(2)}</p>
        </div>
        <button onClick={onLogout} className="text-sm text-gray-400 hover:text-white">Sair</button>
      </div>

      {/* Apostas disponíveis */}
      <h2 className="font-bold text-lg mb-3">Apostas Disponíveis</h2>
      {bets.length === 0 && <p className="text-gray-400 mb-6">Nenhuma aposta disponível no momento.</p>}
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
          <input type="number" placeholder="Valor da aposta (R$)" value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full bg-gray-700 rounded-xl px-4 py-3 outline-none" />
          {amount && !isNaN(parseFloat(amount)) && (
            <p className="text-green-400 text-sm">
              Ganho potencial: R$ {(parseFloat(amount) * selectedBet.odd).toFixed(2)}
            </p>
          )}
          <button onClick={placeBet}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold">
            Confirmar Aposta
          </button>
        </div>
      )}

      {/* Minhas apostas */}
      <h2 className="font-bold text-lg mb-3">Minhas Apostas</h2>
      {myBets.length === 0 && <p className="text-gray-400">Você ainda não apostou nada.</p>}
      <div className="space-y-2">
        {myBets.map(b => (
          <div key={b.id} className="bg-gray-800 rounded-xl p-4">
            <p className="font-bold">{b.description}</p>
            <p className="text-sm text-gray-400">
              Apostado: R$ {b.amount.toFixed(2)} · Odd: {b.odd}x · Potencial: R$ {b.potentialPayout.toFixed(2)}
            </p>
            {b.result === "ganha" && (
              <p className="text-green-400 text-sm font-bold">+R$ {b.payout.toFixed(2)} recebido!</p>
            )}
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
