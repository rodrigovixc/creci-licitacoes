// Cronograma das etapas, em dias úteis, nos dois cenários de dedicação. Fonte: gerador/cronograma.json, calculado por gerador/doc_site.py.
import { Fragment, useState } from 'react'
import C from '../data/docs/cronograma.json'
import A from '../data/arquitetura.json'
import { useVisto } from '../lib/visto'

const dia = (s) => new Date(s + 'T12:00:00')
const fmt = (s) => dia(s).toLocaleDateString('pt-BR')
const num = (n) => String(n).replace('.', ',')
const T0 = dia(C.inicio).getTime()
const T1 = Math.max(...C.cenarios.flatMap((c) => c.etapas.map((e) => dia(e.fim).getTime()))) + 12 * 864e5
const pct = (s) => ((dia(s).getTime() - T0) / (T1 - T0)) * 100

// um tique por mês, no dia 1
const MESES = []
for (let d = new Date(T0); d.getTime() < T1; d = new Date(d.getFullYear(), d.getMonth() + 1, 1, 12)) {
  if (d.getDate() === 1) MESES.push(d)
}
// datas fixas do registro de decisões, agrupadas
const FIXAS = Object.entries(
  C.decisoes.filter((d) => d.fixa).reduce((m, d) => ({ ...m, [d.fixa]: [...(m[d.fixa] || []), d.n] }), {})
).sort()
const lista = (ns) => (ns.length > 1 ? ns.slice(0, -1).join(', ') + ' e ' + ns[ns.length - 1] : String(ns[0]))

export default function Cronograma() {
  const [cen, setCen] = useState(0)
  const [aberta, setAberta] = useState(null)
  const [ref, visto] = useVisto('0px')
  const c = C.cenarios[cen]
  const hoje = new Date().toISOString().slice(0, 10)
  const hojePct = pct(hoje)

  return (
    <section className="cronograma">
      <h1>Cronograma: as etapas em dias úteis</h1>
      <p className="intro">
        O que falta fazer, em fila, com início em {fmt(C.inicio)}. As durações são estimativas e serão recalibradas no fechamento do incremento 0. Escolha o cenário de dedicação para ver as datas.
      </p>

      <div className="cenarios" role="radiogroup" aria-label="Cenário de dedicação">
        {C.cenarios.map((x, k) => (
          <button type="button" key={x.id} role="radio" aria-checked={cen === k} className={cen === k ? 'ativo' : ''} onClick={() => setCen(k)}>
            <strong>{x.nome}</strong>
            <span>{x.x}</span>
            <b>Incremento 6 pronto em {fmt(x.fim)}</b>
          </button>
        ))}
      </div>

      <div ref={ref} className={'gantt' + (visto ? ' visto' : '')}>
        <div className="gantt-eixo" aria-hidden="true">
          {MESES.map((m) => (
            <span key={m.getTime()} style={{ left: ((m.getTime() - T0) / (T1 - T0)) * 100 + '%' }}>
              {m.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
              {m.getMonth() === 0 || m === MESES[0] ? '/' + String(m.getFullYear()).slice(2) : ''}
            </span>
          ))}
        </div>
        <div className="gantt-corpo">
          <div className="gantt-fundo" aria-hidden="true">
            {MESES.map((m) => <i key={m.getTime()} style={{ left: ((m.getTime() - T0) / (T1 - T0)) * 100 + '%' }} />)}
            {FIXAS.map(([d, ns]) => <i key={d} className="marco" style={{ left: pct(d) + '%' }} title={`${fmt(d)}: decisões ${lista(ns)}`} />)}
            {hojePct >= 0 && hojePct <= 100 && <i className="hoje" style={{ left: hojePct + '%' }} />}
          </div>
          {c.etapas.map((e, k) => {
            const info = C.etapas[e.id]
            return (
              <Fragment key={e.id}>
                <button type="button" className={'gantt-linha' + (aberta === e.id ? ' aberta' : '')} aria-expanded={aberta === e.id} onClick={() => setAberta(aberta === e.id ? null : e.id)}>
                  <span className="gantt-nome"><b>{e.id}</b> {info.t.replace(/^Incremento \d · /, '')}{info.opcional ? ' (opcional)' : ''}</span>
                  <span className="gantt-datas">{fmt(e.ini)} a {fmt(e.fim)} · {e.uteis} dias úteis</span>
                  <span className="gantt-trilho">
                    <i className={'gantt-barra ' + (e.id[0] === 'c' ? 'doc' : 'codigo') + (info.opcional ? ' opcional' : '')} style={{ left: pct(e.ini) + '%', width: Math.max(pct(e.fim) - pct(e.ini), 0.7) + '%', '--i': k }} />
                  </span>
                </button>
                {aberta === e.id && (
                  <div className="gantt-detalhe">
                    {info.porque && <p>{info.porque}</p>}
                    <table className="tabela">
                      <thead><tr><th>Passo</th><th>Dias de trabalho</th><th>Pronto até</th></tr></thead>
                      <tbody>
                        {e.passos.map((p, j) => <tr key={j}><td>{p.t}</td><td>{num(p.dias)}</td><td>{fmt(p.fim)}</td></tr>)}
                      </tbody>
                    </table>
                    {info.pronto && <p><b>Pronto quando:</b> <span dangerouslySetInnerHTML={{ __html: info.pronto }} /></p>}
                    {info.depois && <p className="base">Fora da conta: {info.depois}</p>}
                    <p><a className="ref" href={'#prompts/' + e.id}>Abrir o prompt da etapa {e.id}</a></p>
                  </div>
                )}
              </Fragment>
            )
          })}
        </div>
        <ul className="gantt-legenda">
          <li className="doc">Documento e decisão</li>
          <li>Código no ERP</li>
          <li className="marco">Data proposta de decisão</li>
          <li className="hoje">Hoje</li>
        </ul>
      </div>

      <h2>Datas propostas de decisão</h2>
      <ul className="marcos">
        {FIXAS.map(([d, ns]) => (
          <li key={d}><time>{fmt(d)}</time><span>{ns.length > 1 ? 'Decisões' : 'Decisão'} {ns.map((n, k) => <Fragment key={n}>{k > 0 && (k === ns.length - 1 ? ' e ' : ', ')}<a className="ref" href={'#sabatina/decisao-' + n}>{n}</a></Fragment>)}</span></li>
        ))}
      </ul>

      <h2>O que cada decisão precisa cumprir</h2>
      <p className="arq-dica">Onde o registro diz "antes do incremento", a data-limite é o início desse incremento no cenário escolhido. Decisão atrasada não para o incremento, que entra no modo restritivo. A exceção é a decisão 18.</p>
      <div className="rolagem">
        <table className="tabela">
          <thead><tr><th>Nº</th><th>Decisão</th><th>Dono</th><th>Registro</th><th>Limite neste cenário</th></tr></thead>
          <tbody>
            {C.decisoes.map((d) => (
              <tr key={d.n}>
                <td><a className="ref" href={'#sabatina/decisao-' + d.n}>{d.n}</a></td>
                <td dangerouslySetInnerHTML={{ __html: d.d }} />
                <td dangerouslySetInnerHTML={{ __html: d.dono }} />
                <td>{d.texto}</td>
                <td>{d.fixa ? fmt(d.fixa) : d.por ? fmt(d.por[c.id]) : 'sem data'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Etapas concluídas</h2>
      <ul className="feitas">
        {C.feitas.map((f) => <li key={f.id}><b>{f.id}</b> {f.t} <small>{f.sub}</small></li>)}
      </ul>

      <h2>Premissas</h2>
      <ol className="premissas">
        {C.premissas.map((p, k) => <li key={k} dangerouslySetInnerHTML={{ __html: p }} />)}
      </ol>

      <footer>Fonte: gerador/cronograma.json e docs/planejamento/cronograma.md. Situação das etapas atualizada em {A.atualizado}.</footer>
    </section>
  )
}
