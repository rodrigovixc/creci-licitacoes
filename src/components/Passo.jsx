import { faseDe } from '../lib/fase'
import Pncp from './Pncp'

export default function Passo({ D, id, linha }) {
  const n = D.N[id]
  const vr = (linha && D.L[linha].var[id]) || {} // título, texto e base legal próprios da linha (21a, 21b, 22, 25)
  const t = vr.t || n.t
  const d = vr.t ? vr.d : n.d
  const l = vr.t ? vr.l : n.l
  const m = vr.t ? vr.m : n.m
  const { nome, cor } = faseDe(D, n, linha)
  const completo = !vr.t && n.x && n.x.length > 20
  return (
    <article id={'p-' + id} className={'passo ' + n.k + (t.endsWith('?') ? ' pergunta' : '')} style={{ '--c': cor }} data-fase={n.k === 'step' ? n.f : 6}>
      <div className="num">{n.k === 'linha' ? n.f : id}</div>
      <div className="corpo">
        <div className="meta">
          <span className="fase">{nome}</span>
          {n.q && <span className="quem">{n.q}</span>}
          {m && <span className="selo">PNCP</span>}
        </div>
        <h2>{t}</h2>
        {d && <p className="lead">{d}</p>}
        {completo && (
          <details>
            <summary>Ler o passo completo</summary>
            <p>{n.x}</p>
          </details>
        )}
        {m && <Pncp m={m} />}
        {l && l !== '—' && <p className="lei">{l}</p>}
      </div>
    </article>
  )
}
