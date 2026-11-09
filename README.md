# Fluxo de compras do CRECI-ES

Site que conta o fluxo de compras, licitações e contratos do CRECI-ES (diagrama v16.4) em rolagem vertical. Nas decisões, a pessoa rola para o lado, escolhe o caminho e continua descendo. Feito para apresentar à Diretoria no lugar do diagrama Excalidraw.

## Rodar

```bash
npm install
npm run dev
```

## Publicar

A Netlify lê o `netlify.toml`: roda `npm run build` e publica a pasta `dist`.

## Dados

`src/data/fluxo.json` não é editado à mão. Ele é gerado pelo script `gerador/doc_minigame.py` do projeto `compras-licitacoes-contratos`, a partir do `textos16.json` e dos exemplos do `gen16.py`. A ordem das modalidades no passo 20 fica na lista `ORDEM_USO` desse script.

Cada passo com divulgação no PNCP traz o canal usado na implantação, o controle previsto no sistema a desenvolver e a integração futura com a API do PNCP, sem prazo (v16.4).
