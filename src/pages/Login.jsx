import { useState } from "react";

const ADMIN_USER = "admin";
const ADMIN_PASS = "naza123";

export default function Login({ onLogin }) {
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  function handleEntrar() {
    if (isAdmin) {
      if (nome === ADMIN_USER && senha === ADMIN_PASS) {
        onLogin({ nome: "Admin", role: "admin" });
      } else {
        setErro("Usuário ou senha incorretos.");
      }
    } else {
      if (!nome.trim()) {
        setErro("Digite seu nome.");
        return;
      }
      onLogin({ nome: nome.trim(), role: "user" });
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      {/* Logo centralizada */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold text-yellow-400 tracking-widest drop-shadow-lg">
          NazaBet
        </h1>
        <p className="text-gray-400 mt-2 text-sm">Faça sua aposta e boa sorte!</p>
      </div>

      {/* Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm shadow-xl">
        <h2 className="text-white text-xl font-bold mb-6 text-center">
          {isAdmin ? "🔐 Entrar como Admin" : "🎯 Entrar para Apostar"}
        </h2>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder={isAdmin ? "Usuário" : "Seu nome"}
            value={nome}
            onChange={(e) => { setNome(e.target.value); setErro(""); }}
            className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-500"
          />

          {isAdmin && (
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErro(""); }}
              className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-500"
            />
          )}

          {erro && (
            <p className="text-red-400 text-sm text-center">{erro}</p>
          )}

          <button
            onClick={handleEntrar}
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold py-3 rounded-lg transition-all"
          >
            Entrar
          </button>

          <button
            onClick={() => { setIsAdmin(!isAdmin); setErro(""); setNome(""); setSenha(""); }}
            className="text-gray-400 hover:text-yellow-400 text-sm text-center transition-all"
          >
            {isAdmin ? "← Voltar para apostar" : "Entrar como Admin"}
          </button>
        </div>
      </div>
    </div>
  );
}
