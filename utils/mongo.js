const { tigrebot } = require("../src/connections");
const { log_erro, log_this } = require("./admin");

const site_publish = async (msg) => {
  try {
    const document = {
      "data": new Date(),
      "mensagem": JSON.stringify(msg)
    }
    await tigrebot.collection('mensagens').insertOne(document)
    log_this('Mensagem salva no BD!');
  } catch (err) {
    log_erro('Erro ao publicar última mensagem no site: ', err)
  }
}

module.exports = { site_publish }