const { MongoClient, ServerApiVersion } = require('mongodb');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const config = require('../data/tigrebot.json')

// api express
// const express = require("express");
// const api = express();
// api.use(express.json())
// api.listen(process.env.API_PORT, () => console.log("API rodando na porta " + process.env.API_PORT));

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
const db_bolao = mongoclient.db('bolao');

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

client.on('qr', async (qr) => {
  qrcode.generate(qr, { small: true })
  let pairingCodeRequested = false;
  const pairingCodeEnabled = true;
  if (pairingCodeEnabled && !pairingCodeRequested) {
      const pairingCode = await client.requestPairingCode(process.env.BOT_NUMBER.split('@')[0]);
      console.log('Pairing code enabled, code: '+ pairingCode);
      pairingCodeRequested = true;
  }
});

client.on('loading_screen', async (percent, message) => {
  console.log('LOADING SCREEN', percent, message);
});

client.on('authenticated', () => {
  console.log('AUTHENTICATED');
});

client.on('ready', async () => {
  console.info('\nConfigurando grupos e canais...');
  const allChats = await client.getChats();
  console.log("allchats:", allChats);
  await Promise.all(allChats
    .filter((group) => !group.isReadOnly && group.isGroup)
    .map(async (group) => {
      console.log('✔️', group.name, '[' + group.id._serialized + ']');
      await group.clearMessages();
      if (Object.hasOwn(config.grupos, group.id_serialized) && config.groups[group.id_serialized]?.palpiteiros.length > 0) return '';
      if (group.id._serialized.endsWith('-1401890927@g.us')) return '';
      if (group.id._serialized.includes('newsletter')) return '';
      if (group.id._serialized.includes('120363361730511399@g.us')) return ''
      config.grupos[group.id._serialized] = { "palpiteiros": [] };
    }));
  console.log('Gravando grupos em tigrebot.json...')
  fs.writeFileSync(
    './data/tigrebot.json',
    JSON.stringify(config, null, 4),
    'utf-8',
    (err) => console.error(err),
  );
  const today = new Date()
  console.info('\n### TigreBot rodando -', today.toLocaleString('pt-br') + '! ###');
  return await client.sendMessage(process.env.BOT_OWNER, 'O pai tá on');
});

client.initialize();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = {
  client,
  db,
  tigrebot,
  mongoclient,
  canais,
  db_bolao,
  criciuma,
  forum,
  genAI,
  // api,
};
