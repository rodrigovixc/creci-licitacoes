// Sumário do site: trilho lateral no computador, barra com menu no celular.
import { useEffect, useState } from 'react'
import I from '../data/docs/indice.json'
import DIAG from '../data/diagramas.json'

export const SECOES = [
  ['O projeto', [['inicio', 'Início'], ['contexto', 'Contexto']]],
  ['O processo', [['fluxo', 'Fluxo passo a passo'], ['regras', 'Regras e casos de uso', I.rn + I.uc], ['especificacao', 'Especificação']]],
  ['A crítica', [['sabatina', 'Sabatina jurídica', I.perguntas], ['perguntas', 'Perguntas da Diretoria', I.diretoria]]],
  ['A construção', [['arquitetura', 'Arquitetura', I.adrs], ['diagramas', 'Diagramas', DIAG.length], ['prompts', 'Prompts em loop', I.prompts], ['cronograma', 'Cronograma']]],
]

export default function Nav({ atual, versao }) {
  const [aberto, setAberto] = useState(false)
  useEffect(() => setAberto(false), [atual])
  return (
    <header className={'nav' + (aberto ? ' aberto' : '')}>
      <div className="nav-topo">
        <a className="nav-marca" href="#">
          <b>CRECI-ES</b>
          <span>Compras, licitações e contratos</span>
        </a>
        <button type="button" className="nav-botao" aria-expanded={aberto} aria-controls="nav-lista" onClick={() => setAberto(!aberto)}>
          {aberto ? 'Fechar' : 'Seções'}
        </button>
      </div>
      <nav id="nav-lista" className="nav-lista" aria-label="Seções do site">
        {SECOES.map(([grupo, itens]) => (
          <div key={grupo} className="nav-grupo">
            <p>{grupo}</p>
            {itens.map(([k, t, n]) => (
              <a key={k} href={k === 'inicio' ? '#' : '#' + k} aria-current={atual === k ? 'page' : undefined}>
                {atual === k && <i className="nav-marcador" />}
                <span>{t}</span>
                {n != null && <small>{n}</small>}
              </a>
            ))}
          </div>
        ))}
        <p className="nav-pe">Fluxo versão {versao}. Especificação {I.spec}.</p>
      </nav>
    </header>
  )
}
