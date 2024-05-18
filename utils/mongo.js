const { tigrebot } = require('../src/connections');
const { log_erro, log_this } = require('./admin');

const site_publish = async (msg) => {
  try {
    const document = {
      'data': new Date(),
      'mensagem': msg,
      'quote': false,
    }
    await tigrebot.collection('mensagens').insertOne(document)
    log_this('Salvei na DB: ' + msg.substring(0, 255) + ' (...)');
  } catch (err) {
    log_erro('Erro ao publicar última mensagem no site: ', err)
  }
}

const site_publish_reply = async (msg, user = '[Suprimido]', msgOrig = '[Mensagem original suprimida]') => {
  try {
    const document = {
      'data': new Date(),
      'mensagem': msg,
      'quote': {
        author: user,
        text: msgOrig,
      }
    }
    await tigrebot.collection('mensagens').insertOne(document)
    log_this('Salvei no DB: ' + text.substring(0, 320) + ' (...)');
  } catch (err) {
    log_erro('Erro ao publicar última mensagem no site: ', err)
  }
}

module.exports = {
  site_publish,
  site_publish_reply,
}