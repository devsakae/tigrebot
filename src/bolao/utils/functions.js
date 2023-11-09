const { client } = require("../../connections");

const getCommand = (raw) => {
  const divide = raw.split(' ');
  if (divide.length > 1) return raw.substring(divide[0].length).trimStart();
  return false;
}

const forMatch = (match) => {
  const data = new Date(match.hora);
  return `🚨🚨 BOLÃO ABERTO! 🚨🚨

⚽️ ${match.homeTeam} x ${match.awayTeam} 🏆 ${match.torneio} 🗓 ${data.toLocaleString('pt-br')}

*COMO JOGAR*: Responda essa mensagem com apenas seu palpite, no formato:

👉👉 *<mandante> <placar> x <placar> <visitante>* 👈👈
ex.: ${match.homeTeam} ${Math.floor(Math.random() * 5)} x ${Math.floor(Math.random() * 5)} ${match.awayTeam}

Palpites válidos somente se enviados em até *10 minutos* antes da partida e o Bot tiver reagido à mensagem com o emoji 🎟. Se não tiver, o palpite não é válido!

*REGRAS*: As rodadas são abertas 36 horas antes do horário da partida.

✅ Acertou o placar em cheio: *3 pontos*
✅ Acertar vitória, empate ou derrota e o placar de um dos times: *2 pontos*
✅ Acertar vitória, empate ou derrota: *1 ponto*
🚫 Repetir palpite
🚫 Flood (leva cartão amarelo)
⚖️ Desempate: Palpite mais antigo leva

Boa sorte!

Sistema de bolão ©️ devsakae.tech
Id da partida: ${match.id}`;
};

const formatPredicts = (predicts) => {
  let response = `👁 Stats pre-match para *${predicts.teams.home.name}* x *${predicts.teams.away.name}*:

👉 *Resultado*
  ${predicts.predictions.winner.comment} de ${predicts.predictions.winner.name}

🍀 *Super dica*
  ${predicts.predictions.advice}

⚽️ *Gol(s) marcado(s)*
  ${predicts.teams.home.name}: ${predicts.predictions.goals.home}
  ${predicts.teams.away.name}: ${predicts.predictions.goals.away}

📈 *Chances*
  ${predicts.teams.home.name}: ${predicts.predictions.percent.home}
  Empate: ${predicts.predictions.percent.draw}
  ${predicts.teams.away.name}: ${predicts.predictions.percent.away}

🗂 *Última(s) partida(s)*`;
  predicts.h2h.forEach((match) => {
    const matchDate = new Date(match.fixture.timestamp * 1000);
    response += `\n ${match.teams.home.name} ${match.goals.home} x ${match.goals.away} ${match.teams.away.name} (${matchDate.toDateString()} - ${match.league.name} ${match.league.season})`
  });
  return response;
};

const sendAdmin = (what) => client.sendMessage(process.env.BOT_OWNER, what);

module.exports = {
  sendAdmin,
  getCommand,
  forMatch,
  formatPredicts,
}