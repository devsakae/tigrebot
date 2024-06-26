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
const forum = mongoclient.db('quotes').collection('tigrelog');
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
    headless: true,
    executablePath: executablePath,
    // args: [
    //   "--no-sandbox",
    //   "--no-first-run",
    //   "--disable-setuid-sandbox",
    //   "--disable-dev-shm-usage",
    //   "--disable-accelerated-2d-canvas",
    //   "--disable-gpu",
    //   "--single-process",
    //   "--no-zygote",
    // ],
  },
  // webVersion: "2.2409.2",
  // webVersionCache: {
  //   type: 'remote',
  //   remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2409.2.html',
  // }
});

// client.on('qr', async (qr) => {
//   console.log('QR RECEIVED', qr);
//   const pairingCode = await client.requestPairingCode(process.env.BOT_NUMBER); // enter the target phone number
//   console.log('Pairing code enabled, code: '+ pairingCode);
// })

client.on('qr', (qr) => qrcode.generate(qr, { small: true }));

client.on('loading_screen', async (percent, message) => {
  console.log('LOADING SCREEN', percent, message);
});

client.on('authenticated', () => {
  console.log('AUTHENTICATED');
});

client.on('ready', async () => {
  console.info('Conectado!')
  // console.info('\nConfigurando grupos e canais...');
  // const allChans = await client.getChannels();
  // allChans
  //   .filter((chan) => !chan.isReadOnly)
  //   .forEach((mine) => {
  //     config.canais = { [mine.id._serialized]: mine.name };
  //     console.info('✔️ ', mine.name, '[canal]');
  //   });
  // const allChats = await client.getChats();
  // await Promise.all(allChats.filter(c => !c.isGroup).map(async c => await c.delete()));
  // await Promise.all(allChats
  //   .filter((group) => !group.isReadOnly && group.isGroup)
  //   .map(async (group) => {
  //     if (Object.hasOwn(config.grupos, group.id_serialized) && config.groups[group.id_serialized]?.palpiteiros.length > 0) return '';
  //     // if (group.id._serialized.endsWith('-1401890927@g.us')) return '';
  //     // if (group.id._serialized.includes('newsletter')) return '';
  //     // await group.clearMessages();
  //     config.grupos[group.id._serialized] = {
  //       palpiteiros: [],
  //       grupo: true
  //     };
  //     console.log('✔️ ', group.name, '[grupo]');
  //     // const totalMessages = await group.fetchMessages({ limit: 10 });
  //     // await Promise.all(totalMessages.filter(m => m.ack === 1).map(async m => await group.sendSeen(m.id._serialized)))
  //   }));
  // fs.writeFileSync(
  //   './data/tigrebot.json',
  //   JSON.stringify(config, null, 4),
  //   'utf-8',
  //   (err) => console.error(err),
  // );
  // const today = new Date()
  // console.info(today.toLocaleString('pt-br'));
  console.info('\n### TigreBot rodando! ###');
  return await client.sendMessage(process.env.BOT_OWNER, 'O pai tá on');
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
  forum,
};
