const { Poll, MessageMedia } = require('whatsapp-web.js');
const { criciuma, client } = require('../connections');
const { log_info, log_erro, log_this } = require('../../utils/admin');
const { umAtleta } = require('../futebol/utils/functions');
const sorteio = ['idolos', 'acerteoidolo'];
const subsorteio = ['totaljogos', 'idade'];
const tempoQuiz = 15;
let modoQuiz = false;

const quiz = async (m) => {
  if (modoQuiz) return m.reply("Um quiz por hora po");
  const voltaAoNormal = setTimeout(() => modoQuiz = false, (60 * 60 * 1000));
  modoQuiz = true;
  const tipo = sorteio[Math.floor(Math.random() * sorteio.length)];
  const meuQuiz = await buscaOpcoes(tipo);
  if (meuQuiz.correta === "ERRO") return m.reply("Erro ao iniciar o quiz");
  const subtipo = subsorteio[Math.floor(Math.random() * subsorteio.length)];
  log_this("Mandando um quiz de " + tipo + " com subtipo " + subtipo);
  if (tipo === 'idolos') return quizTipoIdolos(m, meuQuiz, subtipo);
  if (tipo === 'acerteoidolo') return quizAcerteOIdolo(m, meuQuiz);
  else return log_erro("Quiz com erro");
}

const quizTipoIdolos = async (m, meuQuiz, subtipo) => {
  if (subtipo === 'totaljogos') {
    log_this("Enviando quiz de ÍDOLOS");
    let totalDeJogos = 0;
    meuQuiz.correta.jogos.forEach((j) => { if (j.jogounotigre) totalDeJogos += Number(j.jogos) });
    let pollQuestion = "QUIZ: Quantas partidas pelo Tigre jogou o ÍDOLO *" + meuQuiz.correta.nickname + "* (" + meuQuiz.correta.name + " - " + meuQuiz.correta.position + ")?";
    let pollOptions = baguncinha(totalDeJogos);
    // let pollAnswer = "QUIZ: Tempo esgotado!\n\nNosso ídolo *" + meuQuiz.correta.nickname + "* (" + meuQuiz.correta.position + ") jogou o total de " + JSON.stringify(totalDeJogos) + " partidas pelo nosso tricolor, sendo a(s) última(s) " + meuQuiz.correta.jogos[0].jogos + " partida(s) no ano de " + meuQuiz.correta.jogos[0].ano + " pelo torneio " + meuQuiz.correta.jogos[0].torneio + ".";
    const minhaPoll = new Poll(pollQuestion, pollOptions);
    falta(m, 10);
    const tempoEsgotado = setTimeout(() => mostraAtletaEscolhido(m, meuQuiz.correta), (tempoQuiz * 60 * 1000));
    // const tempoEsgotado = setTimeout(() => client.sendMessage(m.from, pollAnswer), (tempoQuiz * 60 * 1000));
    return await client.sendMessage(m.from, minhaPoll);
  }
  if (subtipo === 'idade') {
    log_this("Enviando quiz de IDADE DE ÍDOLOS");
    const sp = meuQuiz.correta.birthday.split("/");
    const today = new Date();
    const matchDate = new Date(sp[2], sp[1], sp[0])
    const diff = today.getTime() - matchDate.getTime()
    const totalIdade = Math.ceil(diff / (1000 * 3600 * 24 * 365));
    let pollQuestion = "QUIZ: Quantos anos tem/teria o atleta *" + meuQuiz.correta.nickname + "* (" + meuQuiz.correta.name + " - " + meuQuiz.correta.position + ") na data de hoje?";
    let pollOptions = baguncinha(totalIdade).sort((a, b) => a - b);
    // let pollAnswer = "QUIZ: Tempo esgotado!\n\n*" + meuQuiz.correta.nickname + "* (" + meuQuiz.correta.position + ") tem/teria a idade de " + totalIdade + " anos hoje.";
    const minhaPoll = new Poll(pollQuestion, pollOptions);
    falta(m, 10);
    const tempoEsgotado = setTimeout(() => mostraAtletaEscolhido(m, meuQuiz.correta), (tempoQuiz * 60 * 1000));
    // const tempoEsgotado = setTimeout(() => client.sendMessage(m.from, pollAnswer), (tempoQuiz * 60 * 1000));
    return await client.sendMessage(m.from, minhaPoll);
  }
}

const falta = (m, exp, tempo = tempoQuiz) => {
  setTimeout(() => client.sendMessage(m.from, "Alô grupo de tartarugas! Faltam *" + JSON.stringify(exp) + " minutos* pra escolher uma opção!\n\nUse a porra do mouse"), (Number(tempo - exp) * 60 * 1000))
}

const quizAcerteOIdolo = async (m, meuQuiz) => {
  log_info("Quiz acerte o ÍDOLO!");
  let totalDeJogos = 0;
  let estreia, final, jogosContra, gols, v, e, d;
  meuQuiz.correta.jogos.forEach((j) => {
    if (j.jogounotigre) {
      estreia = estreia < Number(j.ano) ? estreia : Number(j.ano);
      final = final > Number(j.ano) ? final : Number(j.ano);
      totalDeJogos += Number(j.jogos);
      gols += Number(j.gols);
      v += Number(j.v);
      e += Number(j.e);
      d += Number(j.d);
    } else jogosContra += Number(j.jogos)
  })
  let pollQuestion = "QUIZ: Quem é o atleta que disputou *" + JSON.stringify(totalDeJogos) + "* partidas pelo Tigre " + estreia === final ? "em " + estreia + "?" : "entre os anos de " + estreia + " a " + final + "?";
  let pollOptions = [meuQuiz.correta.nickname, meuQuiz.opcoes[0].nickname, meuQuiz.opcoes[1].nickname, meuQuiz.opcoes[2].nickname, meuQuiz.opcoes[3].nickname].sort();
  let pollAnswer = "QUIZ ENCERRADO!!\n\nO atleta em questão era ninguém mais ninguém menos que *" + meuQuiz.correta.name + "*, mais conhecido como " + meuQuiz.correta.nickname + " (" + meuQuiz.correta.position + "), com um impressionante histórico de " + JSON.stringify(v) + " vitórias, " + JSON.stringify(e) + " empates, " + JSON.stringify(d) + " derrotas e " + JSON.stringify(gols) + " gols marcados.";
  const minhaPoll = new Poll(pollQuestion, pollOptions);
  if (jogosContra > 0) setTimeout(() => client.sendMessage(m.from, "Tempo acabando, vai aqui uma dica pra quem ainda tá em dúvida: Esse atleta chegou a disputar " + jogosContra + " partidas contra o Tigre."), (20 * 60 * 1000));
  else falta(m, 10);
  const tempoEsgotado = setTimeout(() => mostraAtletaEscolhido(m, meuQuiz.correta), (tempoQuiz * 60 * 1000));
  return await client.sendMessage(m.from, minhaPoll);
}

const buscaOpcoes = async (tipo) => {
  if (tipo === 'idolos' || tipo === 'acerteoidolo') {
    const atleta = await criciuma
      .collection('atletas')
      .aggregate([{ $match: { "jogos.jogounotigre": true } }, { $sample: { size: 5 } }])
      .toArray();
    const escolhidoIdx = Math.floor(Math.random() * atleta.length);
    const escolhido = atleta[escolhidoIdx];
    const opcoes = atleta.toSpliced(escolhidoIdx, 1);
    return { correta: escolhido, opcoes: opcoes }
  }
  else return { correta: "ERRO", opcoes: [] }
  // if (tipo === 'atletas') {
  //   const atleta = await criciuma
  //     .collection('atletas')
  //     .aggregate([{ $sample: { size: 5 } }])
  //     .toArray();
  // }
  // if (tipo === 'jogos') {
  //   const jogo = await criciuma
  //     .collection('jogos')
  //     .aggregate([{ $sample: { size: 1 } }])
  //     .toArray();
  // }
}

const baguncinha = (resposta) => {
  const falaUmNumero = randomNum(1,4);
  const guessANum = randomNum(1,2);
  const guessBNum = randomNum(3,4);
  let optA, optB, optC, optD;
  if (falaUmNumero === 1) {
    optA = resposta - guessANum;
    optB = resposta - (guessANum * 2)
    optC = resposta - (guessANum * 3)
    optD = resposta - (guessANum * 4)
  }
  if (falaUmNumero === 2) {
    optA = resposta + guessANum;
    optB = resposta + (guessANum * 2)
    optC = resposta + (guessANum * 3)
    optD = resposta + (guessANum * 4)
  }
  if (falaUmNumero === 3) {
    optA = randomOpr(resposta, guessANum);
    optB = randomOpr(resposta, guessANum * 2)
    optC = randomOpr(resposta, guessBNum)
    optD = randomOpr(resposta, guessBNum * 2)
  }
  if (falaUmNumero === 4) {
    optA = resposta + guessANum;
    optB = resposta + (guessANum * 2)
    optC = resposta - guessANum
    optD = resposta - (guessANum * 2)
  }
  if (falaUmNumero === 5) {
    optA = resposta + guessANum;
    optB = resposta + (guessANum * 2)
    optC = resposta + (guessANum * 3)
    optD = resposta - guessANum
  }
  if (optA === optB || optA === optC || optA === optD) return [resposta, optB, optC, optD];
  if (optB === optA || optB === optC || optB === optD) return [resposta, optA, optC, optD];
  if (optC === optA || optC === optB || optC === optD) return [resposta, optA, optB, optD];
  if (optD === optA || optD === optB || optD === optC) return [resposta, optA, optB, optC];
  return [JSON.stringify(resposta), JSON.stringify(optA), JSON.stringify(optB), JSON.stringify(optC), JSON.stringify(optD)];
}

const randomNum = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const randomOpr = (val, mol) => randomNum(0,1) === 0 ? (val + mol) : (val - mol) < 0 ? (val + mol) : (val - mol);

const mostraAtletaEscolhido = async (m, escolhido) => {
  const foto = await MessageMedia.fromUrl(escolhido.image);
  const caption = umAtleta([escolhido]);
  return await client.sendMessage(m.from, foto, { caption: caption });
}

module.exports = {
  quiz
}