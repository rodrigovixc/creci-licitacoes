import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import D from './data/fluxo.json'
import { montar, escolhasDoCaso } from './lib/trilho'
import { useRota } from './lib/rota'
import Cabecalho from './components/Cabecalho'
import Fases from './components/Fases'
import Passo from './components/Passo'
import Decisao from './components/Decisao'
import Perguntas from './components/Perguntas'
import Nav from './components/Nav'
import Home from './components/Home'

// cada seção de documentação carrega com os próprios dados só quando abre
const SECOES = {
  contexto: lazy(() => import('./secoes/Contexto')),
  regras: lazy(() => import('./secoes/Regras')),
  especificacao: lazy(() => import('./secoes/Especificacao')),
  sabatina: lazy(() => import('./secoes/Sabatina')),
  arquitetura: lazy(() => import('./components/Arquitetura')),
  diagramas: lazy(() => import('./secoes/Diagramas')),
  prompts: lazy(() => import('./secoes/Prompts')),
  cronograma: lazy(() => import('./secoes/Cronograma')),
}
const LARGAS = ['arquitetura', 'diagramas', 'cronograma', 'especificacao', 'prompts']

const INICIO = '1'

export default function App() {
  const [escolhas, setEscolhas] = useState({})
  const [caso, setCaso] = useState(null)
  const [fase, setFase] = useState(1)
  const { vista, sub } = useRota()
  const fimDoCaso = caso == null ? null : D.M[caso].p[D.M[caso].p.length - 1]
  const itens = useMemo(() => montar(D, INICIO, escolhas, 400, fimDoCaso), [escolhas, fimDoCaso])

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
  }, [itens, vista])

  const passos = itens.filter((x) => x.k === 'no').length

  // da página inicial para o fluxo: troca a vista e, depois de desenhar, rola até a fase
  function irFase(k) {
    window.location.hash = 'fluxo'
    setTimeout(() => document.querySelector('.passo[data-fase="' + k + '"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400)
  }
  function irCaso(j) {
    window.location.hash = 'fluxo'
    abreCaso(j)
  }

  const Secao = SECOES[vista]
  let corpo
  if (vista === 'inicio') corpo = <main className="larga"><Home D={D} onCaso={irCaso} onFase={irFase} /></main>
  else if (vista === 'perguntas') corpo = <main><Perguntas D={D} /></main>
  else if (Secao) {
    corpo = (
      <main className={LARGAS.includes(vista) ? 'larga' : ''}>
        <Suspense fallback={<p className="carregando">Carregando…</p>}>
          <Secao sub={sub} />
        </Suspense>
      </main>
    )
  } else {
    corpo = (
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
                    {x.passa.length ? `. Passa de novo por ${x.passa.join(', ')} e segue abaixo.` : ''}
                  </button>
                )
              }
              const fimDoProcesso = D.N[x.id].fim
              return (
                <p key={'f' + k} className="marca fim">
                  {x.caso ? (fimDoProcesso ? 'Fim do processo e deste caso.' : 'Fim deste caso. Em modo livre, o fluxo segue pelas saídas do passo acima.') : fimDoProcesso ? 'Fim do processo.' : x.linha ? 'Fim desta linha do quadro.' : 'Este ramo termina aqui. Role para cima e escolha outro caminho.'}
                </p>
              )
            })}
          </div>
          <footer>
            Fonte: diagrama v{D.V} do fluxo de compras, licitações e contratos do CRECI-ES ({D.VD}). Os textos e as bases legais vêm do mesmo arquivo que gera o diagrama.
          </footer>
        </main>
      </>
    )
  }

  return (
    <div className="app">
      <span className="leitura" aria-hidden="true" />
      <Nav atual={vista} versao={D.V} />
      <div className="conteudo" data-vista={vista}>{corpo}</div>
    </div>
  )
}
