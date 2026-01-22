
# Tigrebot

Um bot exclusivo para grupos e canais de torcedores do Criciúma Esporte Clube. Exclusividade Tigrelog.



## Autor

- [@Sakae](https://www.github.com/devsakae)


## Contribuições

Para contribuir, faça o fork e o PR que eu vou analisar. E agradecer.

## Variáveis de Ambiente

Utilize o arquivo `.env.example` como roteiro para preencher as variáveis de ambiente.

As duas primeiras devem ser preenchidas no formato:

`BOT_NUMBER = 551199998888@c.us`

`BOT_OWNER = 551198765432@c.us`


## Instalação

Este projeto inicialmente rodava em Ubuntu 20.04, e hoje roda em Amazon Linux 3 (AWS EC2).

Passo a passo na instância:

#### Programas/Apps necessários

Recomendação de uso do Ubuntu server (24.04).

##### Ubuntu Server 24.04

* conf .env
* install nodejs
  `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash`
  `\. "$HOME/.nvm/nvm.sh"`
  `nvm install 24`
* install git
* install pm2
* install `libgbm-dev libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libnss3 lsb-release xdg-utils wget`
* `npm install` para instalar as demais dependências
* Indicar o IP da instância no servidor [MongoDB](http://www.mongodb.com)

##### Amazon Linux 2023

* [Setting Up Node.js on Amazon EC2 Instance](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html)
* google-chrome-stable `curl https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm --output /tmp/google-chrome-stable_current_x86_64.rpm`
`sudo yum install -y /tmp/google-chrome-stable_current_x86_64.rpm`
* headless gui `sudo yum install -y xorg-x11-server-Xvfb gtk3-devel libnotify-devel nss libXScrnSaver alsa-lib`
* `sudo timedatectl set-timezone America/Sao_Paulo` (EC2 sempre inicia uma instância com TZ 0)

#### Rodando o Bot

`npm start`

`npm --name "Tigrebot" -- start` (persistente)

Abrir o WhatsApp no celular para conectar com QR Code ([Ou use Pairing Code Login](https://github.com/pedroslopez/whatsapp-web.js/pull/2816)).
## Canal ao vivo

Você pode acessar o [canal do Tigrebot](http://devsakae.vercel.app/tigrebot) ao vivo por aqui e conferir as mensagens enviadas pelo Bot.