import { faseDe } from '../lib/fase'

export default function Passo({ D, id, linha }) {
  const n = D.N[id]
  const vr = linha && D.L[linha].var[id] // título e base legal próprios da linha (21a, 21b, 22, 25)
  const { nome, cor } = faseDe(D, n, linha)
  const decisao = n.t.endsWith('?')
  const completo = n.x && n.x.length > n.d.length + 20
  return (
    <article id={'p-' + id} className={'passo ' + n.k + (decisao ? ' pergunta' : '')} style={{ '--c': cor }} data-fase={n.k === 'step' ? n.f : 6}>
      <div className="num">{n.k === 'linha' ? n.f : id}</div>
      <div className="corpo">
        <div className="meta">
          <span className="fase">{nome}</span>
          {n.q && <span className="quem">{n.q}</span>}
        </div>
        <h2>{vr ? vr.t : n.t}</h2>
        {n.d && <p className="lead">{n.d}</p>}
        {completo && (
          <details>
            <summary>Ler o passo completo</summary>
            <p>{n.x}</p>
          </details>
        )}
        {(vr ? vr.l : n.l) && (vr ? vr.l : n.l) !== '—' && <p className="lei">{vr ? vr.l : n.l}</p>}
      </div>
    </article>
  )
}
