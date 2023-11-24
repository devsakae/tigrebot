const { MongoClient, ServerApiVersion } = require('mongodb');
const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('../data/tigrebot.json');
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
const canais = mongoclient.db('#channels')
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
  console.info('\nConfigurando grupos e canais...');
  const allChans = await client.getChannels();
  allChans
    .filter((chan) => !chan.isReadOnly)
    .forEach((mine) => {
      config.canais = { [mine.id._serialized]: mine.name };
      console.info('✔️ ', mine.name);
    });
  const allChats = await client.getChats();
  await Promise.all(allChats
    .filter((chat) => chat.isGroup && !chat.isMuted)
    .forEach(async (group) => {
      config.grupos = {
        [group.id._serialized]: {
          palpiteiros: [],
          ...config.grupos[group.id._serialized],
        },
      };
      console.log('✔️ ', group.name);
      await group.sendSeen();
    }));
  fs.writeFileSync(
    './data/tigrebot.json',
    JSON.stringify(config, null, 4),
    'utf-8',
    (err) => console.error(err),
  );
  console.info('\n### TigreBot rodando! ###');
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
