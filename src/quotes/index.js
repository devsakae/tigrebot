const { db, forum, criciuma, client } = require('../connections');
const { formatQuote, bestQuote } = require('./utils/functions');

const quotes = async (m) => {
  const chat = await m.getChat();
  chat.sendStateTyping();
  if (m.body === '!quote') {
    const randomQuote = await criciuma
      .collection('golacos_tigrelog')
      .aggregate([{ $sample: { size: 1 } }])
      .toArray();
    return client.sendMessage(m.from, formatQuote(randomQuote[0]));
  }
  const quoteType = m.body
    .substring(0, m.body.indexOf(' '))
    .toLowerCase();
  const content = m.body.substring(m.body.indexOf(' ')).trim();
  const firstWord = (content.indexOf(' ') !== -1) ? content.substring(0, content.indexOf(' ')).trim() : content;
  const what = (content.indexOf(' ') !== -1) ? content.substring(firstWord.length + 1).trim() : '';

  // Switch/case para verificar !quote, !quotefrom, !quoteby, !addquote e !delquote
  switch (quoteType) {
    case '!data':
      const quotesdated = await forum
        .find({
          $and: [
            { 'data': { $regex: firstWord, $options: 'i' } },
            {
              $or: [
                { 'autor': { $regex: what, $options: 'i' } },
                { 'quote': { $regex: what, $options: 'i' } }
              ]
            }
          ]
        })
        .toArray();

      if (quotesdated.length < 1) return m.reply('Sabe o que eu encontrei?? Sabes???        nada')
      const bestByDate = bestQuote(quotesdated);
      return client.sendMessage(m.from, bestByDate);

    case '!autor':
      const quotesfrom = await db
        .collection('tigrelog')
        .find({
          $and: [
            { 'autor': { $regex: firstWord, $options: 'i' } },
            { 'quote': { $regex: what, $options: 'i' } },
          ],
        })
        .toArray();
      if (quotesfrom.length === 0) return m.reply('Tem nada disso aí aqui 🫥'); // Não achou nada
      await client.sendMessage(m.from, `Tenho ${quotesfrom.length} quote(s) do *${firstWord}*, mas a melhor é essa:`);
      const bestByAuthor = bestQuote(quotesfrom);
      return client.sendMessage(m.from, bestByAuthor);

    case '!quote': // Procura por uma quote com parâmetros
      const foundquote = await forum
        .find({
          $or: [
            { quote: { $regex: content, $options: 'i' } },
            { autor: { $regex: content, $options: 'i' } },
          ],
        })
        .toArray();

      if (foundquote.length === 0) return m.reply('Tenho nada disso aí aqui 🫥');
      if (foundquote.length === 1) return await client.sendMessage(m.from, formatQuote(foundquote[0]));
      await client.sendMessage(m.from, `ATENÇÃO PRA MELHOR DAS *${foundquote.length} QUOTES* QUE EU TENHO AQUI NO TEMA '${content.toUpperCase()}'`);
      const response = bestQuote(foundquote);
      return await client.sendMessage(m.from, response);

    // // Novo !addquote com base em replies!
    // case '!addquote':
    //   if (m.hasQuotedMessage) {
    //     // continuar a lógica aqui
    //     return console.info('adding quote')
    //   }
    //   break;

    // Adiciona uma quote nova na coleção do grupo
    case '!addquote':
      const knife = content.indexOf(':');
      if (knife === -1 || content.substring(0, knife).indexOf(',') === -1)
        return m.reply('Aprende a adicionar quote seu burro 🙈');
      // Adiciona mais 1 na conta da coleção config
      const autor = content.substring(0, knife).trim().split(',')[0];
      const data = content.substring(content.indexOf(',') + 2, knife).trim();
      const newcontent = content.substring(knife + 2);
      const quote = {
        quote: newcontent,
        autor: autor,
        data: data,
        gols: 1,
        titulo: '(Mensagem no grupo)'
      };
      const result = await forum.insertOne(quote);
      m.reply(`✔️ Quote salva com id _${result.insertedId}_`);
      break;

    // Apaga quotes por meio do id
    case '!delquote':
      if (m.author !== process.env.BOT_OWNER) return;
      try {
        await forum.deleteOne({ id: content });
      } catch {
        m.reply(`Erro. Tem certeza que a quote '${content}' existe?`);
      } finally {
        m.reply(`Quote ${content} deletada com sucesso`);
      }
    default:
      return;
  }
};

const golacoAleatorio = async () => {
  const today = new Date();
  const isoToday = today.toISOString().substring(4, 10);
  const dateRegex = new RegExp(isoToday);
  const res = await criciuma
    .collection("golacos_tigrelog")
    .find({ "data": dateRegex })
    .toArray();
  const q = res[Math.floor(Math.random() * res.length)];
  const anosAtras = today.getFullYear() - Number(q.data.substring(0, 4));
  let response = `👀 Lembrando ~os herois~ as bobagens do passado...\n\nHá ${anosAtras} anos, foi postado no fórum TigreLOG a seguinte mensagem:`
  response += `"\n\n\`\`\`${q.quote.substring(0, 240)}\`\`\`"`
  response += q.quote.length > 240 ? ' (texto completo só no grupo TigreLOG https://chat.whatsapp.com/2yy89JmmjYf6mQLW87wjTQ)\n' : '\n'
  response += `\n👤 Autor: ${q.autor.substring(0, 1) + "*".repeat(q.autor.length - 1)}`
  response += `\n✍️ Tópico: ${q.titulo}`
  response += `\n⚽️ ${q.gols} ${Number(q.gols) > 1 ? 'usuários consideraram' : 'usuário considerou'} essa mensagem um golaço`
  return response;
}

module.exports = {
  quotes,
  golacoAleatorio,
}