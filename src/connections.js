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
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', //Macos
    // executablePath: '/usr/bin/google-chrome-stable', // Linux
  }
});
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