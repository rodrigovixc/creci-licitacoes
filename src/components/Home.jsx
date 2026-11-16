// Página inicial: acesso às três seções, aos casos prontos e às fases do fluxo, com a situação do projeto.
// Tudo vem dos mesmos dados das seções (fluxo.json e arquitetura.json); nada é escrito à mão aqui.
import A from '../data/arquitetura.json'

export default function Home({ D, onCaso, onFase }) {
  const etapas = A.construcao.nos
  const feitas = etapas.filter((n) => n.status === 'feito').length
  const andamento = etapas.filter((n) => n.status === 'andamento')
  const pendentes = etapas.filter((n) => n.status === 'pendente')
  const perguntas = D.P.grupos.reduce((s, g) => s + g.itens.length, 0)
  const fases = Object.keys(D.F)
  const linhas = Object.keys(D.L).length
  const pct = Math.round((100 * feitas) / etapas.length) + '%'

  return (
    <section className="home">
      <p className="sobre">CRECI-ES · Compras, licitações e contratos</p>
      <h1>O processo de compras do CRECI-ES, da solicitação à extinção do contrato</h1>
      <p className="intro">
        O fluxo-alvo de compras, licitações e contratos, conferido contra o texto da lei, e o andamento do sistema que vai conduzi-lo dentro do ERP Área Restrita.
      </p>

      <div className="home-situacao">
        <div><span>Fluxo</span><b>versão {D.V}</b><small>{D.VD}</small></div>
        <div><span>Construção do sistema</span><b>{feitas} de {etapas.length} etapas</b><span className="arq-barra"><i style={{ width: pct }} /></span></div>
        <div><span>Em andamento</span><b>{andamento.map((n) => n.titulo).join(', ') || 'nenhuma etapa'}</b></div>
        <div className="alerta"><span>Aguarda decisão</span><b>{pendentes.map((n) => n.titulo).join(' · ') || 'nada pendente'}</b></div>
      </div>

      <div className="home-cards">
        <a className="home-card" href="#fluxo">
          <span className="home-n">01</span>
          <h2>Fluxo passo a passo</h2>
          <p>{fases.length} fases e {linhas} caminhos no quadro do passo 20, de modalidades, contratação direta e procedimentos auxiliares. Role para baixo para seguir o processo e para o lado nas decisões. Cada cartão traz quem faz e a base legal.</p>
          <span className="home-ir">Abrir o fluxo →</span>
        </a>
        <a className="home-card" href="#arquitetura">
          <span className="home-n">02</span>
          <h2>Arquitetura do sistema</h2>
          <p>Como o módulo vai funcionar dentro do ERP, com roteiros passo a passo de um ato, e em que ponto está a construção.</p>
          <span className="arq-barra"><i style={{ width: pct }} /></span>
          <span className="home-ir">Abrir a arquitetura →</span>
        </a>
        <a className="home-card" href="#perguntas">
          <span className="home-n">03</span>
          <h2>Perguntas da Diretoria</h2>
          <p>{perguntas} perguntas com resposta curta e a referência ao passo do fluxo, à decisão pendente e ao artigo de lei.</p>
          <span className="home-ir">Abrir as perguntas →</span>
        </a>
      </div>

      <h2 className="home-sec">Casos prontos</h2>
      <p className="home-dica">Abre o fluxo já com o caminho do caso escolhido.</p>
      <div className="casos">
        {D.M.map((m, j) => (
          <button type="button" key={j} onClick={() => onCaso(j)} title={m.s}>{m.t}</button>
        ))}
      </div>

      <h2 className="home-sec">Ir direto a uma fase</h2>
      <ol className="home-fases">
        {fases.map((k) => (
          <li key={k}>
            <button type="button" onClick={() => onFase(k)} style={{ '--c': D.FI[k][2] }}>
              <i>{k}</i> {D.F[k]} <small>{D.FI[k][1]}</small>
            </button>
          </li>
        ))}
      </ol>

      <footer>
        Fonte: diagrama v{D.V} do fluxo de compras, licitações e contratos do CRECI-ES ({D.VD}) e arquitetura atualizada em {A.atualizado}.
      </footer>
    </section>
  )
}
