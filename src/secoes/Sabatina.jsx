// Sabatina jurídica: as 100 perguntas do agente crítico, com resposta, réplica, tréplica e posição final,
// o registro das 29 decisões, o parecer final e o plano de correções. Fonte: docs/revisao-critica.
import { useEffect, useMemo, useState } from 'react'
import S from '../data/docs/sabatina.json'
import Doc from '../components/Doc'
import { ir, rolarAte } from '../lib/rota'

const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const P = S.perguntas.map((p) => ({ ...p, busca: semAcento(p.id + ' ' + p.busca) }))
const POS = { corrigir: 'Corrigir', pendente: 'Decisão pendente', manter: 'Manter' }
const conta = (campo, v) => P.filter((p) => p[campo] === v).length

function Debate({ p }) {
  return (
    <div className="debate">
      <div className="onde"><b>Onde está no projeto</b><Doc html={p.onde} /></div>
      <article className="fala critico" style={{ '--i': 0 }}>
        <h4>O crítico pergunta</h4>
        <Doc html={p.pergunta} />
        <details>
          <summary>Fundamento e risco</summary>
          <Doc html={p.fundamento} />
          <Doc html={p.risco} />
        </details>
      </article>
      <article className="fala projeto" style={{ '--i': 1 }}>
        <h4>O projeto responde</h4>
        <Doc html={p.resposta} />
      </article>
      <article className="fala critico" style={{ '--i': 2 }}>
        <h4>O crítico replica {p.ver && <span className={'carimbo ' + (p.ver === 'ACEITO' ? 'ok' : p.ver === 'INSISTO' ? 'no' : 'meio')}>{p.ver}</span>}</h4>
        <Doc html={p.replica} />
      </article>
      <article className="fala projeto" style={{ '--i': 3 }}>
        <h4>O projeto fecha a posição</h4>
        <Doc html={p.treplica} />
        <p className="posicao"><span className={'carimbo ' + (p.pos === 'pendente' ? 'meio' : 'ok')}>{POS[p.pos]}</span> <span dangerouslySetInnerHTML={{ __html: p.posTexto }} /></p>
      </article>
    </div>
  )
}

export default function Sabatina({ sub }) {
  const alvo = sub[0] || ''
  const abaDoAlvo = alvo.startsWith('decis') ? 'decisoes' : alvo === 'parecer' ? 'parecer' : alvo === 'plano' ? 'plano' : 'perguntas'
  const [aba, setAba] = useState(abaDoAlvo)
  const [q, setQ] = useState('')
  const [lote, setLote] = useState(0)
  const [pos, setPos] = useState('')
  const [ver, setVer] = useState('')
  const [abertas, setAbertas] = useState(() => new Set(alvo.startsWith('Q') ? [alvo] : []))

  useEffect(() => {
    if (!alvo) return
    setAba(abaDoAlvo)
    if (alvo.startsWith('Q')) {
      setQ(''); setLote(0); setPos(''); setVer('')
      setAbertas((a) => new Set(a).add(alvo))
    }
    rolarAte(alvo, alvo.startsWith('Q') ? 'start' : 'center')
  }, [alvo])

  const termo = semAcento(q.trim())
  const lista = useMemo(
    () => P.filter((p) => (!lote || p.lote === lote) && (!pos || p.pos === pos) && (!ver || p.ver === ver) && (!termo || p.busca.includes(termo))),
    [termo, lote, pos, ver]
  )
  const alterna = (id) => setAbertas((a) => { const n = new Set(a); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <section className="sabatina">
      <h1>Sabatina jurídica: 100 perguntas, com resposta, réplica e tréplica</h1>
      <p className="intro">
        Um agente crítico, no papel de advogado especialista em licitações, atacou o fluxo versão 16.4. Cada pergunta teve resposta, réplica do crítico e tréplica com a posição final do projeto.
      </p>
      <dl className="placar">
        <div><dt>Perguntas</dt><dd>{P.length}</dd></div>
        <div><dt>Viraram correção</dt><dd>{conta('pos', 'corrigir')}</dd></div>
        <div><dt>Viraram decisão pendente</dt><dd>{conta('pos', 'pendente')}</dd></div>
        <div><dt>Decisões com dono e data</dt><dd>{S.decisoes.length}</dd></div>
      </dl>

      <div className="arq-chips" role="tablist">
        {[['perguntas', 'Perguntas'], ['decisoes', 'Registro de decisões'], ['parecer', 'Parecer final do crítico'], ['plano', 'Plano de correções']].map(([k, t]) => (
          <button type="button" role="tab" aria-selected={aba === k} key={k} className={aba === k ? 'ativo' : ''} onClick={() => { setAba(k); ir('sabatina') }}>{t}</button>
        ))}
      </div>

      {aba === 'perguntas' && (
        <>
          <div className="filtros">
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por número, tema ou palavra da pergunta" aria-label="Buscar pergunta" />
            <select value={lote} onChange={(e) => setLote(Number(e.target.value))} aria-label="Lote">
              <option value={0}>Todos os lotes</option>
              {S.lotes.map((l) => <option key={l.n} value={l.n}>Lote {l.n}: {l.t}</option>)}
            </select>
            <select value={pos} onChange={(e) => setPos(e.target.value)} aria-label="Posição final">
              <option value="">Toda posição final</option>
              <option value="corrigir">Corrigir ({conta('pos', 'corrigir')})</option>
              <option value="pendente">Decisão pendente ({conta('pos', 'pendente')})</option>
            </select>
            <select value={ver} onChange={(e) => setVer(e.target.value)} aria-label="Réplica do crítico">
              <option value="">Toda réplica</option>
              {['ACEITO', 'ACEITO EM PARTE', 'INSISTO'].map((v) => <option key={v} value={v}>{v[0] + v.slice(1).toLowerCase()} ({conta('ver', v)})</option>)}
            </select>
            <span className="contagem">{lista.length} de {P.length}</span>
          </div>
          <ol className="lista-q">
            {lista.map((p) => {
              const aberta = abertas.has(p.id)
              return (
                <li key={p.id} id={p.id} className={(aberta ? 'aberta' : '') + (alvo === p.id ? ' alvo' : '')}>
                  <button type="button" className="q-topo" aria-expanded={aberta} onClick={() => alterna(p.id)}>
                    <b className="cod">{p.id}</b>
                    <span className="q-titulo">{p.t}</span>
                    <span className="q-marcas">
                      {p.dec.map((d) => <i key={d}>decisão {d}</i>)}
                      <i className={p.pos === 'pendente' ? 'meio' : 'ok'}>{POS[p.pos]}</i>
                    </span>
                  </button>
                  {aberta && <Debate p={p} />}
                </li>
              )
            })}
            {!lista.length && <li className="vazio">Nenhuma pergunta com esse filtro. Apague a busca ou mude os filtros.</li>}
          </ol>
        </>
      )}

      {aba === 'decisoes' && (
        <>
          <Doc html={S.decIntro} />
          <div className="rolagem">
            <table className="tabela">
              <thead><tr><th>Nº</th><th>Decisão</th><th>Dono</th><th>Data proposta</th><th>Origem</th></tr></thead>
              <tbody>
                {S.decisoes.map((d) => (
                  <tr key={d.n} id={'decisao-' + d.n} className={alvo === 'decisao-' + d.n ? 'alvo' : ''}>
                    <td><b>{d.n}</b></td>
                    <td dangerouslySetInnerHTML={{ __html: d.d }} />
                    <td dangerouslySetInnerHTML={{ __html: d.dono }} />
                    <td dangerouslySetInnerHTML={{ __html: d.data }} />
                    <td dangerouslySetInnerHTML={{ __html: d.origem }} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="arq-dica">As datas que o cronograma dá a cada decisão estão em <a className="ref" href="#cronograma">Cronograma</a>.</p>
        </>
      )}

      {aba === 'parecer' && <div id="parecer"><Doc html={S.parecer} /></div>}
      {aba === 'plano' && <div id="plano"><Doc html={S.plano} /></div>}

      <footer>Fonte: docs/revisao-critica/sabatina-juridica-v16-4.md, de 9 de novembro de 2026, e especificação, seção 6.1. A lei citada vem dos textos salvos em gerador/leis.</footer>
    </section>
  )
}
