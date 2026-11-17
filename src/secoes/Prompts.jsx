// Prompts por etapa, com revisor em loop: o ciclo, as rodadas de revisão dos próprios prompts, os 15 prompts e o protocolo.
// Fonte: docs/prompts.
import { useEffect, useState } from 'react'
import P from '../data/docs/prompts.json'
import A from '../data/arquitetura.json'
import Doc, { copiar } from '../components/Doc'
import { ir, rolarAte } from '../lib/rota'
import { useVisto } from '../lib/visto'

const CICLO = [
  ['Executar a fatia', 'O executor faz uma parte do trabalho, na ordem que o prompt dá.'],
  ['Rodar as checagens', 'Cada checagem de máquina tem uma meta. Todas precisam bater.'],
  ['Fazer o commit', 'Na branch de trabalho. Correção de rodada é commit novo.'],
  ['Chamar o revisor', 'Outro agente, com contexto novo. Recebe só caminhos, nunca resumo nem conclusão.'],
  ['Tratar o veredito', 'Aprovado: próxima fatia. Reprovado: o executor corrige, e um revisor novo confere.'],
]

function Ciclo() {
  return (
    <div className="ciclo">
      <ol>
        {CICLO.map(([t, x], k) => (
          <li key={k} style={{ '--i': k }}>
            <b>{k + 1}</b>
            <strong>{t}</strong>
            <span>{x}</span>
          </li>
        ))}
      </ol>
      <p className="ciclo-volta"><span>Reprovado: volta ao passo 2, com revisor novo. Depois de três rodadas sem aprovar, o agente para e chama o responsável.</span></p>
    </div>
  )
}

function Rodadas() {
  const [ref, visto] = useVisto()
  const [aberta, setAberta] = useState(null)
  const R = P.rodadas
  return (
    <div ref={ref} className={'rodadas' + (visto ? ' visto' : '')}>
      <div className="rodadas-fila">
        {R.lista.map((r, k) => (
          <button type="button" key={r.n} className={'rodada' + (aberta === k ? ' ativa' : '')} style={{ '--i': k }} aria-expanded={aberta === k} onClick={() => setAberta(aberta === k ? null : k)}>
            <span className="rodada-n">Rodada {r.n}</span>
            <span className={'carimbo grande ' + (r.veredito === 'APROVADO' ? 'ok' : 'no')}>{r.veredito}</span>
            <span className="rodada-quem">{r.quem}</span>
          </button>
        ))}
      </div>
      {aberta != null && <div className="quadro"><h3>Rodada {R.lista[aberta].n}</h3><Doc html={R.lista[aberta].html} /></div>}
      {R.outras.map((o) => (
        <details key={o.t} className="dobra">
          <summary>{o.t}</summary>
          <Doc html={o.html} />
        </details>
      ))}
    </div>
  )
}

export default function Prompts({ sub }) {
  const alvo = sub[0] || ''
  const padrao = (P.etapas.find((e) => e.status === 'andamento') || P.etapas[0]).id
  const [sel, setSel] = useState(P.etapas.some((e) => e.id === alvo) ? alvo : padrao)
  const [parte, setParte] = useState(0)
  const e = P.etapas.find((x) => x.id === sel)
  const comando = P.como.replace('<arquivo da etapa>', e.arquivo.split('/').pop())

  useEffect(() => {
    if (P.etapas.some((x) => x.id === alvo)) {
      setSel(alvo); setParte(0)
      rolarAte('prompt')
    } else if (alvo) rolarAte(alvo)
  }, [alvo])

  return (
    <section className="prompts">
      <h1>Um prompt por etapa, com um revisor que só aprova o que conferiu</h1>
      <p className="intro">
        Cada etapa da construção tem um prompt para um agente de IA. O trabalho só fecha quando um segundo agente, sem acesso ao raciocínio do primeiro, aprova. Enquanto ele reprova, o ciclo recomeça.
      </p>

      <h2>O ciclo</h2>
      <Ciclo />

      <h2 id="rodadas">Os próprios prompts passaram pelo ciclo</h2>
      <p className="arq-dica">Revisores independentes conferiram cada afirmação dos prompts nas fontes do projeto e no código do ERP. Toque numa rodada para ver o que ela achou.</p>
      <Rodadas />

      <h2 id="prompt">Os {P.etapas.length} prompts</h2>
      <div className="prompts-grade">
        <nav className="prompts-lista" aria-label="Etapas">
          {P.etapas.map((x) => (
            <button type="button" key={x.id} className={'s-' + x.status + (x.id === sel ? ' ativo' : '')} aria-pressed={x.id === sel} onClick={() => { setSel(x.id); setParte(0); ir('prompts/' + x.id) }}>
              <b>{x.id}</b>
              <span>{x.nome.replace(/^Incremento \d · /, '')}</span>
              <small>{A.status[x.status]}</small>
            </button>
          ))}
        </nav>
        <div className="prompt">
          <h3>{e.titulo}</h3>
          <dl className="prompt-cab">
            {e.cab.map((c) => (
              <div key={c.k}><dt>{c.k}</dt><dd dangerouslySetInnerHTML={{ __html: c.v }} /></div>
            ))}
          </dl>
          <div className="prompt-uso">
            <code>{comando}</code>
            <button type="button" className="limpa" onClick={(ev) => copiar(comando, ev.currentTarget)}>Copiar o comando</button>
            <button type="button" className="limpa" onClick={(ev) => copiar(e.md, ev.currentTarget)}>Copiar o prompt inteiro</button>
          </div>
          <div className="arq-chips" role="tablist">
            {e.partes.map((p, k) => (
              <button type="button" role="tab" aria-selected={parte === k} key={k} className={parte === k ? 'ativo' : ''} onClick={() => setParte(k)}>{p.t}</button>
            ))}
          </div>
          <Doc key={sel + parte} html={e.partes[Math.min(parte, e.partes.length - 1)].html} />
        </div>
      </div>

      <h2 id="protocolo">O protocolo do loop</h2>
      <Doc html={P.protocolo.intro} />
      {P.protocolo.partes.map((p, k) => (
        <details key={k} className="dobra" open={k === 0}>
          <summary>{p.t}</summary>
          <Doc html={p.html} />
        </details>
      ))}
      <p><button type="button" className="limpa" onClick={(ev) => copiar(P.protocolo.md, ev.currentTarget)}>Copiar o protocolo inteiro</button></p>

      <footer>Fonte: docs/prompts. O script gerador/conferir_prompts.py falha se uma etapa ficar sem prompt ou se um prompt citar regra, caso de uso, ADR, decisão ou caminho que não existe.</footer>
    </section>
  )
}
