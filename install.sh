#!/bin/bash

printf "\n### Bem vindo ao TigreBot v1.0.0 ###\n"
if ! test -f ./src/bolao/data/data.json; then
  printf "\n✔ Criando arquivo de configurações"
  cp ./src/bolao/data/example.json ./src/bolao/data/data.json
fi
  node --env-file=.env index.js