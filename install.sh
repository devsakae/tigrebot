#!/bin/bash

printf "\n### Bem vindo ao BolãoBot v2.0 - http://bolao.devsakae.tech ###\n"
if ! test -f ./src/bolao/data/data.json; then
  printf "\n✔ Criando arquivo de configurações"
  cp ./src/bolao/data/example.json ./src/bolao/data/data.json
fi
  node --env-file=.env index.js