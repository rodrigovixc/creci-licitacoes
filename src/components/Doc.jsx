// Mostra um trecho de documento já convertido para HTML pelo gerador (gerador/doc_site.py).
// Desenha os diagramas Mermaid (a biblioteca só carrega se houver diagrama) e põe o botão de copiar nos blocos de código.
import { useEffect, useRef } from 'react'

let serie = 0

export async function copiar(texto, botao) {
  try {
    await navigator.clipboard.writeText(texto)
    if (botao) {
      const antes = botao.textContent
      botao.textContent = 'Copiado'
      setTimeout(() => (botao.textContent = antes), 1600)
    }
  } catch {
    /* sem permissão de área de transferência: o texto continua selecionável */
  }
}

export default function Doc({ html, className = '', aoDesenhar }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    let vivo = true
    el.querySelectorAll('pre:not(.mermaid)').forEach((pre) => {
      if (pre.querySelector('button')) return
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'copiar'
      b.textContent = 'Copiar'
      b.onclick = () => copiar(pre.querySelector('code')?.textContent ?? '', b)
      pre.append(b)
    })
    const diagramas = [...el.querySelectorAll('pre.mermaid')]
    if (diagramas.length) {
      import('mermaid').then(async ({ default: mermaid }) => {
        const escuro = window.matchMedia('(prefers-color-scheme: dark)').matches
        mermaid.initialize({ startOnLoad: false, theme: escuro ? 'dark' : 'neutral', securityLevel: 'strict', fontFamily: 'Archivo, system-ui, sans-serif' })
        for (const pre of diagramas) {
          try {
            const { svg } = await mermaid.render('mmd' + ++serie, pre.textContent)
            if (!vivo) return
            const d = document.createElement('div')
            d.className = 'diagrama'
            d.innerHTML = svg
            // o diagrama fica no tamanho em que o texto se lê; se for mais largo que a coluna, rola para o lado
            const s = d.querySelector('svg')
            const natural = parseFloat(s?.style.maxWidth)
            if (natural) Object.assign(s.style, { width: natural + 'px', maxWidth: 'none' })
            pre.replaceWith(d)
          } catch {
            pre.classList.add('falhou') // diagrama que não desenha fica como texto
          }
        }
        if (vivo) aoDesenhar?.() // os diagramas mudam a altura da página: quem pediu uma âncora rola de novo
      })
    }
    return () => {
      vivo = false
    }
  }, [html])

  // âncora interna rola a página; referência a outra seção (classe "ref") segue pela rota; link externo abre em outra aba
  function aoClicar(e) {
    const a = e.target.closest('a')
    if (!a) return
    const href = a.getAttribute('href') || ''
    if (href.startsWith('#')) {
      if (a.classList.contains('ref')) return
      e.preventDefault()
      document.getElementById(decodeURIComponent(href.slice(1)))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (/^https?:/.test(href)) {
      a.target = '_blank'
      a.rel = 'noopener'
    } else e.preventDefault() // caminho de arquivo do repositório: não é endereço do site
  }

  return <div ref={ref} className={'prosa ' + className} onClick={aoClicar} dangerouslySetInnerHTML={{ __html: html }} />
}
