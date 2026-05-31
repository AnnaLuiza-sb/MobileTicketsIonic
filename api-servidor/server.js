const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let senhasEmitidas = [];
let senhasAtendidas = [];
let ultimasChamadas = [];
let contadores = { SP: 0, SG: 0, SE: 0 };
let ultimaPrioridadeChamada = '';

function formatarData() {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

// 1. EMITIR SENHA (TOTEM)
app.post('/api/senhas/emitir', (req, res) => {
  const { tipo } = req.body;
  const horaAtual = new Date();
  const hora = horaAtual.getHours();
  console.log(` Nova requisição recebida! Emitindo senha do tipo: ${tipo}`);

  /*if (hora < 7 || hora >= 17) {
    return res.status(400).json({ erro: 'Totem indisponível fora do horário de expediente (07:00 às 17:00).' });
  }*/

  contadores[tipo]++;
  const dataFormatada = formatarData();

  // Ajustado para padStart(2) para manter o padrão padrão de 2 dígitos (ex: SP01)
  const codigo = `${dataFormatada}-${tipo}${String(contadores[tipo]).padStart(2, '0')}`;

  const novaSenha = {
    numero: codigo, // Nome mantido como "numero" para alinhar com o Ionic
    tipo: tipo,
    dataHoraEmissao: horaAtual.toISOString(),
    dataHoraAtendimento: '',
    guiche: '',
    atendido: false,
    tempoAtendimento: 0
  };

  senhasEmitidas.push(novaSenha);
  res.status(201).json(novaSenha);
});

// 2. CHAMAR SENHA (ATENDENTE)
app.post('/api/senhas/chamar', (req, res) => {
  const { guiche } = req.body;

  const filaSP = senhasEmitidas.filter(s => s.tipo === 'SP' && !s.atendido && s.guiche !== 'NÃO COMPARECEU');
  const filaSG = senhasEmitidas.filter(s => s.tipo === 'SG' && !s.atendido && s.guiche !== 'NÃO COMPARECEU');
  const filaSE = senhasEmitidas.filter(s => s.tipo === 'SE' && !s.atendido && s.guiche !== 'NÃO COMPARECEU');
  console.log(` O guichê ${guiche} está chamando a próxima senha...`);

  if (filaSP.length === 0 && filaSG.length === 0 && filaSE.length === 0) {
    return res.status(404).json({ erro: 'Nenhuma senha aguardando na fila.' });
  }

  let senhaEscolhida = null;

  if (ultimaPrioridadeChamada !== 'SP' && filaSP.length > 0) {
    senhaEscolhida = filaSP[0];
    ultimaPrioridadeChamada = 'SP';
  } else if (filaSE.length > 0) {
    senhaEscolhida = filaSE[0];
    ultimaPrioridadeChamada = 'SE';
  } else if (filaSG.length > 0) {
    senhaEscolhida = filaSG[0];
    ultimaPrioridadeChamada = 'SG';
  } else if (filaSP.length > 0) {
    senhaEscolhida = filaSP[0];
    ultimaPrioridadeChamada = 'SP';
  }

  if (!senhaEscolhida) {
    return res.status(404).json({ erro: 'Nenhuma senha disponível para a regra de alternância.' });
  }

  const sorteioDesistencia = Math.random() * 100;
  if (sorteioDesistencia <= 5) {
    senhaEscolhida.atendido = false;
    senhaEscolhida.guiche = 'NÃO COMPARECEU';
    senhaEscolhida.dataHoraAtendimento = new Date().toISOString();
    senhasAtendidas.push(senhaEscolhida);
  } else {
    let tempo = 0;
    if (senhaEscolhida.tipo === 'SP') {
      tempo = 15 + (Math.random() * 10 - 5);
    } else if (senhaEscolhida.tipo === 'SG') {
      tempo = 5 + (Math.random() * 6 - 3);
    } else if (senhaEscolhida.tipo === 'SE') {
      tempo = Math.random() * 100 <= 95 ? 1 : 5;
    }

    senhaEscolhida.atendido = true;
    senhaEscolhida.guiche = guiche;
    senhaEscolhida.dataHoraAtendimento = new Date().toISOString();
    senhaEscolhida.tempoAtendimento = parseFloat(tempo.toFixed(2));
    senhasAtendidas.push(senhaEscolhida);
  }

  ultimasChamadas.unshift(senhaEscolhida);
  if (ultimasChamadas.length > 5) ultimasChamadas.pop();

  res.json({ chamado: senhaEscolhida, painel: ultimasChamadas });
});

// 3. RELATÓRIOS (MAPEADO EXATAMENTE COM OS NOMES DA TAB3 DO IONIC)
app.get('/api/senhas/relatorios', (req, res) => {
  const emitidasPorTipo = (tipo) => senhasEmitidas.filter(s => s.tipo === tipo).length;
  
  // Conta o total de desistências (GAPs de 5%)
  const totalDesistencias = senhasAtendidas.filter(s => s.guiche === 'NÃO COMPARECEU').length;

  // Calcula a média geral ponderada de tempo de atendimento de todas as senhas atendidas com sucesso
  const atendidasSucesso = senhasAtendidas.filter(s => s.atendido);
  let mediaGeralGaps = 0;
  if (atendidasSucesso.length > 0) {
    const somaTotalTempo = atendidasSucesso.reduce((acc, s) => acc + s.tempoAtendimento, 0);
    mediaGeralGaps = parseFloat((somaTotalTempo / atendidasSucesso.length).toFixed(1));
  }

  // Pega a string da última senha que foi parar no painel
  const ultimaSenhaString = ultimasChamadas.length > 0 ? ultimasChamadas[0].numero : 'Nenhuma';

  res.json({
    senhasTotal: senhasEmitidas.length,
    senhasAtendidas: atendidasSucesso.length,
    totalDesistencias: totalDesistencias,
    senhasPrior: emitidasPorTipo('SP'),
    senhasGeral: emitidasPorTipo('SG'),
    senhasExame: emitidasPorTipo('SE'),
    tempoMedioMinutos: mediaGeralGaps,
    senhaAtual: ultimaSenhaString
  });
});

// 4. HISTÓRICO DO PAINEL
app.get('/api/senhas/painel', (req, res) => {
  res.json(ultimasChamadas);
});

app.listen(3000, () => {
  console.log('🚀 Servidor rodando na porta 3000 com integração Ionic ok!');
});