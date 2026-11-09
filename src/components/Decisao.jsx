import { useEffect, useRef } from 'react'
import { faseDe } from '../lib/fase'

// Bifurcação: as opções ficam numa faixa com rolagem lateral (scroll-snap nativo).
// O cartão centralizado é o caminho escolhido; o fluxo continua abaixo dele.
export default function Decisao({ D, id, i, onEscolhe }) {
  const n = D.N[id]
  const faixa = useRef(null)
  const timer = useRef(0)
  const quieto = useRef(0) // até quando ignorar o onScroll (rolagem feita por código)
  const montou = useRef(false)
  const pergunta = n.t.endsWith('?')

  useEffect(() => {
    const tr = faixa.current
    const el = tr && tr.children[i]
    if (!el) return
    quieto.current = Date.now() + 800
    tr.scrollTo({ left: el.offsetLeft - (tr.clientWidth - el.offsetWidth) / 2, behavior: montou.current ? 'smooth' : 'instant' })
    montou.current = true
  }, [i])

  function rolou() {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const tr = faixa.current
      if (!tr || Date.now() < quieto.current) return
      const centro = tr.scrollLeft + tr.clientWidth / 2
      let melhor = 0
      let dist = Infinity
      ;[...tr.children].forEach((el, j) => {
        const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - centro)
        if (d < dist) { dist = d; melhor = j }
      })
      if (melhor !== i) onEscolhe(id, melhor)
    }, 120)
  }

  const passo = (d) => onEscolhe(id, Math.min(n.v.length - 1, Math.max(0, i + d)))

  return (
    <section className="decisao" aria-label={'Caminhos a partir do passo ' + id}>
      <header>
        <span className="rotulo">{pergunta ? 'Responda e role para o lado' : 'Saídas deste passo: role para o lado'}</span>
        <span className="setas">
          <button type="button" onClick={() => passo(-1)} disabled={i === 0} aria-label="Opção anterior">←</button>
          <span>{i + 1} de {n.v.length}</span>
          <button type="button" onClick={() => passo(1)} disabled={i === n.v.length - 1} aria-label="Próxima opção">→</button>
        </span>
      </header>
      <div className="faixa" ref={faixa} onScroll={rolou}>
        {n.v.map(([alvo, por], j) => {
          const a = D.N[alvo]
          if (!a) return null
          const { nome, cor } = faseDe(D, a, a.k === 'cell' ? a.f : null)
          return (
            <button type="button" key={alvo} className={'opcao' + (j === i ? ' ativa' : '')} style={{ '--c': cor }} onClick={() => onEscolhe(id, j)} aria-pressed={j === i}>
              {por && <span className="por">{por}</span>}
              <span className="alvo">{a.k === 'linha' ? <b>Linha {a.f}</b> : <><b>{a.k === 'cell' ? alvo : 'Passo ' + alvo}</b> · {nome}</>}</span>
              <span className="titulo">{a.t}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
