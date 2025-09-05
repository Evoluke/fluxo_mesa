# Agent Instructions

## Business Objective
O sistema visa permitir que a Mesa de Crédito configure fluxos de alçada por meio de uma interface de arrastar e soltar.

## Contexto Técnico
- Aplicação web construída com [Next.js](https://nextjs.org) e TypeScript.
- A pasta `app` contém as páginas e roteamento do Next.js.
- Componentes reutilizáveis estão em `components/`.
- Hooks e utilidades em `hooks/` e `utils/`.

## Fluxo de Alçada
- O construtor de fluxos utiliza [React Flow](https://reactflow.dev).
- Componentes do construtor residem em `components/flow/`.
- Os nós disponíveis são `start` (Início) e `end` (Fim).
- `start` permite apenas uma conexão de saída e `end` apenas uma conexão de entrada.

## Instruções para Contribuidores
- Antes de enviar alterações, execute `npm test` e `npm run lint`.
- Descreva claramente no PR quais fluxos ou regras de alçada foram alterados.
