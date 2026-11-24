# Compras, licitações e contratos do CRECI-ES

Site que documenta o projeto inteiro: o fluxo-alvo de compras do CRECI-ES, a especificação, a sabatina jurídica, a arquitetura do sistema, os prompts que conduzirão a construção e o cronograma. Serve para apresentar o projeto à Diretoria e aos setores, e como registro público do método.

## Seções

| Endereço | O que traz |
|---|---|
| `#` | Página inicial: as fases do fluxo, o índice do site e a situação da construção |
| `#contexto` | O problema, o método, a linha do tempo e as regras do projeto |
| `#fluxo` | O fluxo em rolagem vertical, com rolagem lateral nas decisões |
| `#regras` | Regras de negócio e casos de uso (`#regras/RN-190`, `#regras/UC-01`) |
| `#especificacao` | A especificação completa, uma parte por vez (`#especificacao/5`) |
| `#sabatina` | As 100 perguntas com resposta, réplica e tréplica, e o registro de decisões (`#sabatina/Q054`, `#sabatina/decisao-18`) |
| `#perguntas` | Perguntas que a Diretoria pode fazer |
| `#arquitetura` | Por que esta arquitetura, como funciona, os ADRs e a construção (`#arquitetura/ADR-015`) |
| `#diagramas` | Os dez diagramas interativos do sistema (`#diagramas/architecture`, `#diagramas/erd`...) |
| `#prompts` | O ciclo com revisor independente, as rodadas e os 15 prompts (`#prompts/i0`) |
| `#cronograma` | As etapas em dias úteis, em dois cenários de dedicação |

Os códigos citados nos textos (RN, UC, ADR, Q e decisão) são links para a seção que os explica.

## Rodar

```bash
npm install
npm run dev
```

## Publicar

A Netlify lê o `netlify.toml`: roda `npm run build` e publica a pasta `dist`.

## Dados

Nada em `src/data` é editado à mão. Os arquivos saem de dois scripts do projeto `compras-licitacoes-contratos`:

- `gerador/doc_minigame.py` gera `src/data/fluxo.json` (a partir do `textos16.json` e dos exemplos do `gen16.py`) e `src/data/arquitetura.json` (de `docs/arquitetura/arquitetura-site.json`).
- `gerador/doc_site.py` gera `src/data/docs/`: contexto, regras, sabatina, arquitetura, prompts, especificação e cronograma, lidos dos próprios documentos. Ele falha se uma referência não existir ou se o cronograma furar um prazo.

- `gerador/doc_diagramas.py` gera as páginas de `public/diagramas/` e o índice `src/data/diagramas.json`, a partir de `docs/diagramas/`.

Para mudar um texto do site, mude o documento de origem e rode o script.

## Movimento

As animações usam só recursos do navegador: transição de seção (View Transitions), animação pela rolagem e CSS. Quem pede menos movimento no sistema não vê animação. A biblioteca Mermaid só carrega nas páginas que têm diagrama.
