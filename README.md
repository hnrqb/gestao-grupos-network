# Plataforma de Gestão para Grupos de Networking

Sistema para digitalizar a gestão de grupos de networking focados em geração de negócios.

## 🚀 Stack Tecnológica

- **Frontend**: Next.js 14+ com React e TypeScript
- **Backend**: NestJS com TypeScript
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Testes Backend**: Jest
- **Testes Frontend**: Jest e React Testing Library
- **Estilização**: Tailwind CSS

## 📁 Estrutura do Projeto

```
gestao-grupos-network/
├── frontend/          # Aplicação Next.js
├── backend/           # Aplicação NestJS
├── README.md          # Este arquivo
└── arquitetura.md     # Documentação da arquitetura
```

## ⚙️ Pré-requisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

## 🛠️ Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd gestao-grupos-network
```

### 2. Configure o Banco de Dados

```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Ou via Docker
docker run --name postgres-networking -e POSTGRES_PASSWORD=123456 -d -p 5432:5432 postgres:14

# Criar banco de dados
createdb networking_db
# ou via SQL: CREATE DATABASE networking_db;
```

### 3. Configure o Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de configuração
cp .env.example .env

# Editar .env com suas configurações
nano .env
```

**Arquivo `.env` do Backend:**
```env
# Database
DATABASE_URL="postgresql://postgres:123456@localhost:5432/networking_db"

# Admin
ADMIN_KEY="admin123"  # Chave para acesso admin

# App
PORT=3001
NODE_ENV=development
```

```bash
# Executar migrações do Prisma
npx prisma migrate dev

# (Opcional) Executar seed para dados de teste
npx prisma db seed
```

### 4. Configure o Frontend

```bash
cd ../frontend

# Instalar dependências
npm install

# Copiar arquivo de configuração
cp .env.example .env.local

# Editar .env.local
nano .env.local
```

**Arquivo `.env.local` do Frontend:**
```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Admin
NEXT_PUBLIC_ADMIN_KEY=admin123  # Mesma chave do backend
```

## 🚀 Execução

### Desenvolvimento

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```
🌐 Backend rodando em: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
🌐 Frontend rodando em: http://localhost:3000

### Produção

**Backend:**
```bash
cd backend
npm run build
npm run start:prod
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## 📋 Funcionalidades Implementadas

### ✅ Fluxo de Admissão de Membros

1. **Página de Aplicação**: `/apply`
   - Formulário público para candidatos
   - Campos: Nome, Email, Empresa, "Por que participar?"

2. **Área Administrativa**: `/admin`
   - Lista de todas as aplicações
   - Aprovar/Rejeitar candidatos
   - Autenticação via header `x-admin-key`

3. **Cadastro Completo**: `/register/[token]`
   - Formulário expandido para candidatos aprovados
   - Acesso via token único gerado na aprovação

## 🧪 Testes

### Backend
```bash
cd backend

# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend
```bash
cd frontend

# Testes unitários
npm run test

# Testes em modo watch
npm run test:watch
```

## 🗄️ Banco de Dados

### Comandos úteis do Prisma

```bash
# Gerar client Prisma
npx prisma generate

# Ver banco no navegador
npx prisma studio

# Reset do banco (cuidado!)
npx prisma migrate reset

# Deploy de migrações em produção
npx prisma migrate deploy
```

### Schema Principal

- `applications` - Intenções de participação
- `invitation_tokens` - Tokens de convite
- `members` - Membros completos

## 🔧 Variáveis de Ambiente

### Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/networking_db"
ADMIN_KEY="admin123"
PORT=3001
NODE_ENV=development
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_ADMIN_KEY=admin123
```

## 📚 Endpoints da API

### Public
- `POST /api/applications` - Create application
- `GET /api/invitations/:token` - Validate token

### Admin (requires header `x-admin-key`)
- `GET /api/admin/applications` - List applications
- `POST /api/admin/applications/:id/approve` - Approve application
- `POST /api/admin/applications/:id/reject` - Reject application

### Registration
- `POST /api/members` - Complete registration

## 🐛 Troubleshooting

### Problema: Erro de conexão com o banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Ou via Docker
docker ps | grep postgres
```

### Problema: Porta já em uso
```bash
# Verificar processos na porta 3000/3001
lsof -i :3000
lsof -i :3001

# Matar processo se necessário
kill -9 <PID>
```

### Problema: Migrações do Prisma
```bash
# Limpar e recriar
npx prisma migrate reset
npx prisma migrate dev
```

## 📖 Documentação Adicional

- [Arquitetura do Sistema](./arquitetura.md)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do NestJS](https://docs.nestjs.com)
- [Documentação do Prisma](https://prisma.io/docs)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
