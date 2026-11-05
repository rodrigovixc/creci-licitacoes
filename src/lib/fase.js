// Nome e cor da fase de um nó. Linhas e células do quadro (passos 20 a 25) usam a fase 6.
export function faseDe(D, n, linha) {
  if (n.k === 'step') return { nome: D.F[n.f], cor: D.C[n.f] }
  const l = D.L[n.k === 'linha' ? n.f : linha || n.f]
  return { nome: l ? l.nome : D.F[6], cor: D.C[6] }
}
