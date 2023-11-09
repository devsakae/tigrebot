const { MongoClient, ServerApiVersion } = require('mongodb');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const mongoclient = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db = mongoclient.db('quotes');
const tigrebot = mongoclient.db('tigrebot');

// Connection with QR Code
const client = new Client({ authStrategy: new LocalAuth() });
client.on('qr', (qr) => qrcode.generate(qr, { small: true }));

client.on('ready', () => {
  console.log('\nBot em funcionamento!\n')
  client.sendMessage(process.env.BOT_OWNER, 'O pai tá on');
});
client.initialize();

module.exports = {
  client,
  db,
  tigrebot,
  mongoclient,
}