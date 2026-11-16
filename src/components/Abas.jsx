// Abas do site, pelo endereço: #fluxo (padrão), #arquitetura e #perguntas.
const ABAS = [['fluxo', 'Fluxo'], ['arquitetura', 'Arquitetura'], ['perguntas', 'Perguntas da Diretoria']]

export default function Abas({ atual }) {
  return (
    <nav className="abas" aria-label="Seções do site">
      {ABAS.map(([k, t]) => (
        <a key={k} href={k === 'fluxo' ? '#' : '#' + k} aria-current={atual === k ? 'page' : undefined} onClick={() => window.scrollTo({ top: 0 })}>{t}</a>
      ))}
    </nav>
  )
}
