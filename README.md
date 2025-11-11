# Fluxo Mesa

Aplicação Next.js da Mesa de Crédito com suporte a um backend Python modular.

## Frontend (Next.js)
- Executar em desenvolvimento:
  ```bash
  npm install
  npm run dev
  ```
- Testes e lint:
  ```bash
  npm test
  npm run lint
  ```
- Configuração de estilos:
  - A cadeia de build usa PostCSS com os plugins `@tailwindcss/postcss` e `autoprefixer` declarados em `postcss.config.mjs`.
  - Ajuste esse arquivo caso precise incluir novos plugins ou customizações ligadas ao Tailwind CSS.
- Conversão de BPMN para planilha:
  - No construtor de fluxos (página inicial) utilize o botão **Gerar Planilha (BPMN)** na barra lateral.
  - Selecione um arquivo `.bpmn` ou `.xml`. O sistema analisa as condições de risco e faixas de proposta e baixa um arquivo CSV no formato `valorEndividamento/valorProposta/RISCO/Assistente Sede/Analista I Sede/Outros usuarios`.
  - O arquivo considera as combinações de risco (baixo, médio e alto) e as faixas configuradas no script BPMN para apontar quais grupos participam das aprovações.

## Backend Python
A estrutura inicial do backend está no diretório [`python/`](python/README.md). Lá você encontra instruções para criar o ambiente virtual, instalar dependências e iniciar novos serviços.

Passos rápidos:
```bash
cd python
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e .
pip install -r requirements-dev.txt
```

## Boas práticas
- Atualize a documentação sempre que criar novos módulos ou fluxos.
- Utilize testes automatizados tanto no frontend quanto no backend para garantir qualidade.
- Prefira comunicações tipadas (TypeScript/Type Hints) entre serviços.
