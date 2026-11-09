// Divulgação no PNCP (v16.4): quem divulga e por qual canal na implantação, o controle previsto
// no módulo de compras a desenvolver e a integração futura pela API do PNCP, sem prazo.
export default function Pncp({ m }) {
  return (
    <div className="pncp">
      <p className="pncp-tit">Divulgação no PNCP</p>
      <dl>
        <div className="agora"><dt>Na implantação</dt><dd>{m.implantacao}</dd></div>
        <div className="sistema"><dt>Controle no sistema a desenvolver</dt><dd>{m.controle}</dd></div>
        {m.integracao && <div className="depois"><dt>Integração futura, sem prazo</dt><dd>{m.integracao}</dd></div>}
      </dl>
    </div>
  )
}
