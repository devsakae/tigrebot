const { criciuma, client } = require('../connections');
const sorteio = ['idolos', 'atletas', 'jogos'];

const quiz = async (m) => {
  const tipo = sorteio[Math.floor(Math.random() * tipo.length)];
  if (tipo === 'idolos') {
    const atleta = await criciuma
      .collection('atletas')
      .aggregate([{ $match: { "jogos.jogounotigre": true } }, { $sample: { size: 1 } }])
      .toArray();
  }
  if (tipo === 'atletas') {
    const atleta = await criciuma
      .collection('atletas')
      .aggregate([{ $sample: { size: 1 } }])
      .toArray();
  }
  if (tipo === 'jogos') {
    const jogo = await criciuma
      .collection('jogos')
      .aggregate([{ $sample: { size: 1 } }])
      .toArray();
  }
}

module.exports = {
  quiz
}