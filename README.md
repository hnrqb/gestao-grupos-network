# Plataforma de Gestão para Grupos de Networking

Aplicação monorepo composta por um backend NestJS e um frontend Next.js para administrar grupos de networking, cadastro de membros e fluxo de indicações.

## Stack Principal
- Backend: NestJS (TypeScript) + Prisma
- Frontend: Next.js 14 (React + TypeScript)
- Banco de dados: PostgreSQL 14+

## Requisitos
- Node.js 18 ou superior
- PostgreSQL 14 ou superior (local ou Docker)
- npm (ou yarn)

## Passo a Passo

### 1. Clonar o repositório
```bash
git clone <url-do-repositorio>
cd gestao-grupos-network
```

### 2. Preparar o banco de dados
Use uma instalação local ou um container Docker:
```bash
docker run --name networking-db -e POSTGRES_USER=networking -e POSTGRES_PASSWORD=networking -e POSTGRES_DB=networking_db -p 5432:5432 -d postgres:14
```

### 3. Backend
```bash
cd backend
npm install
cp .env.example .env
```
Edite o arquivo `.env` com os valores apropriados para seu ambiente (variáveis necessárias já estão listadas em `.env.example`). Em seguida, execute:
```bash
npx prisma migrate dev
npm run start:dev
```
O backend expõe as rotas em `http://localhost:3001/api/v1`.

### 4. Frontend
```bash
cd ../frontend
npm install
cp .env.example .env.local
```
Altere `.env.local` conforme necessário (valores padrão estão definidos no arquivo de exemplo) e rode o ambiente de desenvolvimento:
```bash
npm run dev
```
A interface ficará disponível em `http://localhost:3000`.

### 5. Fluxos principais
- Aplicações públicas: `http://localhost:3000/apply`
- Área administrativa (requer chave definida no backend): `http://localhost:3000/admin`
- Login administrativo: informe a chave configurada em `ADMIN_KEY`.
- APIs autenticadas por membros utilizam tokens JWT obtidos pelo fluxo de login de membros.

## Testes
Backend:
```bash
cd backend
npm test
```

## Observações
- Certifique-se de que `NEXT_PUBLIC_API_URL` (no frontend) aponta para `/api/v1`.
- Após alterar o schema Prisma, execute `npx prisma migrate dev`.
- Para recriar o banco em desenvolvimento: `npx prisma migrate reset`.
