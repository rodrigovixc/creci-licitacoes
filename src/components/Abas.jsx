// Abas do site, pelo endereço: início (padrão), #fluxo, #arquitetura e #perguntas.
const ABAS = [['inicio', 'Início'], ['fluxo', 'Fluxo'], ['arquitetura', 'Arquitetura'], ['perguntas', 'Perguntas da Diretoria']]

export default function Abas({ atual }) {
  return (
    <nav className="abas" aria-label="Seções do site">
      {ABAS.map(([k, t]) => (
        <a key={k} href={k === 'inicio' ? '#' : '#' + k} aria-current={atual === k ? 'page' : undefined} onClick={() => window.scrollTo({ top: 0 })}>{t}</a>
      ))}
    </nav>
  )
}
