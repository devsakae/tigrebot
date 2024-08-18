
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

* [Setting Up Node.js on Amazon EC2 Instance](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html)
* git
* pm2
* google-chrome-stable
* `npm install` para instalar as demais dependências
* Indicar o IP da instância no servidor [MongoDB](http://www.mongodb.com)

#### Rodando o Bot

`npm start`

`npm --name "Tigrebot" -- start` (persistente)

Abrir o WhatsApp no celular para conectar com QR Code ([Ou use Pairing Code Login](https://github.com/pedroslopez/whatsapp-web.js/pull/2816)).
## Canal ao vivo

Você pode acessar o [canal do Tigrebot](http://devsakae.vercel.app/tigrebot) ao vivo por aqui e conferir as mensagens enviadas pelo Bot.