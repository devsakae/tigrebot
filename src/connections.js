const { MongoClient, ServerApiVersion } = require('mongodb');
const { Client, LocalAuth, Contact } = require('whatsapp-web.js');
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

const executablePath = process.platform == 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/google-chrome-stable';

// Connection with QR Code
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: executablePath
  }
});
client.on('qr', (qr) => qrcode.generate(qr, { small: true }));

client.on('ready', async () => {
  console.info('\nTigreBot rodando! Digite !help no canal para ver os comandos 😁')
  client.sendMessage(process.env.BOT_OWNER, 'O pai tá on');
  const allChats = await client.getChats();
  const rawGroups = allChats.filter((chat) => chat.isGroup);
  const confGroups = rawGroups.map(async (chat) => {
    console.info(`Criando database do grupo ${chat.name} ✔️ (ID ${chat.id._serialized})`);
    console.log('Getting participants of ', chat.name);
    const userList = await chat.participants.map(async (p) => {
      await client.getContactById(p.id._serialized)
        .then((participant) => ({
          id: participant.id._serialized,
          name: participant.name || participant.pushname,
          number: participant.number,
          isMe: participant.isMe
        }))
    })
    .filter((notme) => !notme.isMe);
    console.log(await userList);
    // await mongoclient.db(chat.id._serialized).collection('ranking').insertMany(userList)
    return chat.id._serialized
  });
  config.groups = confGroups;
  fs.writeFileSync('./src/bolao_mongodb/data/config.json', JSON.stringify(config, null, 4), 'utf-8', (err) => console.error(err));
});
client.initialize();

module.exports = {
  client,
  db,
  tigrebot,
  mongoclient,
  canais,
  bolao,
}