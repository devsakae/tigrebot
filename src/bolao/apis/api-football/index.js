const { start, abreRodada, fechaRodada, pegaProximaRodada, publicaRodada } = require('./admin');
const { getRanking, habilitaPalpite, listaPalpites } = require('./user');

module.exports = {
  start,
  abreRodada,
  fechaRodada,
  pegaProximaRodada,
  publicaRodada,
  getRanking,
  habilitaPalpite,
  listaPalpites,
}