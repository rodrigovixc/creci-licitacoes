// Trilho fixo com as nove fases; a fase do cartão em leitura fica destacada.
export default function Fases({ D, atual }) {
  function vai(k) {
    const el = document.querySelector('.passo[data-fase="' + k + '"]')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <nav className="fases" aria-label="Fases">
      {Object.entries(D.FI).map(([k, [nome, faixa, cor]]) => (
        <button type="button" key={k} className={String(atual) === k ? 'ativa' : ''} style={{ '--c': cor }} onClick={() => vai(k)} title={nome + ' · ' + faixa}>
          <i /> <span className="n">{k}</span> <span className="t">{nome.charAt(0) + nome.slice(1).toLowerCase()}</span>
        </button>
      ))}
    </nav>
  )
}
