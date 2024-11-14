const { client } = require('../src/connections');
const config = require('../data/tigrebot.json');
const { MessageMedia } = require('whatsapp-web.js');
const { site_publish } = require('./mongo');

const sendTextToGroups = async text => {
  await Promise.all(Object.keys(config.grupos).map(async grupo => await client.sendMessage(grupo, text)));
  await site_publish(text);
}

const sendTextToChannels = async text => {
  await Promise.all(Object.keys(config.canais).map(async canal => await client.sendMessage(canal, text)));
  await site_publish(text);
}

const echoToGroups = async text => {
  await Promise.all(Object.keys(config.grupos).map(async grupo => await client.sendMessage(grupo, text)));
  await site_publish(text);
}

const echoToChannel = async text => {
  await Promise.all(Object.keys(config.canais).map(async canal => await client.sendMessage(canal, text)));
  await site_publish(text);
}

const sendBolaoGroups = async text => {
  await Promise.all(Object.keys(config.bolao.grupos).map(async grupo => await client.sendMessage(grupo, text)));
  await site_publish(text);
};

const sendMediaUrlToGroups = async media => {
  const mediaFile = await MessageMedia.fromUrl(media.url);
  await Promise.all(Object.keys(config.grupos).map(async grupo => await client.sendMessage(grupo, mediaFile, { caption: media.caption })));
  await site_publish(media.caption);
}

const sendMediaUrlToChannels = async media => {
  const mediaFile = await MessageMedia.fromUrl(media.url);
  await Promise.all(Object.keys(config.canais).map(async canal => await client.sendMessage(canal, mediaFile, { caption: media.caption })));
  await site_publish(media.caption)
}

const sendInstagramToGroups = async media => {
  const mediaFile = await MessageMedia.fromUrl(media.url);
  const newCaption = media.caption + '\n\n📷 @' + media.owner + '\n🔗 ' + media.link + '\nCapturado e enviado até você por TigreBot ' + config.mysite;
  await Promise.all(Object.keys(config.grupos).map(async grupo => await client.sendMessage(grupo, mediaFile, { caption: newCaption })));
  await site_publish(newCaption);
}

const sendInstagramToChannels = async media => {
  const mediaFile = await MessageMedia.fromUrl(media.url);
  const newCaption = media.caption + '\n\n📷 @' + media.owner + '\n🔗 ' + media.link;
  await Promise.all(Object.keys(config.canais).map(async canal => await client.sendMessage(canal, mediaFile, { caption: newCaption })));
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