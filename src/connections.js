const { MongoClient, ServerApiVersion } = require('mongodb');
const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('./bolao_mongodb/data/config.json');
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
  // puppeteer: {
  //   executablePath: executablePath,
  // },
});
client.on('qr', (qr) => qrcode.generate(qr, { small: true }));

client.on('ready', async () => {
  const allChats = await client.getChats();
  allChats
    .filter((chat) => chat.isGroup && !chat.isReadOnly)
    .forEach(async (group) => {
      if (!Object.hasOwn(config.groups, group.id_serialized))
        config.groups = {
          ...config.groups,
          [group.id._serialized]: { palpiteiros: [] },
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
