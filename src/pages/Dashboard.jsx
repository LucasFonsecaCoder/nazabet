export default function Dashboard({ jogos, apostas, jogadores, times }) {
  const totalApostas = apostas.length
  const totalPot = apostas.reduce((acc, a) => acc + Number(a.valor), 0)

  return (
    <div>
      {/* HERO */}
      <div style={{
        background: 'linear-gradient(135deg, var(--gray-dark) 0%, #1a0000 100%)',
        border: '1px solid var(--red)',
        borderRadius: '16px',
        padding: '2.5rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3.5rem', color: 'var(--red)', marginBottom: '0.5rem' }}>
          🏀 NAZABET
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          A bets dos chegados — Basquete ao máximo!
        </p>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Apostas Ativas', value: totalApostas, icon: '🎯', color: 'var(--green)' },
          { label: 'Pot Total (R$)', value: `R$ ${totalPot.toFixed(2)}`, icon: '💰', color: 'var(--gold)' },
          { label: 'Jogos', value: jogos.length, icon: '🏀', color: 'var(--red)' },
          { label: 'Jogadores', value: jogadores.length, icon: '🤾', color: '#00BFFF' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{
            background: 'var(--gray-dark)',
            border: `1px solid ${color}33`,
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem' }}>{icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color }}>{value}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* JOGOS */}
      <h2 style={{ color: 'var(--red)', marginBottom: '1rem', fontSize: '1.8rem' }}>🗓️ JOGOS EM ABERTO</h2>
      {jogos.filter(j => j.status === 'aberto').length === 0 ? (
        <div style={{ background: 'var(--gray-dark)', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Nenhum jogo cadastrado ainda. Vá em Admin para adicionar!
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {jogos.filter(j => j.status === 'aberto').map(jogo => (
            <div key={jogo.id} style={{
              background: 'var(--gray-dark)',
              border: '1px solid var(--gray-light)',
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)' }}>{jogo.timeCasa}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>CASA</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0.5rem 1.5rem', background: 'var(--red)', borderRadius: '8px' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem' }}>VS</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>{jogo.data}</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)' }}>{jogo.timeVisita}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>VISITANTE</div>
              </div>
              <span style={{
                background: 'var(--green)', color: '#000', padding: '4px 12px',
                borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700
              }}>ABERTO</span>
            </div>
          ))}
        </div>
      )}

      {/* APOSTAS RECENTES */}
      {apostas.length > 0 && (
        <>
          <h2 style={{ color: 'var(--green)', margin: '2rem 0 1rem', fontSize: '1.8rem' }}>🎯 APOSTAS RECENTES</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {apostas.slice(-5).reverse().map((a, i) => (
              <div key={i} style={{
                background: 'var(--gray-dark)',
                border: '1px solid var(--gray-light)',
                borderRadius: '10px',
                padding: '1rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--gold)' }}>{a.apostador}</span>
                  <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>apostou em</span>
                  <span style={{ color: 'var(--text)' }}>{a.descricao}</span>
                </div>
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>R$ {Number(a.valor).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
