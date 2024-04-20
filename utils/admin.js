const log_info = (msg) => {
  const timestamp = new Date();
  return console.info("INFO [" + timestamp.toLocaleString("pt-br") + "] " + msg);
}

const log_erro = (msg) => {
  const timestamp = new Date();
  return console.error("ERRO [" + timestamp.toLocaleString("pt-br") + "] " + msg);
}

const log_this = (msg) => {
  const timestamp = new Date();
  return console.log("LOG [" + timestamp.toLocaleString("pt-br") + "] " + msg);
}

module.exports = {
  log_info,
  log_erro,
  log_this
}