// Monta a sequência de cartões a partir das escolhas feitas nas decisões.
// Nada é inventado: os passos e as setas vêm de fluxo.json (gerado do textos16.json).

// Opção padrão de uma bifurcação: seta sem condição e para passo numérico; senão sem condição;
// senão o próximo passo numérico à frente; senão a primeira.
export function padrao(id, n) {
  if (id === '20') return Math.max(0, n.v.findIndex(([a]) => a === 'L:PE')) // pregão é a modalidade comum
  const num = parseInt(id, 10)
  const puro = (a) => /^\d+$/.test(a)
  let i = n.v.findIndex(([a, por]) => !por && puro(a))
  if (i < 0) i = n.v.findIndex(([, por]) => !por)
  if (i < 0) i = n.v.findIndex(([a]) => puro(a) && parseInt(a, 10) > num)
  return i < 0 ? 0 : i
}

export function montar(D, inicio, escolhas, max = 400) {
  const { N, L } = D
  const itens = []
  const vistos = new Set()
  let id = inicio
  let linha = null // linha do quadro em que o caminho está
  let fila = [] // células que faltam nessa linha
  while (id && itens.length < max) {
    const n = N[id]
    if (!n) break
    if (vistos.has(id)) {
      itens.push({ k: 'volta', id, de: itens[itens.length - 1].id })
      break
    }
    vistos.add(id)
    itens.push({ k: 'no', id, linha })
    if (n.k === 'linha') {
      linha = n.f
      fila = [...L[n.f].cells]
      id = fila.shift()
      continue
    }
    if (fila.length) {
      id = fila.shift()
      continue
    }
    if (linha) {
      const fim = L[linha].fim
      linha = null
      if (n.k === 'cell') {
        if (fim) { id = fim; continue }
        itens.push({ k: 'fim', id, linha: true })
        break
      }
    }
    if (!n.v.length) {
      itens.push({ k: 'fim', id })
      break
    }
    if (n.v.length === 1) {
      id = n.v[0][0]
      continue
    }
    const i = escolhas[id] ?? padrao(id, n)
    itens.push({ k: 'decisao', id, i })
    id = n.v[i][0]
  }
  return itens
}

// Escolhas que reproduzem um caso pronto (exemplo do diagrama), nas bifurcações que o caso atravessa.
export function escolhasDoCaso(D, caminho) {
  const e = {}
  caminho.forEach((a, k) => {
    const b = caminho[k + 1]
    const n = D.N[a]
    if (!b || !n) return
    const i = n.v.findIndex(([x]) => x === b)
    if (i >= 0) { if (n.v.length > 1) e[a] = i; return }
    // o exemplo pula um passo intermediário (ex.: 32 → 33c, sem citar o 33): escolhe nos dois
    n.v.forEach(([x, por], ix) => {
      const m = D.N[x]
      const j = m && !por ? m.v.findIndex(([y]) => y === b) : -1
      if (j >= 0 && m.v.length > 1) { e[a] = ix; e[x] = j }
    })
  })
  return e
}
