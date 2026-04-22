# 💰 Controle de Gastos Pessoal - Full Stack Project

> 🔗 **Acesse o projeto online:** [CLIQUE AQUI PARA VER O APP](https://controle-gastos-front-pi.vercel.app/)

💰 Controle de Gastos Pessoal - Full Stack Project
Este projeto é uma aplicação Full Stack de controle financeiro pessoal, desenvolvida para oferecer uma experiência intuitiva tanto em desktop quanto em dispositivos móveis. A aplicação permite o gerenciamento de receitas e despesas, visualização de dados através de gráficos e filtragem inteligente por períodos.

🚀 Tecnologias Utilizadas
O projeto foi construído utilizando as tecnologias mais modernas do mercado:

Frontend
React.js: Biblioteca principal para construção da interface de usuário.

Recharts: Biblioteca de gráficos para visualização dinâmica de receitas e despesas.

LocalStorage: Utilizado para persistência de sessão do usuário no navegador.

CSS-in-JS: Estilização responsiva focada em experiência mobile-first.

Backend
Python com Flask: Micro-framework para criação da API REST.

SQLite: Banco de dados relacional para armazenamento seguro de transações e usuários.

Flask-CORS: Gerenciamento de permissões de acesso entre diferentes origens.

Infraestrutura / Deploy
Vercel: Hospedagem do Frontend com integração contínua (CI/CD).

Render: Hospedagem da API e do servidor de banco de dados.

Git/GitHub: Controle de versão e versionamento de código.

🛠️ Funcionalidades Implementadas
Autenticação: Sistema de login para separar os dados por usuário.

Dashboard de Resumo: Cartões dinâmicos que somam Saldo Total, Entradas e Saídas baseados nos filtros aplicados.

Gráficos Interativos: Visualização por categorias através de gráficos de barras (com opção de ocultar/exibir para economizar espaço).

Filtros Avançados: Possibilidade de buscar transações por tipo (Receita/Despesa) e por intervalo de datas (Data Início até Data Fim).

Gestão de Lançamentos: Adição de descrição detalhada e funcionalidade de exclusão de registros.

Responsividade: Interface totalmente adaptada para uso em smartphones.

📈 Evolução do Projeto (Aprendizados Técnicos)
Durante o desenvolvimento, enfrentei e resolvi desafios reais de engenharia de software:

Migração de Persistência: Evoluí o sistema de armazenamento de arquivos CSV para um banco de dados relacional SQLite, garantindo maior integridade dos dados e suporte a consultas SQL.

Solução de Build no Vercel: Ajustei regras rigorosas de ESLint e tratei dependências de Hooks (useCallback, useEffect), garantindo que o código passasse nos testes de produção.

Deploy em Nuvem: Configurei a comunicação entre o frontend (Vercel) e o backend (Render), lidando com problemas de CORS e latência de rede.

UX Mobile: Implementei funções de toggle para os gráficos, focando na usabilidade em telas pequenas.

🔧 Como Rodar o Projeto Localmente
Clone o repositório:

Bash
git clone https://github.com/seu-usuario/seu-repositorio.git
Backend:

Bash
cd backend
pip install flask flask-cors
python api.py
Frontend:

Bash
cd frontend
npm install
npm start

📝 Notas sobre Infraestrutura
Atualmente, o projeto utiliza o plano gratuito do Render. Devido à natureza efêmera do sistema de arquivos desta plataforma, o banco de dados SQLite pode reiniciar periodicamente. Este comportamento é conhecido e faz parte das limitações do ambiente de demonstração gratuito.
