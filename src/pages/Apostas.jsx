import { useState } from 'react'

const TIPOS_APOSTA = [
  { value: 'vencedor', label: '🏆 Time Vencedor' },
  { value: 'pontos_jogador', label: '🎯 Jogador faz X pontos (Over/Under)' },
  { value: 'rebotes_jogador', label: '💪 Jogador faz X rebotes' },
  { value: 'assistencias_jogador', label: '🤝 Jogador faz X assistências' },
  { value: 'pontos_jogo', label: '📊 Total de pontos no jogo (Over/Under)' },
  { value: 'duplo_duplo', label: '⭐ Jogador faz Duplo-Duplo' },
  { value: 'triplo_duplo', label: '🔥 Jogador faz Triplo-Duplo' },
]

export default function Apostas({ jogos, jogadores, apostas, setApostas }) {
  const [form, setForm] = useState({
    apostador: '',
    jogo: '',
    tipo: 'vencedor',
    jogador: '',
    linha: '',
    overunder: 'over',
    time: '',
    valor: '',
  })
  const [sucesso, setSucesso] = useState(false)

  const jogoSelecionado = jogos.find(j => j.id === Number(form.jogo))

  function gerarDescricao() {
    if (!jogoSelecionado) return ''
    const nomeJogo = `${jogoSelecionado.timeCasa} x ${jogoSelecionado.timeVisita}`
    if (form.tipo === 'vencedor') return `${form.time} vence — ${nomeJogo}`
    if (form.tipo === 'pontos_jogador') return `${form.jogador} faz ${form.overunder === 'over' ? 'mais de' : 'menos de'} ${form.linha} pontos — ${nomeJogo}`
    if (form.tipo === 'rebotes_jogador') return `${form.jogador} faz ${form.overunder === 'over' ? 'mais de' : 'menos de'} ${form.linha} rebotes — ${nomeJogo}`
    if (form.tipo === 'assistencias_jogador') return `${form.jogador} faz ${form.overunder === 'over' ? 'mais de' : 'menos de'} ${form.linha} assistências — ${nomeJogo}`
    if (form.tipo === 'pontos_jogo') return `Jogo tem ${form.overunder === 'over' ? 'mais de' : 'menos de'} ${form.linha} pontos — ${nomeJogo}`
    if (form.tipo === 'duplo_duplo') return `${form.jogador} faz Duplo-Duplo — ${nomeJogo}`
    if (form.tipo === 'triplo_duplo') return `${form.jogador} faz Triplo-Duplo — ${nomeJogo}`
    return ''
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.apostador || !form.jogo || !form.valor) return
    const descricao = gerarDescricao()
    setApostas(prev => [...prev, {
      ...form,
      descricao,
      id: Date.now(),
      criadoEm: new Date().toLocaleString('pt-BR')
    }])
    setForm({ apostador: '', jogo: '', tipo: 'vencedor', jogador: '', linha: '', overunder: 'over', time: '', valor: '' })
    setSucesso(true)
    setTimeout(() => setSucesso(false), 3000)
  }

  const precisaJogador = ['pontos_jogador', 'rebotes_jogador', 'assistencias_jogador', 'duplo_duplo', 'triplo_duplo'].includes(form.tipo)
  const precisaLinha = ['pontos_jogador', 'rebotes_jogador', 'assistencias_jogador', 'pontos_jogo'].includes(form.tipo)
  const precisaOverUnder = ['pontos_jogador', 'rebotes_jogador', 'assistencias_jogador', 'pontos_jogo'].includes(form.tipo)
  const precisaTime = form.tipo === 'vencedor'

  const inputStyle = {
    background: 'var(--gray-mid)',
    border: '1px solid var(--gray-light)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: 'var(--text)',
    width: '100%',
    fontSize: '0.95rem'
  }

  return (
    <div>
      <h2 style={{ color: 'var(--red)', fontSize: '2rem', marginBottom: '1.5rem' }}>🎯 FAZER APOSTA</h2>

      {sucesso && (
        <div style={{ background: '#0d2b0d', border: '1px solid var(--green)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', color: 'var(--green)', fontWeight: 700 }}>
          ✅ Aposta registrada com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
        <div>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}>SEU NOME</label>
          <input style={inputStyle} placeholder="Ex: Davi" value={form.apostador} onChange={e => setForm({ ...form, apostador: e.target.value })} required />
        </div>

        <div>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}>JOGO</label>
          <select style={inputStyle} value={form.jogo} onChange={e => setForm({ ...form, jogo: e.target.value })} required>
            <option value="">Selecione o jogo...</option>
            {jogos.filter(j => j.status === 'aberto').map(j => (
              <option key={j.id} value={j.id}>{j.timeCasa} x {j.timeVisita} — {j.data}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}>TIPO DE APOSTA</label>
          <select style={inputStyle} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
            {TIPOS_APOSTA.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {precisaJogador && (
          <div>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}>JOGADOR</label>
            <select style={inputStyle} value={form.jogador} onChange={e => setForm({ ...form, jogador: e.target.value })}>
              <option value="">Selecione o jogador...</option>
              {jogadores.map(j => <option key={j.id} value={j.nome}>{j.nome} ({j.time})</option>)}
            </select>
          </div>
        )}

        {precisaOverUnder && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['over', 'under'].map(ou => (
              <button type="button" key={ou} onClick={() => setForm({ ...form, overunder: ou })} style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid',
                borderColor: form.overunder === ou ? (ou === 'over' ? 'var(--green)' : 'var(--red)') : 'var(--gray-light)',
                background: form.overunder === ou ? (ou === 'over' ? '#0d2b0d' : '#2b0d0d') : 'var(--gray-mid)',
                color: form.overunder === ou ? (ou === 'over' ? 'var(--green)' : 'var(--red)') : 'var(--text)',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '1rem'
              }}>
                {ou === 'over' ? '⬆️ OVER' : '⬇️ UNDER'}
              </button>
            ))}
          </div>
        )}

        {precisaLinha && (
          <div>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}>LINHA (número)</label>
            <input style={inputStyle} type="number" placeholder="Ex: 25.5" value={form.linha} onChange={e => setForm({ ...form, linha: e.target.value })} />
          </div>
        )}

        {precisaTime && jogoSelecionado && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[jogoSelecionado.timeCasa, jogoSelecionado.timeVisita].map(t => (
              <button type="button" key={t} onClick={() => setForm({ ...form, time: t })} style={{
                flex: 1, padding: '12px', borderRadius: '8px', border: '2px solid',
                borderColor: form.time === t ? 'var(--red)' : 'var(--gray-light)',
                background: form.time === t ? '#2b0d0d' : 'var(--gray-mid)',
                color: form.time === t ? 'var(--red)' : 'var(--text)',
                fontWeight: 700, cursor: 'pointer', fontSize: '1rem'
              }}>🏀 {t}</button>
            ))}
          </div>
        )}

        <div>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}>VALOR DA APOSTA (R$)</label>
          <input style={inputStyle} type="number" placeholder="Ex: 10.00" min="1" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} required />
        </div>

        {gerarDescricao() && (
          <div style={{ background: '#0a1a2b', border: '1px solid #00BFFF44', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>RESUMO DA APOSTA:</div>
            <div style={{ color: '#00BFFF', fontWeight: 600 }}>📋 {gerarDescricao()}</div>
          </div>
        )}

        <button type="submit" style={{
          background: 'linear-gradient(135deg, var(--red), #c0392b)',
          color: '#fff',
          border: 'none',
          padding: '14px',
          borderRadius: '10px',
          fontSize: '1.1rem',
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '1px'
        }}>
          🎯 CONFIRMAR APOSTA
        </button>
      </form>
    </div>
  )
}
