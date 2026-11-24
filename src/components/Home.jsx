// Página inicial: a linha do processo, o índice do site e a situação da construção.
// Tudo vem dos mesmos dados das seções (fluxo.json, arquitetura.json e docs/indice.json); nada é escrito à mão aqui.
import A from '../data/arquitetura.json'
import I from '../data/docs/indice.json'
import DIAG from '../data/diagramas.json'

const data = (s) => new Date(s + 'T12:00:00').toLocaleDateString('pt-BR')

// caminho suave que passa por todos os pontos, na ordem
function caminho(pts) {
  return pts.reduce((d, [x, y], i) => {
    if (!i) return `M ${x} ${y}`
    const [px, py] = pts[i - 1]
    const horizontal = Math.abs(y - py) < 1
    return d + (horizontal ? ` L ${x} ${y}` : ` C ${px + (px > 180 ? 70 : -70)} ${py}, ${x + (x > 180 ? 70 : -70)} ${y}, ${x} ${y}`)
  }, '')
}

// A linha do processo: as fases do fluxo como estações de um trilho que se desenha ao abrir a página.
function Linha({ D, onFase, estreita }) {
  const fases = Object.keys(D.F)
  const pts = estreita
    ? fases.map((_, i) => { const l = Math.floor(i / 3), c = l % 2 ? 2 - (i % 3) : i % 3; return [60 + c * 120, 46 + l * 104] })
    : fases.map((_, i) => [56 + i * (888 / (fases.length - 1)), i % 2 ? 96 : 54])
  const d = estreita ? caminho(pts) : pts.reduce((s, [x, y], i) => (i ? s + ` S ${x - 50} ${y}, ${x} ${y}` : `M ${x} ${y}`), '')
  const id = estreita ? 'linha-e' : 'linha-l'
  return (
    <svg className={'linha ' + (estreita ? 'estreita' : 'larga')} viewBox={estreita ? '0 0 360 310' : '0 0 1000 160'} role="group" aria-label="As fases do processo, na ordem">
      <path id={id} className="linha-traco" d={d} pathLength="1" />
      <circle className="linha-ficha" r="5">
        <animateMotion dur="16s" begin="2.4s" repeatCount="indefinite" rotate="auto"><mpath href={'#' + id} /></animateMotion>
      </circle>
      {fases.map((k, i) => (
        <a key={k} href="#fluxo" className="linha-fase" style={{ '--i': i, '--c': D.FI[k][2] }} onClick={(e) => { e.preventDefault(); onFase(k) }}>
          <title>{`Fase ${k}: ${D.F[k]} (${D.FI[k][1]})`}</title>
          <circle cx={pts[i][0]} cy={pts[i][1]} r="17" />
          <text className="n" x={pts[i][0]} y={pts[i][1] + 5}>{k}</text>
          <text className="t" x={pts[i][0]} y={pts[i][1] + 38}>{D.F[k].split(/[ ,]/)[0]}</text>
        </a>
      ))}
    </svg>
  )
}

export default function Home({ D, onCaso, onFase }) {
  const etapas = A.construcao.nos
  const feitas = etapas.filter((n) => n.status === 'feito').length
  const andamento = etapas.filter((n) => n.status === 'andamento')
  const pendentes = etapas.filter((n) => n.status === 'pendente')
  const fases = Object.keys(D.F)
  const codando = etapas.filter((n) => n.id[0] === 'i' && n.status !== 'planejado')

  const INDICE = [
    ['contexto', 'Contexto', 'O problema, o método e a linha do tempo do projeto.', I.leis + ' textos legais'],
    ['fluxo', 'Fluxo passo a passo', 'O processo em rolagem, com quem faz e a base legal de cada passo.', I.nos + ' caixas, ' + I.fases + ' fases'],
    ['regras', 'Regras e casos de uso', 'O catálogo de regras de negócio e o que cada pessoa fará no sistema.', I.rn + ' regras, ' + I.uc + ' casos'],
    ['especificacao', 'Especificação', 'O documento completo: lei, fluxo, modalidades, engenharia e decisões.', 'versão ' + I.spec],
    ['sabatina', 'Sabatina jurídica', 'Um agente crítico ataca o fluxo. Pergunta, resposta, réplica e tréplica.', I.perguntas + ' perguntas, ' + I.corrigir + ' correções'],
    ['perguntas', 'Perguntas da Diretoria', 'Resposta curta para o que a Diretoria pode perguntar, com a referência.', I.diretoria + ' perguntas'],
    ['arquitetura', 'Arquitetura', 'Por que um módulo dentro do ERP, como funciona, o que resolve e o que evita.', I.adrs + ' decisões registradas'],
    ['diagramas', 'Diagramas', 'O sistema em diagramas interativos: arquitetura, fluxo, sequência, dados, estados e mais.', DIAG.length + ' diagramas'],
    ['prompts', 'Prompts em loop', 'Um prompt por etapa, com checagens de máquina e revisor independente.', I.prompts + ' prompts, ' + I.rodadas + ' rodadas'],
    ['cronograma', 'Cronograma', 'As etapas em dias úteis e a data que cada decisão precisa cumprir.', 'até ' + data(I.fimIntegral) + ' ou ' + data(I.fimMetade)],
  ]

  return (
    <section className="home">
      <div className="heroi">
        <h1>Da solicitação à extinção do contrato</h1>
        <p className="intro">
          Como o CRECI-ES vai comprar, licitar e contratar: o fluxo conferido contra o texto da lei, a crítica jurídica que ele sofreu, a arquitetura do sistema e o plano para construí-lo.
        </p>
        <Linha D={D} onFase={onFase} />
        <Linha D={D} onFase={onFase} estreita />
        <p className="heroi-nota">As {fases.length} fases do fluxo versão {D.V}. Toque numa fase para abrir o processo nesse ponto.</p>
      </div>

      <h2 className="home-sec">O que há neste site</h2>
      <ul className="indice">
        {INDICE.map(([k, t, x, n], i) => (
          <li key={k} style={{ '--i': i }}>
            <a href={'#' + k}>
              <strong>{t}</strong>
              <span>{x}</span>
              <small>{n}</small>
            </a>
          </li>
        ))}
      </ul>

      <h2 className="home-sec">Onde a construção está</h2>
      <p className="home-dica">
        {codando.length
          ? 'A construção do sistema começou: ' + codando.map((n) => n.titulo).join(', ') + '.'
          : 'O projeto está na fase de desenho. Nenhuma linha do sistema está escrita.'}
      </p>
      <nav className="etapas-faixa" aria-label="Etapas da construção">
        {etapas.map((n) => <a key={n.id} href={'#prompts/' + n.id} className={'s-' + n.status} title={`${n.id}: ${n.titulo} (${A.status[n.status]})`} aria-label={`${n.id}: ${n.titulo}, ${A.status[n.status]}`}><b>{n.id}</b></a>)}
      </nav>
      <dl className="situacao">
        <div><dt>Concluídas</dt><dd>{feitas} de {etapas.length} etapas</dd></div>
        <div><dt>Em andamento</dt><dd>{andamento.map((n) => n.titulo).join(', ') || 'nenhuma etapa'}</dd></div>
        <div><dt>Aguardam decisão</dt><dd>{pendentes.map((n) => n.titulo).join(' e ') || 'nada pendente'}</dd></div>
        <div><dt>Próximo passo</dt><dd><a className="ref" href="#cronograma">Ver o cronograma</a></dd></div>
      </dl>

      <h2 className="home-sec">Casos prontos</h2>
      <p className="home-dica">Abre o fluxo já com o caminho do caso escolhido.</p>
      <div className="casos">
        {D.M.map((m, j) => (
          <button type="button" key={j} onClick={() => onCaso(j)} title={m.s}>{m.t}</button>
        ))}
      </div>

      <footer>
        Fonte: diagrama v{D.V} do fluxo de compras, licitações e contratos do CRECI-ES ({D.VD}) e arquitetura atualizada em {A.atualizado}.
      </footer>
    </section>
  )
}
