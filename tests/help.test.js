const { help } = require('../utils/help')

describe('Testes básicos do comando !help', () => {
  test('Função help() tem retorno', () => {
    expect(help()).toBeDefined();
  });
  test('Loga o retorno para visualização', () => {
    console.log(help());
  });
})