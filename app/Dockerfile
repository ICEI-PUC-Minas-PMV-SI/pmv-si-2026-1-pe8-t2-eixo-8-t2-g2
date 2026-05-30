FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl \
    iputils-ping curl &&\
    npm i -g vercel &&\
    apt-get clean && rm -rf /var/lib/apt/lists/*