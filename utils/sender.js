const { client } = require('../src/connections');
const config = require('../data/tigrebot.json');
const { MessageMedia } = require('whatsapp-web.js');
const { site_publish } = require('./mongo');

const notDefendeAi = (dest) => (dest !== process.env.DEFENDE_AI);

const sendTextToGroups = async text => {
  for (dest of Object.keys(config.grupos)) {
    if (notDefendeAi(dest)) await client.sendMessage(dest, text)
  }
  await site_publish(text);
}

const sendTextToChannels = async text => {
  for (dest of Object.keys(config.canais)) {
    if (notDefendeAi(dest)) await client.sendMessage(dest, text)
  }
  await site_publish(text);
}

const echoToGroups = async text => {
  await Promise.all(Object.keys(config.grupos).map(async g => {if (notDefendeAi(g)) await client.sendMessage(g, text)}));
  await site_publish(text);
}
const echoToChannel = async text => {
  await Promise.all(Object.keys(config.canais).map(async c => { if (notDefendeAi(c)) await client.sendMessage(c, text)}));
  await site_publish(text);
}

const sendBolaoGroups = async text => {
  for (grupo of Object.keys(config.bolao.grupos)) {
    if (notDefendeAi(grupo)) await client.sendMessage(grupo, text);
  }
  await site_publish(text);
};

const sendMediaUrlToGroups = async media => {
  const mediaFile = await MessageMedia.fromUrl(media.url);
  for (grupo of Object.keys(config.grupos)) {
    if (notDefendeAi(grupo)) await client.sendMessage(grupo, mediaFile, { caption: media.caption })
  }
  await site_publish(media.caption);
}

const sendMediaUrlToChannels = async media => {
  const mediaFile = await MessageMedia.fromUrl(media.url);
  for (grupo of Object.keys(config.canais)) {
    await client.sendMessage(grupo, mediaFile, { caption: media.caption })
  }
  await site_publish(media.caption)
}

const sendInstagramToGroups = async media => {
  const mediaFile = await MessageMedia.fromUrl(media.url);
  const newCaption = media.caption + '\n\n📷 @' + media.owner + '\n🔗 ' + media.link + '\nCapturado e enviado até você por TigreBot ' + config.mysite;
  for (grupo of Object.keys(config.grupos)) {
    if (notDefendeAi(grupo)) await client.sendMessage(grupo, mediaFile, { caption: newCaption });
  }
  await site_publish(newCaption);
}

const sendInstagramToChannels = async media => {
  const mediaFile = await MessageMedia.fromUrl(media.url);
  const newCaption = media.caption + '\n\n📷 @' + media.owner + '\n🔗 ' + media.link;
  for (canal of Object.keys(config.canais)) {
    await client.sendMessage(canal, mediaFile, { caption: newCaption });
  }
  await site_publish(newCaption);
}

module.exports = {
  sendTextToGroups,
  sendTextToChannels,
  sendMediaUrlToGroups,
  sendMediaUrlToChannels,
  sendInstagramToGroups,
  sendInstagramToChannels,
  sendBolaoGroups,
  echoToGroups,
  echoToChannel,
}