const { sendAdmin } = require("../src/bolao/utils/functions");

const log_info = async (msg) => {
  const timestamp = new Date();
  const fullmsg = "INFO [" + timestamp.toLocaleString("pt-br") + "] ℹ️ " + msg;
  await sendAdmin(fullmsg);
  return console.info(fullmsg);
}

const log_erro = async (msg) => {
  const timestamp = new Date();
  const fullmsg = "ERRO [" + timestamp.toLocaleString("pt-br") + "] 🛑 " + msg;
  await sendAdmin(fullmsg);
  return console.error(fullmsg);
}

const log_this = async (msg) => {
  const timestamp = new Date();
  const fullmsg = "LOG [" + timestamp.toLocaleString("pt-br") + "] ✅ " + msg;
  await sendAdmin(fullmsg);
  return console.log(fullmsg);
}

module.exports = {
  log_info,
  log_erro,
  log_this
}