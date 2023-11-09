const data = require('../../data/data.json');
const { writeData } = require('../../utils/fileHandler');

const habilitaPalpite = (info) => {
  const today = new Date();
  const regex = /\d+\s*[x]\s*\d+/i
  if (!info.m.body.match(regex)) return { error: true };
  const homeScore = info.m.body.match(regex)[0].match(/^\d+/i);
  const awayScore = info.m.body.match(regex)[0].match(/\d+$/i);
  const palpiPack = ({
    date: today.toLocaleString('pt-br'),
    userId: info.m.author,
    userName: info.user,
    homeScore: Number(homeScore),
    awayScore: Number(awayScore),
    resultado: Number(homeScore) > Number(awayScore) ? 'V' : Number(homeScore) < Number(awayScore) ? 'D' : 'E',
  })
  data[info.m.from].activeRound.palpiteiros.push(info.m.author);
  data[info.m.from][data[info.m.from].activeRound.team.slug][today.getFullYear()][info.matchId].palpites.push(palpiPack);
  writeData(data);
  return { error: false };
};

const listaPalpites = (grupo) => {
  const today = new Date();
  const match = data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][data[grupo].activeRound.matchId];
  let resposta = `📢 Lista de palpites registrados para ${match.homeTeam} x ${match.awayTeam} - ${match.rodada}ª rodada ${match.torneio}\n`
  match.palpites.forEach((palpite) => resposta += `\n▪ ${palpite.homeScore} x ${palpite.awayScore} - ${palpite.userName} ${palpite.date ? `em ${palpite.date}` : ''}`);
  return resposta;
};

const getRanking = (grupo) => {
  data[grupo][data[grupo].activeRound.team.slug].ranking.sort((a, b) => a.pontos < b.pontos ? 1 : (a.pontos > b.pontos) ? -1 : 0);
  writeData(data);
  let response = `🏆🏆 *Ranking do Bolão* 🏆🏆\n`;
  data[grupo][data[grupo].activeRound.team.slug].ranking.forEach((pos, idx) => {
    if (idx === 3) response += '\n🔝 🔝 🔝 🔝 🔝 🔝 🔝 🔝 🔝 🔝 🔝 🔝'
    if (pos.pontos < 1) response += '\n\nCertificado de participação no bolão:\n'
    const medal = (idx === 0) ? '🥇 ' : (idx === 1) ? '🥈 ' : (idx === 2) ? '🥉 ' : `${idx + 1}º - `;
    (pos.pontos > 0)
      ? response += `\n${medal}${pos.usuario} [${pos.pontos} ponto${pos.pontos > 1 ? 's' : ''}]`
      : response += `\n🎗 ${pos.usuario}`
  });
  return response;
};

module.exports = {
  habilitaPalpite,
  listaPalpites,
  getRanking,
}