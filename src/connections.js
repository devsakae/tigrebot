const { MongoClient, ServerApiVersion } = require('mongodb');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// mongodb
const mongoclient = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db = mongoclient.db('quotes');
const forum = mongoclient.db('quotes').collection('tigrelog');
const criciuma = mongoclient.db('criciuma');
const tigrebot = mongoclient.db('tigrebot');
const canais = mongoclient.db('#channels')
const bolao = mongoclient.db('bolao');

// wweb.js
const executablePath =
  process.platform == 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : '/usr/bin/google-chrome-stable';

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    executablePath: executablePath,
  },
});

client.on('qr', (qr) => qrcode.generate(qr, { small: true }));

client.on('loading_screen', async (percent, message) => {
  console.log('LOADING SCREEN', percent, message);
});

client.on('authenticated', () => {
  console.log('AUTHENTICATED');
});

client.on('ready', async () => {
  console.info('\n### TigreBot rodando! ###');
  return await client.sendMessage(process.env.BOT_OWNER, 'O pai tá on');
});

client.initialize();

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = {
  client,
  db,
  tigrebot,
  mongoclient,
  canais,
  bolao,
  criciuma,
  forum,
  genAI,
};
