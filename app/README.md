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

## Varíaveis de ambiente

- Para variáveis de ambiente **copiar** o arquivo de exemplo presente em `backend/.env.example` e `frontend/.env.example` para seus respectivos diretórios com o nome `.env` ficando `backend/.env` e `frontend/.env`.

**Obs.:** _Deve-se copiar os arquivos e não mover, para não perder os exemplos para outros ambientes_

## Instalação de dependências

- Dependencias do backend

```sh
cd backend
npm i
```

- Dependências do frontend

```sh
cd frontend
npm i
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
