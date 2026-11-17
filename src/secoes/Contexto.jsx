// Contexto do projeto: o problema, o que se entrega, o método, a linha do tempo e as regras. Fonte: docs/contexto.md.
import C from '../data/docs/contexto.json'
import I from '../data/docs/indice.json'
import Doc from '../components/Doc'

export default function Contexto() {
  const sec = Object.fromEntries(C.secoes.map((s) => [s.id, s]))
  return (
    <section className="contexto">
      <h1>De onde o projeto veio e como foi feito</h1>
      <p className="intro">O problema que o CRECI-ES precisa resolver, o que já está pronto e o método usado para chegar até aqui.</p>

      <h2 id={sec['o-problema'].id}>{sec['o-problema'].t}</h2>
      <Doc html={sec['o-problema'].html} />

      <h2>Linha do tempo</h2>
      <ol className="linha-tempo">
        {C.linha.map((l, k) => (
          <li key={k} style={{ '--i': k }}>
            <time>{l.data}</time>
            <p dangerouslySetInnerHTML={{ __html: l.x }} />
          </li>
        ))}
      </ol>

      {['o-que-o-projeto-entrega', 'como-foi-feito', 'fontes-legais'].map((id) => (
        <div key={id}>
          <h2 id={id}>{sec[id].t}</h2>
          <Doc html={sec[id].html} />
        </div>
      ))}

      <h2 id="regras-do-projeto">Regras do projeto</h2>
      <p className="arq-dica">As quatro regras de redação valem para todo documento. As sete regras fixas valem para todo agente que executa um prompt.</p>
      <div className="duas">
        <div className="quadro"><h3>Redação</h3><Doc html={C.projeto} /></div>
        <div className="quadro"><h3>Regras fixas dos agentes</h3><Doc html={C.fixas} /></div>
      </div>

      <footer>Fonte: docs/contexto.md, README.md e docs/prompts/00-protocolo-loop.md. São {I.leis} textos legais salvos em gerador/leis.</footer>
    </section>
  )
}
