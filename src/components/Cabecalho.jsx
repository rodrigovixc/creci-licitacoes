export default function Cabecalho({ D, caso, onCaso, onRecomeca, total, onPerguntas }) {
  return (
    <header className="cabecalho">
      <p className="sobre">CRECI-ES · Compras, licitações e contratos · fluxo v{D.V}</p>
      <h1>Da solicitação à extinção do contrato, um passo por vez</h1>
      <p className="intro">
        Role para baixo para seguir o processo. Quando chegar a uma decisão, role para o lado, escolha o caminho e continue descendo.
        Cada cartão traz quem faz e a base legal. Artigo sem lei indicada é da Lei 14.133/2021.
      </p>
      <p className="atalho-perguntas">
        <button type="button" className="limpa" onClick={onPerguntas}>Perguntas que a Diretoria pode fazer →</button>
      </p>
      <div className="casos">
        <span className="rotulo">Casos prontos</span>
        {D.M.map((m, j) => (
          <button type="button" key={j} className={caso === j ? 'ativo' : ''} onClick={() => onCaso(j)} title={m.s}>{m.t}</button>
        ))}
        <button type="button" className="limpa" onClick={onRecomeca}>Caminho padrão</button>
      </div>
      {caso != null && <p className="caso-sub">{D.M[caso].s}</p>}
      <p className="contagem">{total} cartões neste caminho</p>
    </header>
  )
}
