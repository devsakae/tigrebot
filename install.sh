#!/bin/bash

printf "\n### Bem vindo ao TigreBot v32026 ###"
printf "\nAcesse http://www.devsakae.com.br/tigrebot para mais informações"
printf "\n\nIniciando sistema..."
chmod 664 ./tigrebot/data/tigrebot.json
npm install
node --env-file=.env index.js