// Seção "Arquitetura": por que esta arquitetura, o fluxograma de como o módulo vai funcionar, os ADRs, o documento completo e a construção.
// Dados em src/data/arquitetura.json, gerados de docs/arquitetura/arquitetura-site.json pelo gerador/doc_minigame.py.
// Para registrar um andamento, mude o "status" lá e rode o gerador.
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { ReactFlow, ReactFlowProvider, Background, Controls, Handle, Position, MarkerType, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import A from '../data/arquitetura.json'
import DOC from '../data/docs/arquitetura-doc.json'
import Doc from './Doc'
import { ir, rolarAte } from '../lib/rota'

// o andamento traz os documentos e as rodadas inteiros: só carrega quando a visão abre
const Andamento = lazy(() => import('./Andamento'))

const LADO = { t: Position.Top, r: Position.Right, b: Position.Bottom, l: Position.Left }

function Caixa({ data }) {
  return (
    <div className={'arq-caixa t-' + (data.tipo || 'etapa') + (data.status ? ' s-' + data.status : '') + (data.apagado ? ' apagado' : '') + (data.ativo ? ' ativo' : '')}>
      {Object.entries(LADO).map(([k, p]) => (
        <span key={k}>
          <Handle type="source" position={p} id={'s-' + k} />
          <Handle type="target" position={p} id={'t-' + k} />
        </span>
      ))}
      {data.status && <span className="arq-status">{A.status[data.status]}</span>}
      <strong>{data.titulo}</strong>
      {data.sub && <small>{data.sub}</small>}
      {data.progresso && <span className="arq-barra"><i style={{ width: data.progresso }} /></span>}
    </div>
  )
}

function Grupo({ data }) {
  return <div className={'arq-grupo g-' + data.tipo}><span>{data.titulo}</span></div>
}

const tipos = { caixa: Caixa, grupo: Grupo }

function progresso(n) {
  const it = n.itens || []
  if (!it.length) return null
  return Math.round((100 * it.filter((i) => i.status === 'feito').length) / it.length) + '%'
}

function montar(v, largura, ativos, sel) {
  const realce = ativos && new Set(ativos)
  const grupos = (v.grupos || []).map((g) => ({
    id: g.id, type: 'grupo', position: { x: g.x, y: g.y }, data: g, draggable: false, selectable: false, zIndex: -1,
    style: { width: g.w, height: g.h },
  }))
  const nos = v.nos.map((n) => ({
    id: n.id, type: 'caixa', position: { x: n.x, y: n.y }, draggable: false,
    data: { ...n, progresso: progresso(n), apagado: realce && !realce.has(n.id), ativo: (realce && realce.has(n.id)) || sel === n.id },
    style: { width: largura },
  }))
  const setas = v.setas.map((s, i) => {
    const [a, b] = (s.lado || 'b-t').split('-')
    const acesa = realce && realce.has(s.de) && realce.has(s.para)
    return {
      id: 'e' + i, source: s.de, target: s.para, sourceHandle: 's-' + a, targetHandle: 't-' + b,
      type: 'smoothstep', label: s.rotulo, animated: Boolean(acesa),
      className: (s.tracejada ? 'tracejada' : '') + (realce && !acesa ? ' apagada' : ''),
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
    }
  })
  return { nodes: [...grupos, ...nos], edges: setas }
}

// No passo a passo, a câmera aproxima das caixas do passo; sem passo, mostra o diagrama inteiro.
function Camera({ ativos }) {
  const { fitView } = useReactFlow()
  useEffect(() => {
    const t = setTimeout(() => fitView(ativos ? { nodes: ativos.map((id) => ({ id })), padding: 0.35, maxZoom: 1.1, duration: 500 } : { padding: 0.08, duration: 400 }), 50)
    return () => clearTimeout(t)
  }, [ativos, fitView])
  return null
}

function Diagrama({ v, largura, ativos, sel, onSel }) {
  const { nodes, edges } = useMemo(() => montar(v, largura, ativos, sel), [v, largura, ativos, sel])
  return (
    <div className="arq-tela">
      <ReactFlowProvider>
      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={tipos} colorMode="system"
        fitView fitViewOptions={{ padding: 0.08 }} minZoom={0.2} maxZoom={1.6}
        nodesConnectable={false} nodesDraggable={false} elementsSelectable
        onNodeClick={(_, n) => n.type === 'caixa' && onSel(n.id)} onPaneClick={() => onSel(null)}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} size={1} />
        <Controls showInteractive={false} />
        <Camera ativos={ativos} />
      </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}

function Detalhe({ n }) {
  if (!n) return <p className="arq-dica">Clique numa caixa do diagrama para ver o detalhe.</p>
  return (
    <div className="arq-detalhe">
      <h3>{n.titulo}</h3>
      {n.status && <p className={'arq-pill s-' + n.status}>{A.status[n.status]}</p>}
      <p>{n.texto}</p>
      {n.itens && (
        <ul className="arq-itens">
          {n.itens.map((i, k) => <li key={k} className={'s-' + i.status}><span>{A.status[i.status]}</span>{i.t}</li>)}
        </ul>
      )}
      {(n.padroes || n.adr) && (
        <p className="arq-refs">
          {n.padroes && <>Padrão: {n.padroes.join(', ')}. </>}
          {n.adr && <>Decisão: {n.adr.join(', ')}.</>}
        </p>
      )}
    </div>
  )
}

function Roteiro({ roteiros, r, setR, p, setP }) {
  const ro = roteiros[r]
  const passo = ro.passos[p]
  return (
    <div className="arq-roteiro">
      <div className="arq-chips">
        {roteiros.map((x, k) => (
          <button type="button" key={k} className={k === r ? 'ativo' : ''} onClick={() => { setR(k); setP(0) }}>{x.titulo}</button>
        ))}
      </div>
      <div className="arq-passo">
        <span className="arq-n">Passo {p + 1} de {ro.passos.length}</span>
        <p>{passo.texto}</p>
        <div className="arq-nav">
          <button type="button" onClick={() => setP(p - 1)} disabled={p === 0}>← Anterior</button>
          <button type="button" onClick={() => setP(p + 1)} disabled={p === ro.passos.length - 1}>Próximo →</button>
        </div>
      </div>
    </div>
  )
}

function Refs({ refs }) {
  return (
    <p className="pq-refs">
      {refs.map((r) => r.startsWith('ADR')
        ? <a key={r} className="ref" href={'#arquitetura/' + r}>{r}</a>
        : <a key={r} className="ref" href="#arquitetura/documento">seção {r}</a>)}
    </p>
  )
}

function Cartoes({ itens, tipo }) {
  return (
    <ul className={'pq-cartoes ' + tipo}>
      {itens.map((it, k) => (
        <li key={k} style={{ '--i': k }}>
          <h3>{it.t}</h3>
          <p>{it.x}</p>
          <Refs refs={it.ref} />
        </li>
      ))}
    </ul>
  )
}

// "Por quê": o problema, a decisão, como ela é aplicada, o que resolve, o que evita e o que custa.
function Porque() {
  const Q = DOC.porque
  const comparacao = DOC.secoes.find((s) => s.t.startsWith('2.'))
  return (
    <div className="porque">
      <h2>O problema</h2>
      <ul className="pq-problema">{Q.problema.map((x, k) => <li key={k}>{x}</li>)}</ul>

      <h2>A decisão</h2>
      <p className="pq-decisao">{Q.decisao}</p>

      <h2>Como é aplicada</h2>
      <Cartoes itens={Q.aplica} tipo="aplica" />

      <h2>O que resolve</h2>
      <p className="arq-dica">Cada cartão é um problema real do fluxo ou da revisão, com o mecanismo que o tratará.</p>
      <Cartoes itens={Q.resolve} tipo="resolve" />

      <h2>O que evita</h2>
      <p className="arq-dica">O que ficou de fora de propósito, para não pagar hoje por uma hipótese.</p>
      <Cartoes itens={Q.evita} tipo="evita" />

      <h2>O que custa</h2>
      <Cartoes itens={Q.paga} tipo="paga" />

      {comparacao && (
        <>
          <h2>A primeira versão e a atual, lado a lado</h2>
          <Doc html={comparacao.html} />
        </>
      )}
    </div>
  )
}

function Adrs({ alvo }) {
  return (
    <div className="adrs">
      <Doc html={DOC.adrIntro} />
      {DOC.adrs.map((a) => (
        <details key={a.id} id={a.id} className={'dobra' + (alvo === a.id ? ' alvo' : '')} open={alvo === a.id}>
          <summary>
            <b className="cod">{a.id}</b> {a.t}
            <i className={'sit ' + (a.sit.startsWith('Aceito') ? 'ok' : a.sit.startsWith('Substituído') ? 'fora' : '')}>{a.sit.split(/[,;]/)[0]}</i>
          </summary>
          <Doc html={a.html} />
        </details>
      ))}
    </div>
  )
}

const VISOES = [['porque', 'Por que esta arquitetura'], ['sistema', 'Como vai funcionar'], ['adrs', `Decisões registradas (${DOC.adrs.length})`], ['documento', 'Documento completo'], ['construcao', 'Construção'], ['andamento', 'Andamento']]

export default function Arquitetura({ sub = [] }) {
  const alvo = sub[0] || ''
  const visaoDoAlvo = alvo.startsWith('ADR') ? 'adrs' : VISOES.some(([k]) => k === alvo) ? alvo : 'porque'
  const [visao, setVisao] = useState(visaoDoAlvo)
  const [sel, setSel] = useState(null)
  const [r, setR] = useState(0)
  const [p, setP] = useState(0)
  const [tour, setTour] = useState(true)
  useEffect(() => {
    if (!alvo) return
    setVisao(visaoDoAlvo)
    if (alvo.startsWith('ADR')) rolarAte(alvo)
  }, [alvo])
  const diagrama = visao === 'sistema' || visao === 'construcao'
  const v = diagrama ? A[visao] : null
  const ativos = visao === 'sistema' && tour ? v.roteiros[r].passos[p].nos : null
  const etapas = A.construcao.nos
  const feitos = etapas.filter((n) => n.status === 'feito').length
  const escolhe = (id) => { setSel(id); if (id) setTour(false) }

  return (
    <section className="arquitetura">
      <p className="sobre">Atualizado em {A.atualizado}</p>
      <h1>{A.titulo}</h1>
      <p className="intro">{A.intro}</p>
      <p className="arq-resumo">
        <span className="arq-barra larga"><i style={{ width: Math.round((100 * feitos) / etapas.length) + '%' }} /></span>
        {feitos} de {etapas.length} etapas concluídas
      </p>
      <div className="arq-chips abas-arq" role="tablist">
        {VISOES.map(([k, t]) => (
          <button type="button" role="tab" aria-selected={visao === k} key={k} className={visao === k ? 'ativo' : ''} onClick={() => { setVisao(k); setSel(null); ir('arquitetura/' + k) }}>{t}</button>
        ))}
      </div>

      {visao === 'porque' && <Porque />}
      {visao === 'adrs' && <Adrs alvo={alvo} />}
      {visao === 'andamento' && <Suspense fallback={<p className="carregando">Carregando…</p>}><Andamento /></Suspense>}
      {visao === 'documento' && (
        <div className="arq-doc">
          <Doc html={DOC.intro} />
          {DOC.secoes.map((s) => (
            <div key={s.id}>
              <h2 id={s.id}>{s.t}</h2>
              <Doc html={s.html} />
            </div>
          ))}
        </div>
      )}

      {diagrama && (
        <>
          <p className="arq-dica">{v.intro}</p>
          <ul className="arq-legenda">
            {visao === 'sistema'
              ? [['usuario', 'Pessoas'], ['tela', 'Telas e agendador'], ['dominio', 'Domínio'], ['dado', 'Dados de regra'], ['ponte', 'Ponte'], ['teste', 'Testes'], ['erp', 'ERP'], ['ext', 'Fora do CRECI-ES']].map(([k, t]) => <li key={k} className={'t-' + k}>{t}</li>)
              : Object.entries(A.status).map(([k, t]) => <li key={k} className={'s-' + k}>{t}</li>)}
          </ul>
          <Diagrama key={visao} v={v} largura={visao === 'sistema' ? 240 : 270} ativos={ativos} sel={sel} onSel={escolhe} />
          {visao === 'sistema' && (
            tour
              ? <Roteiro roteiros={v.roteiros} r={r} setR={setR} p={p} setP={setP} />
              : <button type="button" className="limpa" onClick={() => { setTour(true); setSel(null) }}>Voltar ao passo a passo de um ato</button>
          )}
          {(!tour || visao === 'construcao') && <Detalhe n={v.nos.find((n) => n.id === sel)} />}
          {visao === 'construcao' && (
            <ol className="arq-lista">
              {etapas.map((n) => (
                <li key={n.id} className={'s-' + n.status}>
                  <button type="button" onClick={() => setSel(n.id)}>
                    <span className={'arq-pill s-' + n.status}>{A.status[n.status]}</span> {n.titulo}
                    {progresso(n) && <small> · {progresso(n)} dos itens</small>}
                  </button>
                  <a className="ref" href={'#prompts/' + n.id}>prompt</a>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
      <footer>Fonte: docs/arquitetura (proposta 2.0, registros de decisão e arquitetura-site.json) e, no andamento, docs/prompts/rodadas.</footer>
    </section>
  )
}
