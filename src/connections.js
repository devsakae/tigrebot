const { MongoClient, ServerApiVersion } = require('mongodb');
const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('./bolao_mongodb/data/config.json');
const channel_config = require('./canal/data/canal.json');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { instagramThis } = require('./canal');

const mongoclient = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db = mongoclient.db('quotes');
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
  const allChans = await client.getChannels();
  allChans
    .filter((chan) => !chan.isReadOnly)
    .forEach((mine) => {
      channel_config.canais = {
        [mine.id._serialized]: mine.name,
      }
      console.log('✔️ Configurando canal', mine.name);
    });
  fs.writeFileSync(
    './src/canal/data/canal.json',
    JSON.stringify(channel_config, null, 4),
    'utf-8',
    (err) => console.error(err),
  );

  const allChats = await client.getChats();
  allChats
    .filter((chat) => chat.isGroup && !chat.isMuted)
    .forEach(async (group) => {
      config.groups = {
        [group.id._serialized]: {
          palpiteiros: [],
          ...config.groups[group.id._serialized],
        },
      };
      console.log('✔️ Limpando mensagens do grupo', group.name);
      await group.clearMessages();
    });
  fs.writeFileSync(
    './src/bolao_mongodb/data/config.json',
    JSON.stringify(config, null, 4),
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
};
