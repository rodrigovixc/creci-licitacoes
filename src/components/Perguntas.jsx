// Perguntas que a Diretoria pode fazer, com resposta curta e a referência (passo, decisão, artigo).
// Dados em fluxo.json (P), gerados de gerador/perguntas_diretoria.json: a mesma fonte do apêndice do diagrama.
export default function Perguntas({ D }) {
  const P = D.P
  return (
    <section className="perguntas">
      <p className="sobre">CRECI-ES · Compras, licitações e contratos · fluxo v{D.V}</p>
      <h1>{P.titulo}</h1>
      <p className="intro">{P.intro}</p>
      <p className="fonte">Fonte: {P.fonte}</p>
      <nav className="grupos" aria-label="Grupos de perguntas">
        {P.grupos.map((g, i) => (
          <a key={i} href={'#perguntas-' + (i + 1)}>{g.nome}</a>
        ))}
      </nav>
      {P.grupos.map((g, i) => (
        <div key={i} id={'perguntas-' + (i + 1)} className="grupo">
          <h2>{g.nome}</h2>
          {g.itens.map((it, j) => (
            <details key={j} className="pergunta" open={j === 0 && i === 0}>
              <summary>{it.p}</summary>
              <p>{it.r}</p>
              <p className="onde"><b>Onde está:</b> {it.onde}</p>
            </details>
          ))}
        </div>
      ))}
    </section>
  )
}
