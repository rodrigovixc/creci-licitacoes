// Aba "Arquitetura": fluxograma de como o módulo vai funcionar e do passo a passo da construção.
// Dados em src/data/arquitetura.json, gerados de docs/arquitetura/arquitetura-site.json pelo gerador/doc_minigame.py.
// Para registrar um andamento, mude o "status" lá e rode o gerador.
import { useEffect, useMemo, useState } from 'react'
import { ReactFlow, ReactFlowProvider, Background, Controls, Handle, Position, MarkerType, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import A from '../data/arquitetura.json'

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

export default function Arquitetura() {
  const [visao, setVisao] = useState('sistema')
  const [sel, setSel] = useState(null)
  const [r, setR] = useState(0)
  const [p, setP] = useState(0)
  const [tour, setTour] = useState(true)
  const v = A[visao]
  const ativos = visao === 'sistema' && tour ? v.roteiros[r].passos[p].nos : null
  const etapas = A.construcao.nos
  const feitos = etapas.filter((n) => n.status === 'feito').length
  const escolhe = (id) => { setSel(id); if (id) setTour(false) }

  return (
    <section className="arquitetura">
      <p className="sobre">CRECI-ES · Compras, licitações e contratos · atualizado em {A.atualizado}</p>
      <h1>{A.titulo}</h1>
      <p className="intro">{A.intro}</p>
      <p className="arq-resumo">
        <span className="arq-barra larga"><i style={{ width: Math.round((100 * feitos) / etapas.length) + '%' }} /></span>
        {feitos} de {etapas.length} etapas concluídas
      </p>
      <div className="arq-chips abas-arq" role="tablist">
        {['sistema', 'construcao'].map((k) => (
          <button type="button" role="tab" aria-selected={visao === k} key={k} className={visao === k ? 'ativo' : ''} onClick={() => { setVisao(k); setSel(null) }}>{A[k].titulo}</button>
        ))}
      </div>
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
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
