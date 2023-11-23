const { MongoClient, ServerApiVersion } = require('mongodb');
const { Client, LocalAuth } = require('whatsapp-web.js');
const tigrebot_config = require('../data/tigrebot.json');
const config = require('./bolao_mongodb/data/config.json');
const channel_config = require('./canal/data/canal.json');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const mongoclient = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db = mongoclient.db('quotes');
const criciuma = mongoclient.db('criciuma');
const tigrebot = mongoclient.db('tigrebot');
const canais = mongoclient.db('canal_whatsapp');
const bolao = mongoclient.db('bolao');

const executablePath =
  process.platform == 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : '/usr/bin/google-chrome-stable';

// Connection with QR Code
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: executablePath,
  },
});
client.on('qr', (qr) => qrcode.generate(qr, { small: true }));

client.on('ready', async () => {
  console.info('Conectado!')
  console.info('\nConfigurando canais...');
  const allChans = await client.getChannels();
  allChans
    .filter((chan) => !chan.isReadOnly)
    .forEach((mine) => {
      tigrebot_config.canal = { [mine.id._serialized]: mine.name };
      channel_config.canais = { [mine.id._serialized]: mine.name };
      console.info('✔️ ', mine.name);
    });
  fs.writeFileSync(
    './src/canal/data/canal.json',
    JSON.stringify(channel_config, null, 4),
    'utf-8',
    (err) => console.error(err),
  );

  console.info('\nConfigurando grupos...');
  const allChats = await client.getChats();
  allChats
    .filter((chat) => chat.isGroup && !chat.isMuted)
    .forEach(async (group) => {
      tigrebot_config.grupo = {
        [group.id._serialized]: {
          palpiteiros: [],
          ...tigrebot_config.grupo[group.id._serialized],
        },
      };
      config.groups = {
        [group.id._serialized]: {
          palpiteiros: [],
          ...config.groups[group.id._serialized],
        },
      };
      console.log('✔️ ', group.name);
      await group.clearMessages();
    });
  fs.writeFileSync(
    './src/bolao_mongodb/data/config.json',
    JSON.stringify(config, null, 4),
    'utf-8',
    (err) => console.error(err),
  );
  fs.writeFileSync(
    './data/tigrebot.json',
    JSON.stringify(tigrebot_config, null, 4),
    'utf-8',
    (err) => console.error(err),
  );

  console.info(
    '\nTigreBot rodando! Digite !help no canal para ver os comandos 😁',
  );
  client.sendMessage(process.env.BOT_OWNER, 'O pai tá on');
});
client.initialize();

module.exports = {
  client,
  db,
  tigrebot,
  mongoclient,
  canais,
  bolao,
  criciuma,
};
