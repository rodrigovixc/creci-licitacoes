import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import D from './data/fluxo.json'
import { montar, escolhasDoCaso } from './lib/trilho'
import Cabecalho from './components/Cabecalho'
import Fases from './components/Fases'
import Passo from './components/Passo'
import Decisao from './components/Decisao'
import Perguntas from './components/Perguntas'
import Abas from './components/Abas'
import Home from './components/Home'

// o React Flow só carrega quando a aba Arquitetura abre
const Arquitetura = lazy(() => import('./components/Arquitetura'))

const INICIO = '1'

// vistas pelo endereço: início (padrão), fluxo (#fluxo), arquitetura (#arquitetura) e perguntas da Diretoria (#perguntas)
function vistaDoHash() {
  const h = window.location.hash
  return h.startsWith('#perguntas') ? 'perguntas' : h.startsWith('#arquitetura') ? 'arquitetura' : h.startsWith('#fluxo') ? 'fluxo' : 'inicio'
}

export default function App() {
  const [escolhas, setEscolhas] = useState({})
  const [caso, setCaso] = useState(null)
  const [fase, setFase] = useState(1)
  const [vista, setVista] = useState(vistaDoHash)
  useEffect(() => {
    const f = () => setVista(vistaDoHash())
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
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
    setTimeout(() => document.querySelector('.passo[data-fase="' + k + '"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
  }
  function irCaso(j) {
    window.location.hash = 'fluxo'
    abreCaso(j)
  }

  if (vista === 'inicio') {
    return (
      <main>
        <Abas atual={vista} />
        <Home D={D} onCaso={irCaso} onFase={irFase} />
      </main>
    )
  }

  if (vista === 'perguntas') {
    return (
      <main>
        <Abas atual={vista} />
        <Perguntas D={D} />
      </main>
    )
  }
  if (vista === 'arquitetura') {
    return (
      <main className="larga">
        <Abas atual={vista} />
        <Suspense fallback={<p className="arq-dica">Carregando o fluxograma…</p>}>
          <Arquitetura />
        </Suspense>
      </main>
    )
  }

  return (
    <>
      <Fases D={D} atual={fase} />
      <main>
        <Abas atual={vista} />
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
