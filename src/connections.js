const { MongoClient, ServerApiVersion } = require('mongodb');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const config = require('../data/tigrebot.json');
const { saveLocal } = require('../utils');

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
  console.info('\nConfigurando grupos e canais...');
  const allChats = await client.getChats();
  // await Promise.all(allChats.filter(c => !c.isGroup).map(async c => await c.delete()));
  await Promise.all(allChats
    .filter((group) => !group.isReadOnly && group.isGroup)
    .map(async (group) => {
      if (Object.hasOwn(config.grupos, group.id_serialized) && config.groups[group.id_serialized]?.palpiteiros.length > 0) return '';
      if (group.id._serialized.endsWith('-1401890927@g.us')) return '';
      if (group.id._serialized.includes('newsletter')) return '';
      await group.clearMessages();
      console.log('✔️', group.name, '[' + group.id._serialized + ']');
      // const totalMessages = await group.fetchMessages({ limit: 10 });
      // await Promise.all(totalMessages.filter(m => m.ack === 1).map(async m => await group.sendSeen(m.id._serialized)))
    }));
  console.log('Gravando grupos no config...')
  saveLocal(config);
  const today = new Date()
  console.info('\n### TigreBot rodando -', today.toLocaleString('pt-br') + '! ###');
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
