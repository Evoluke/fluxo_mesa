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
