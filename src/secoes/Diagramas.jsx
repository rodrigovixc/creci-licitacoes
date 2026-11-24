// Diagramas do projeto: cada um é uma página HTML própria, em public/diagramas/,
// gerada por gerador/doc_diagramas.py a partir de docs/diagramas/<tipo>.json. Aqui o site só os lista e os mostra.
import { useEffect, useState } from 'react'
import LISTA from '../data/diagramas.json'
import { ir } from '../lib/rota'

// a pergunta que cada tipo de diagrama responde
const PERGUNTA = {
  architecture: 'De que partes o sistema é feito e como elas se ligam.',
  workflow: 'Quem faz o quê, em que ordem, e onde o caminho se divide.',
  sequence: 'Quem fala com quem, e em que ordem, num ato do processo.',
  dataflow: 'Por onde o dinheiro passa, do orçamento ao pagamento.',
  lifecycle: 'Em que situação um registro está e para onde ele pode ir.',
  erd: 'Que tabelas guardam os dados e como elas se relacionam.',
  class: 'Que classes o núcleo do sistema terá e como se ligam.',
  tree: 'Onde cada parte do código vai morar.',
  timeline: 'O que aconteceu, e quando, até aqui.',
  waterfall: 'Quanto tempo cada etapa vai levar, no calendário.',
}

export default function Diagramas({ sub }) {
  const pedido = LISTA.find((d) => d.tipo === sub[0])
  const [atual, setAtual] = useState(pedido || LISTA[0])
  useEffect(() => { if (pedido) setAtual(pedido) }, [sub[0]])

  if (!LISTA.length) return <section><h1>Diagramas</h1><p className="intro">Nenhum diagrama gerado ainda. Rode gerador/doc_diagramas.py.</p></section>

  return (
    <section className="diagramas">
      <h1>Diagramas do projeto</h1>
      <p className="intro">
        O mesmo sistema visto de vários ângulos. Cada diagrama é interativo: clique numa caixa para ver o detalhe, use a rota e a lente para seguir um caminho e exporte em imagem.
      </p>
      <div className="diag-grade">
        <nav className="diag-lista" aria-label="Diagramas">
          {LISTA.map((d) => (
            <button type="button" key={d.tipo} aria-pressed={d.tipo === atual.tipo} className={d.tipo === atual.tipo ? 'ativo' : ''}
              onClick={() => { setAtual(d); ir('diagramas/' + d.tipo) }}>
              {d.nome}
            </button>
          ))}
        </nav>
        <div className="diag-palco">
          <div className="diag-topo">
            <p><b>{atual.titulo}.</b> {PERGUNTA[atual.tipo]}</p>
            <a href={atual.arquivo} target="_blank" rel="noopener">Abrir em tela inteira</a>
          </div>
          <iframe key={atual.tipo} src={atual.arquivo} title={atual.titulo} loading="lazy" />
        </div>
      </div>
      <footer>Fonte: docs/diagramas, gerados por gerador/doc_diagramas.py a partir da arquitetura 2.0, da especificação 1.4.1 e do fluxo v16.5. O sistema descrito ainda não está construído.</footer>
    </section>
  )
}
