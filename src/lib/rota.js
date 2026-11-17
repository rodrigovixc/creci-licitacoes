// Rota pelo endereço: #secao ou #secao/item (ex.: #sabatina/Q054, #regras/RN-190, #prompts/i0).
import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

export const VISTAS = ['inicio', 'contexto', 'fluxo', 'regras', 'especificacao', 'sabatina', 'perguntas', 'arquitetura', 'prompts', 'cronograma']

export function lerRota() {
  const h = decodeURIComponent(window.location.hash.slice(1))
  if (h.startsWith('perguntas')) return { vista: 'perguntas', sub: [] } // a página da Diretoria usa âncoras #perguntas-N
  const [vista, ...sub] = h.split('/')
  return { vista: VISTAS.includes(vista) ? vista : 'inicio', sub }
}

export function ir(destino) {
  window.location.hash = destino
}

const semMovimento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function useRota() {
  const [rota, setRota] = useState(lerRota)
  const atual = useRef(rota.vista)
  useEffect(() => {
    const f = () => {
      const nova = lerRota()
      const mudouSecao = nova.vista !== atual.current
      atual.current = nova.vista
      const troca = () => {
        setRota(nova)
        if (mudouSecao) window.scrollTo(0, 0)
      }
      // troca de seção com a transição nativa do navegador; dentro da mesma seção, troca direta
      if (mudouSecao && document.startViewTransition && !semMovimento()) {
        const t = document.startViewTransition(() => flushSync(troca))
        // transição interrompida (janela redimensionada, outra troca) não é erro: a seção já trocou
        t.ready.catch(() => {})
        t.finished.catch(() => {})
      } else troca()
    }
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  return rota
}

// leva a tela até um elemento depois que a seção terminou de desenhar
export function rolarAte(id, bloco = 'start') {
  setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: semMovimento() ? 'auto' : 'smooth', block: bloco }), 80)
}
