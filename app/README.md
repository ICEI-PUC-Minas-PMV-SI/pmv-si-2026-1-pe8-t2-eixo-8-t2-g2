# Configuração inicial

## Pré requisitos

_O projeto atual prevê duas opção de execução, não sendo necessário configurar ambas, apenas a que você se sentir mais confortável em utilizar_

- Opção 1: Node diretamente na máquina

| Nome | Versão mínima | Link de download                              |
| ---- | ------------- | --------------------------------------------- |
| Node | >= 24         | [Download](https://nodejs.org/pt-br/download) |

- Opção 2: Docker

  | Nome           | Versão mínima | Link de download                                                           |
  | -------------- | ------------- | -------------------------------------------------------------------------- |
  | Docker desktop | >= 2.1.5      | [Download](https://docs.docker.com/desktop/setup/install/windows-install/) |

## Links úteis

- [Instalação NodeJS (Opção 1)](https://youtu.be/LUnG_jKwPmA?t=72)
- [Instalação docker desktop (Opção 2)](https://www.youtube.com/watch?v=NKpmxGM6Pcw)

## Configuração extra para Opção 2 (Docker)

Na raíz do projeto executar:

```sh
docker-compose up -d
```

## Variáveis de ambiente

- Para variáveis de ambiente **copiar** o arquivo de exemplo presente em `backend/.env.example` e `frontend/.env.example` para seus respectivos diretórios com o nome `.env` ficando `backend/.env` e `frontend/.env`.

**Obs.:** _Deve-se copiar os arquivos e não mover, para não perder os exemplos para outros ambientes_

### Configurações principais do backend (.env)

```env
# Ambiente
NODE_ENV=development
SRV_PORT=3000

# Banco de dados
DATABASE_URL="file:./prisma/dev.db"  # SQLite (desenvolvimento)
# DATABASE_URL="postgresql://user:password@localhost:5432/dbname"  # PostgreSQL (produção)

# Segurança
SECRET_KEY="CHANGE_ME"
ENCRYPTION_KEY="CHANGE_ME"

# Email (configurar conforme provedor)
MAIL_PROVIDER="GENERIC"
MAIL_FROM="no-reply@local.test"
MAIL_HOST=localhost
MAIL_PORT=1025

# Google OAuth
GOOGLE_CLIENT_ID="sua_client_id"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
```

## Instalação de dependências

- Dependências do backend

```sh
cd backend
npm i
npm run db:migrate
```

- Dependências do frontend

```sh
cd frontend
npm i
```

## Migrations do Banco de Dados

As migrations estão organizadas em dois diretórios:

- **`prisma/migrations_sqlite/`** - Migrations para SQLite (desenvolvimento local)
- **`prisma/migrations_postgre/`** - Migrations para PostgreSQL (produção)

### Comandos úteis

```sh
# Criar e aplicar nova migration
npm run db:migrate

# Aplicar migrations pendentes
npm run db:apply

# Resetar banco de dados e reaplicar todas as migrations
npm run db:reset

# Popular banco com dados de exemplo
npm run db:seed
```

## Execução do ambiente

- Backend

```sh
cd backend
npm run dev
```

- Frontend

```sh
cd frontend
npm run dev
```
