# Backend Python Setup

Este diretório abriga a estrutura inicial para futuros serviços em Python que complementarão a aplicação Next.js.

## Estrutura
- `pyproject.toml`: configuração do projeto Python usando o padrão PEP 621.
- `requirements-dev.txt`: dependências opcionais para desenvolvimento e qualidade de código.
- `src/`: módulo principal onde ficarão os pacotes e serviços da API.

## Como começar
1. Garanta que você tenha o Python 3.11 ou superior instalado.
2. Crie um ambiente virtual dedicado:
   ```bash
   cd python
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
   ```
3. Instale as dependências do projeto:
   ```bash
   pip install -e .
   pip install -r requirements-dev.txt
   ```
4. Adicione módulos dentro de `src/` e exporte-os através de `src/__init__.py`.

## Scripts sugeridos
Após instalar as dependências, os comandos abaixo ficam disponíveis:
- `pytest`: execute a suíte de testes.
- `ruff check src`: análise estática com Ruff.
- `mypy src`: verificação de tipos estáticos.

## Conversão de BPMN em planilhas
- `PYTHONPATH=src python -m bpmn_to_planilha <arquivo.bpmn> <saida.csv>`: gera a
  planilha de alçadas com base em um processo BPMN compatível com Activiti.
  O cabeçalho segue o padrão
  `Valor de Endividamento/Valor da Proposta/Score/Assistente PA/...` e inclui a
  coluna de valor representativo da proposta.

Um exemplo completo do fluxo **FluxoCiviaCartaoCreditoLimiteCredito** está em
`python/examples/`. Execute o comando abaixo (com o ambiente virtual ativado) para
gerar a planilha de referência:

```bash
cd python
PYTHONPATH=src python -m bpmn_to_planilha \
  examples/FluxoCiviaCartaoCreditoLimiteCredito.bpmn \
  FluxoCiviaCartaoCreditoLimiteCredito.csv
```

O arquivo CSV usa `/` como separador para refletir o formato fornecido pela Mesa
de Crédito.

## Integração com o Frontend
- Utilize APIs REST ou GraphQL para se comunicar com o frontend Next.js.
- Considere utilizar FastAPI para construir endpoints performáticos e tipados.

> Atualize este documento sempre que novos serviços Python forem adicionados.
