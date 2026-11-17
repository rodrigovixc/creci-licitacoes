// Especificação completa, uma parte por vez. Cada parte carrega só quando abre. Fonte: gerador/spec.
import { useEffect, useState } from 'react'
import I from '../data/docs/indice.json'
import Doc from '../components/Doc'
import { ir, rolarAte } from '../lib/rota'

const carregar = import.meta.glob('../data/docs/spec-*.json')

export default function Especificacao({ sub }) {
  const i = Math.min(Math.max(Number(sub[0]) || 0, 0), I.partes.length - 1)
  const [parte, setParte] = useState(null)

  useEffect(() => {
    let vivo = true
    setParte(null)
    carregar[`../data/docs/spec-${i}.json`]().then((m) => {
      if (!vivo) return
      setParte(m.default)
      if (sub[1]) rolarAte(sub[1])
      else window.scrollTo(0, 0)
    })
    return () => { vivo = false }
  }, [i])
  useEffect(() => { if (parte && sub[1]) rolarAte(sub[1]) }, [sub[1]])

  return (
    <section className="espec">
      <h1>Especificação {I.spec}</h1>
      <p className="intro">O documento completo que orienta a construção: a lei em resumo, o fluxo, as regras de cada modalidade, a engenharia do software e as decisões em aberto.</p>
      <div className="espec-grade">
        <nav className="espec-indice" aria-label="Partes da especificação">
          {I.partes.map((p) => (
            <div key={p.i} className={p.i === i ? 'ativa' : ''}>
              <a href={'#especificacao/' + p.i} aria-current={p.i === i ? 'true' : undefined}>{p.t}</a>
              {p.i === i && p.toc.length > 0 && (
                <ul>
                  {p.toc.map((t) => <li key={t.id}><a href={'#especificacao/' + p.i + '/' + t.id}>{t.t}</a></li>)}
                </ul>
              )}
            </div>
          ))}
        </nav>
        <div className="espec-corpo">
          {parte ? (
            <>
              <h2 className="espec-titulo">{parte.t}</h2>
              <Doc key={i} html={parte.html} aoDesenhar={() => sub[1] && rolarAte(sub[1])} />
              <p className="espec-nav">
                {i > 0 && <button type="button" className="limpa" onClick={() => ir('especificacao/' + (i - 1))}>Parte anterior</button>}
                {i < I.partes.length - 1 && <button type="button" className="limpa" onClick={() => ir('especificacao/' + (i + 1))}>Próxima parte</button>}
              </p>
            </>
          ) : <p className="carregando">Carregando a parte…</p>}
        </div>
      </div>
      <footer>Fonte: gerador/spec, a mesma do arquivo docs/especificacao. Os diagramas são desenhados a partir do texto Mermaid da especificação.</footer>
    </section>
  )
}
