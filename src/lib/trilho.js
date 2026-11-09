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

// `fim`: último passo de um caso pronto; o trilho para ali com a marca "fim deste caso".
export function montar(D, inicio, escolhas, max = 400, fim = null) {
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
      // Volta a um passo já mostrado (ex.: 36 → 30, "próxima entrega ou mês"). O ciclo não se repete na tela:
      // o trilho passa em silêncio pelos passos já vistos e retoma no primeiro ainda não mostrado.
      // Na segunda passagem por uma decisão vale a escolha `id*` do caso; sem ela, a saída para uma fase posterior; senão a padrão.
      const de = itens[itens.length - 1].id
      const passa = []
      const ff = new Set()
      let prox = id
      while (prox && vistos.has(prox) && !ff.has(prox)) {
        ff.add(prox)
        const m = N[prox]
        if (!m || !m.v.length) { prox = null; break }
        let j = escolhas[prox + '*']
        if (j === undefined) j = m.v.findIndex(([a]) => !vistos.has(a) && N[a] && N[a].f > m.f)
        if (j === undefined || j < 0) j = padrao(prox, m)
        prox = m.v[j][0]
        if (prox !== id && vistos.has(prox)) passa.push(prox)
      }
      const segue = Boolean(prox) && !vistos.has(prox)
      itens.push({ k: 'volta', id, de, passa: segue ? passa : [] })
      if (!segue) break
      id = prox
      continue
    }
    vistos.add(id)
    itens.push({ k: 'no', id, linha })
    if (fim && id === fim) {
      itens.push({ k: 'fim', id, caso: true })
      break
    }
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
// Quando o caso passa duas vezes pelo mesmo passo (36 → 30 → 42), a segunda escolha fica na chave `id*`.
export function escolhasDoCaso(D, caminho) {
  const e = {}
  const vistos = new Set()
  caminho.forEach((a, k) => {
    const b = caminho[k + 1]
    const n = D.N[a]
    const chave = vistos.has(a) ? a + '*' : a
    vistos.add(a)
    if (!b || !n) return
    const i = n.v.findIndex(([x]) => x === b)
    if (i >= 0) { if (n.v.length > 1 && e[chave] === undefined) e[chave] = i; return }
    if (chave !== a) return
    // o exemplo pula um passo intermediário (ex.: 32 → 33c, sem citar o 33): escolhe nos dois
    n.v.forEach(([x, por], ix) => {
      const m = D.N[x]
      const j = m && !por ? m.v.findIndex(([y]) => y === b) : -1
      if (j >= 0 && m.v.length > 1) { e[a] = ix; e[x] = j }
    })
  })
  return e
}
