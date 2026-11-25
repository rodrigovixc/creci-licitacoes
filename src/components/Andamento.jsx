// Visão "Andamento" da aba Arquitetura: fatias de cada etapa, rodadas de revisão, paradas, documentos e itens para a c2.
// Dados em src/data/docs/andamento.json, gerados por gerador/doc_site.py a partir de docs/prompts e docs/prompts/rodadas.
// O texto longo fica fechado: abre ao clicar no título.
import A from '../data/docs/andamento.json'
import ARQ from '../data/arquitetura.json'
import Doc from './Doc'

const GRAV = { bloqueante: ['bloqueante', 'bloqueantes'], importante: ['importante', 'importantes'], menor: ['menor', 'menores'] }
const COR = { aprovada: 'feito', 'em-correcao': 'andamento', 'sem-veredito': 'andamento', 'sem-mudanca': 'feito', parada: 'pendente', 'parada-respondida': 'pendente', 'nao-iniciada': 'planejado' }

const Html = ({ h }) => <span dangerouslySetInnerHTML={{ __html: h }} />

function Contagem({ c }) {
  const partes = Object.entries(c).filter(([, n]) => n)
  if (!partes.length) return <span className="and-cont">sem achados</span>
  return (
    <span className="and-cont">
      {partes.map(([g, n]) => <b key={g} className={'g-' + g}>{n} {GRAV[g][n === 1 ? 0 : 1]}</b>)}
    </span>
  )
}

function Rodada({ e }) {
  const ok = e.veredito === 'APROVADO'
  return (
    <details className="dobra and-evento" id={e.ancora}>
      <summary>
        <span className={'carimbo ' + (ok ? 'ok' : e.veredito === 'REPROVADO' ? 'no' : 'meio')}>{e.veredito}</span>
        <span>{e.rotulo} · rodada {e.n}</span>
        <small className="and-data">{e.data}</small>
        <Contagem c={e.contagem} />
      </summary>
      <div className="and-corpo">
        <p className="and-meta"><b>Fatia:</b> {e.fatiaNome}</p>
        <p className="and-meta"><b>Entregue ao revisor:</b> <Html h={e.entregue} /></p>
        <p className="and-meta"><b>Checagens:</b> <Html h={e.checagens} /></p>
        {e.achados.length > 0 && (
          <>
            <h4>Achados</h4>
            <ol className="and-achados">
              {e.achados.map((a) => (
                <li key={a.n}>
                  <details className={'and-achado g-' + a.g}>
                    <summary>
                      <span className={'and-grav g-' + a.g}>{GRAV[a.g][0]}</span>
                      <b>{a.n}.</b> <Html h={a.onde} />
                    </summary>
                    <div className="prosa">
                      <p><Html h={a.evidencia} /></p>
                      <p><b>Fecha quando:</b> <Html h={a.fecha} /></p>
                    </div>
                  </details>
                </li>
              ))}
            </ol>
          </>
        )}
        {e.anteriores && <p className="and-meta"><b>Achados anteriores:</b> <Html h={e.anteriores} /></p>}
        <details className="and-achado">
          <summary><b>O que o revisor conferiu</b></summary>
          <Doc html={e.conferido} />
        </details>
        {e.mudou && <p className="and-meta"><b>O que mudou depois:</b> <Html h={e.mudou} /></p>}
      </div>
    </details>
  )
}

function Parada({ e, registro }) {
  return (
    <details className="dobra and-evento" id={e.ancora}>
      <summary>
        <span className="carimbo meio">Parada</span>
        <span>{e.respondida ? 'Com resposta do responsável' : 'Aguarda o responsável'}</span>
        <small className="and-data">{e.data}</small>
      </summary>
      <div className="and-corpo">
        <p className="and-meta"><b>Motivo:</b> <Html h={e.motivo} /></p>
        <h4>Pergunta ao responsável</h4>
        <blockquote className="prosa"><Html h={e.pergunta} /></blockquote>
        {e.respondida && (
          <p className="and-meta">
            <b>Resposta:</b> recebida em {e.datasResposta.join(' e ')}. O texto fica só no registro <code>{registro}</code>, porque a mensagem do responsável não vai para o site (protocolo, seção 6, regra 2).
          </p>
        )}
      </div>
    </details>
  )
}

function SemMudanca({ e }) {
  return (
    <details className="dobra and-evento" id={e.ancora}>
      <summary>
        <span className="carimbo">Sem mudança</span>
        <span>{e.rotulo}{e.fatiaNome && e.fatiaNome !== e.rotulo ? ' · ' + e.fatiaNome : ''}</span>
        <small className="and-data">{e.data}</small>
      </summary>
      <div className="and-corpo">
        <p className="and-meta">A mudança desta etapa não toca a fatia. A rodada da fatia seguinte a confere (protocolo, seção 2, passo 4).</p>
        {e.nota && <Doc html={e.nota} />}
      </div>
    </details>
  )
}

function Impacto({ e }) {
  return (
    <details className="dobra and-evento" id={e.ancora}>
      <summary>
        <span className="carimbo">Impacto</span>
        <span><Html h={e.origem} /></span>
        <small className="and-data">{e.data}</small>
      </summary>
      <div className="and-corpo">
        <p className="and-meta">A lista do que a mudança toca, gravada na fatia 1 da etapa.</p>
        <Doc html={e.html} />
      </div>
    </details>
  )
}

const EVENTO = { rodada: Rodada, parada: Parada, 'sem-mudanca': SemMudanca, impacto: Impacto }

function Etapa({ et }) {
  return (
    <article className="and-etapa" id={'andamento-' + et.id}>
      <h2>
        <span className="cod">{et.id}</span> {et.nome}
        <span className={'arq-pill s-' + et.status}>{ARQ.status[et.status]}</span>
      </h2>
      <p className="and-links">
        <a className="ref" href={'#prompts/' + et.id}>prompt da etapa</a>
        <code>{et.arquivo}</code>
      </p>
      {et.intro && <Doc html={et.intro} />}

      {et.fatias.length > 0 && (
        <>
          <h3>Fatias</h3>
          <ul className="arq-itens and-fatias">
            {et.fatias.map((f) => (
              <li key={f.ancora} id={f.ancora} className={'s-' + COR[f.sit]}>
                <span>{A.situacoes[f.sit]}</span>
                {f.n != null && <>{f.n}. </>}{f.t}
                {f.rodadas > 0 && <small> · {f.rodadas} {f.rodadas === 1 ? 'rodada' : 'rodadas'}</small>}
              </li>
            ))}
          </ul>
        </>
      )}

      {et.eventos.length > 0 && (
        <>
          <h3>Rodadas e paradas</h3>
          <p className="arq-dica">Clique numa rodada para ver os achados, e num achado para ver a evidência.</p>
          {et.eventos.map((e) => {
            const Evento = EVENTO[e.tipo]
            return <Evento key={e.ancora} e={e} registro={et.registro} />
          })}
        </>
      )}

      {et.docs.length > 0 && (
        <>
          <h3>Documentos da etapa</h3>
          <p className="arq-dica">Os documentos aparecem como estão no repositório. Enquanto a fatia que escreve o documento não for aprovada, ele é rascunho.</p>
          {et.docs.map((d) => d.link
            ? (
              <p key={d.arquivo} className="and-meta and-doc-link">
                <a href={d.link}>{d.titulo}</a> <code className="and-arq">{d.arquivo}</code>
              </p>
            )
            : (
              <details key={d.arquivo} className="dobra">
                <summary>{d.titulo} <code className="and-arq">{d.arquivo}</code></summary>
                <Doc html={d.html} />
              </details>
            ))}
        </>
      )}
    </article>
  )
}

export default function Andamento() {
  return (
    <div className="andamento">
      <p className="arq-dica">
        Aqui fica o registro de cada etapa, gerado do repositório dos documentos. Ele mostra a situação de cada fatia e as rodadas do revisor independente. Mostra também as paradas, com a pergunta ao responsável, e os documentos que a etapa escreveu.
      </p>
      {A.etapas.length === 0 && <p>Nenhuma etapa tem registro de rodada ainda.</p>}
      {A.etapas.map((et) => <Etapa key={et.id} et={et} />)}

      <section className="and-etapa" id="andamento-c2">
        <h2>Itens abertos para a etapa c2</h2>
        <p className="arq-dica">Outra etapa achou o que a especificação precisa mudar. A etapa c2 marca cada item quando o trata.</p>
        <ul className="and-c2">
          {A.itensC2.map((i, k) => (
            <li key={k}>
              <p className="and-meta">
                <small className="and-data">{i.data}</small> · {i.origem}
                {i.tratado && <span className="arq-pill s-feito">tratado na versão {i.tratado}</span>}
              </p>
              <p><Html h={i.texto} /></p>
              <p className="and-meta"><b>Fonte:</b> <Html h={i.fonte} /></p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
