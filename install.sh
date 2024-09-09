#!/bin/bash

printf "\n### Bem vindo ao TigreBot v3.5 ###"
printf "\nAcesse http://devsakae.vercel.app/tigrebot para mais informações"
printf "\n\nIniciando sistema..."
chmod 664 ./data/tigrebot.json
npm install
node --env-file=.env index.js