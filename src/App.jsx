import { useEffect, useMemo, useState } from 'react'
import D from './data/fluxo.json'
import { montar, escolhasDoCaso } from './lib/trilho'
import Cabecalho from './components/Cabecalho'
import Fases from './components/Fases'
import Passo from './components/Passo'
import Decisao from './components/Decisao'

const INICIO = '1'

export default function App() {
  const [escolhas, setEscolhas] = useState({})
  const [caso, setCaso] = useState(null)
  const [fase, setFase] = useState(1)
  const itens = useMemo(() => montar(D, INICIO, escolhas), [escolhas])

  function escolhe(id, i) {
    setCaso(null)
    setEscolhas((e) => ({ ...e, [id]: i }))
  }
  function abreCaso(j) {
    setCaso(j)
    setEscolhas(escolhasDoCaso(D, D.M[j].p))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // fase em leitura: o cartão que cruza o terço superior da tela
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setFase(e.target.dataset.fase)),
      { rootMargin: '-30% 0px -60% 0px' }
    )
    document.querySelectorAll('.passo[data-fase]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [itens])

  const passos = itens.filter((x) => x.k === 'no').length

  return (
    <>
      <Fases D={D} atual={fase} />
      <main>
        <Cabecalho D={D} caso={caso} onCaso={abreCaso} onRecomeca={() => { setCaso(null); setEscolhas({}) }} total={passos} />
        <div className="trilho">
          {itens.map((x, k) => {
            if (x.k === 'no') return <Passo key={x.id} D={D} id={x.id} linha={x.linha} />
            if (x.k === 'decisao') return <Decisao key={'d' + x.id} D={D} id={x.id} i={x.i} onEscolhe={escolhe} />
            if (x.k === 'volta') {
              const por = D.N[x.de].v.find(([a]) => a === x.id)?.[1]
              return (
                <button type="button" key={'v' + k} className="marca volta" onClick={() => document.getElementById('p-' + x.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                  ↺ Volta ao passo {x.id}{por ? ': ' + por : ''}
                </button>
              )
            }
            const fimDoProcesso = /fim/i.test(D.N[x.id].t)
            return (
              <p key={'f' + k} className="marca fim">
                {fimDoProcesso ? 'Fim do processo.' : x.linha ? 'Fim desta linha do quadro.' : 'Este ramo termina aqui. Role para cima e escolha outro caminho.'}
              </p>
            )
          })}
        </div>
        <footer>
          Fonte: diagrama v16.3 do fluxo de compras, licitações e contratos do CRECI-ES (5 de novembro de 2026). Os textos e as bases legais vêm do mesmo arquivo que gera o diagrama.
        </footer>
      </main>
    </>
  )
}
