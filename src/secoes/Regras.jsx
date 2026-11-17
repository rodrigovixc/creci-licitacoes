// Regras de negócio (catálogo da seção 5.12 da especificação), casos de uso (5.4) e regras do projeto.
import { useEffect, useMemo, useState } from 'react'
import R from '../data/docs/regras.json'
import Doc from '../components/Doc'
import { ir, rolarAte } from '../lib/rota'

const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const texto = (h) => semAcento(h.replace(/<[^>]+>/g, ' '))
const RN = R.rn.map((r) => ({ ...r, busca: texto(r.c + ' ' + r.r + ' ' + r.b + ' ' + r.p) }))
const UC = R.uc.map((u) => ({ ...u, busca: texto([u.c, u.n, u.ator, u.res, u.fluxo || '', u.impede || ''].join(' ')) }))

function Etapas({ em }) {
  if (!em.length) return null
  return (
    <p className="citada">
      Prompt que cita:{' '}
      {em.map((e) => <a key={e} className="ref" href={'#prompts/' + e}>{e}</a>)}
    </p>
  )
}

export default function Regras({ sub }) {
  const alvo = sub[0]
  const [aba, setAba] = useState(alvo?.startsWith('UC') ? 'uc' : alvo === 'projeto' ? 'projeto' : 'rn')
  const [q, setQ] = useState('')
  const [grupo, setGrupo] = useState(-1)
  const [inc, setInc] = useState('')

  useEffect(() => {
    if (!alvo) return
    if (alvo.startsWith('UC')) setAba('uc')
    else if (alvo.startsWith('RN')) setAba('rn')
    setQ(''); setGrupo(-1); setInc('')
    rolarAte(alvo, 'center')
  }, [alvo])

  const termo = semAcento(q.trim())
  const rn = useMemo(() => RN.filter((r) => (grupo < 0 || r.g === grupo) && (!termo || r.busca.includes(termo))), [termo, grupo])
  const uc = useMemo(() => UC.filter((u) => (!inc || String(u.inc ?? 'fora') === inc) && (!termo || u.busca.includes(termo))), [termo, inc])

  return (
    <section className="regras">
      <h1>Regras de negócio e casos de uso</h1>
      <p className="intro">As {R.rn.length} regras do catálogo da especificação, cada uma com a base legal, e os {R.uc.length} casos de uso, cada um com o incremento que o entrega.</p>

      <div className="arq-chips" role="tablist">
        {[['rn', `Regras de negócio (${R.rn.length})`], ['uc', `Casos de uso (${R.uc.length})`], ['projeto', 'Regras do projeto']].map(([k, t]) => (
          <button type="button" role="tab" aria-selected={aba === k} key={k} className={aba === k ? 'ativo' : ''} onClick={() => { setAba(k); ir('regras') }}>{t}</button>
        ))}
      </div>

      {aba !== 'projeto' && (
        <div className="filtros">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={aba === 'rn' ? 'Buscar por código, palavra ou artigo' : 'Buscar por código, nome ou ator'} aria-label="Buscar" />
          {aba === 'rn' ? (
            <select value={grupo} onChange={(e) => setGrupo(Number(e.target.value))} aria-label="Grupo de regras">
              <option value={-1}>Todos os grupos</option>
              {R.grupos.map((g, k) => <option key={k} value={k}>{g}</option>)}
            </select>
          ) : (
            <select value={inc} onChange={(e) => setInc(e.target.value)} aria-label="Incremento">
              <option value="">Todos os incrementos</option>
              {Object.entries(R.inc).map(([n, t]) => <option key={n} value={n}>Incremento {n}: {t}</option>)}
              <option value="fora">Fora dos incrementos</option>
            </select>
          )}
          <span className="contagem">{aba === 'rn' ? rn.length : uc.length} de {aba === 'rn' ? RN.length : UC.length}</span>
        </div>
      )}

      {aba === 'rn' && (
        <ul className="lista-regras">
          {rn.map((r) => (
            <li key={r.c} id={r.c} className={alvo === r.c ? 'alvo' : ''}>
              <b className="cod">{r.c}</b>
              <div>
                <p dangerouslySetInnerHTML={{ __html: r.r }} />
                <p className="base">
                  {r.p && <span>Passo {r.p}. </span>}
                  {r.b && <span dangerouslySetInnerHTML={{ __html: 'Base: ' + r.b }} />}
                </p>
                <Etapas em={r.em} />
              </div>
            </li>
          ))}
          {!rn.length && <li className="vazio">Nenhuma regra com esse filtro. Apague a busca ou escolha outro grupo.</li>}
        </ul>
      )}

      {aba === 'uc' && (
        <ul className="lista-regras">
          {uc.map((u) => (
            <li key={u.c} id={u.c} className={alvo === u.c ? 'alvo' : ''}>
              <b className="cod">{u.c}</b>
              <div>
                <p><strong dangerouslySetInnerHTML={{ __html: u.n || 'Caso de uso novo, sem nome no catálogo' }} /></p>
                <p className="base">
                  {u.ator && <span dangerouslySetInnerHTML={{ __html: 'Ator: ' + u.ator + '. ' }} />}
                  {u.passos && <span dangerouslySetInnerHTML={{ __html: 'Passos do fluxo: ' + u.passos + '. ' }} />}
                  {u.inc != null
                    ? <a className="ref" href={'#prompts/i' + u.inc}>Incremento {u.inc}</a>
                    : <span className="fora">Fora dos incrementos da seção 5.15</span>}
                </p>
                {(u.pre || u.fluxo) && (
                  <details>
                    <summary>Detalhe</summary>
                    {u.pre && <p dangerouslySetInnerHTML={{ __html: '<b>Pré-condição:</b> ' + u.pre }} />}
                    {u.res && <p dangerouslySetInnerHTML={{ __html: '<b>Resultado:</b> ' + u.res }} />}
                    {u.fluxo && <p dangerouslySetInnerHTML={{ __html: '<b>Fluxo principal:</b> ' + u.fluxo }} />}
                    {u.impede && <p dangerouslySetInnerHTML={{ __html: '<b>O sistema impedirá:</b> ' + u.impede }} />}
                  </details>
                )}
              </div>
            </li>
          ))}
          {!uc.length && <li className="vazio">Nenhum caso de uso com esse filtro.</li>}
        </ul>
      )}

      {aba === 'projeto' && (
        <div className="duas">
          <div className="quadro"><h3>Redação</h3><Doc html={R.projeto} /></div>
          <div className="quadro"><h3>Regras fixas dos agentes</h3><Doc html={R.fixas} /></div>
        </div>
      )}

      <footer>Fonte: especificação, seções 5.4 e 5.12 (gerador/spec/05-engenharia.md).</footer>
    </section>
  )
}
