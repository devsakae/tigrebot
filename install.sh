#!/bin/bash

printf "\n### Bem vindo ao TigreBot v2026 ###"
printf "\nAcesse http://www.devsakae.com.br/tigrebot para mais informações"
printf "\n\nIniciando sistema..."
chmod 664 ./data/tigrebot.json
npm install
node --env-file=.env index.js