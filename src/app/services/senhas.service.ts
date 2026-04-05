import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SenhasService {
  // Variáveis novas que você adicionou (AGORA DENTRO DA CLASSE)
  public senhasAtendidas: number = 0;
  public senhaAtual: string = 'Nenhuma';

  // Variáveis da Lista 3 para relatórios
  public senhasGeral: number = 0;
  public senhasPrior: number = 0;
  public senhasExame: number = 0;
  public senhasTotal: number = 0;

  // Variáveis da Lista 4 para controle de Strings
  public inputNovaSenha: string = '';
  public senhasArray: any = {
    'SG': [],
    'SP': [],
    'SE': []
  };

  constructor() { }

  // Métodos de soma da Lista 3
  somaGeral() { this.senhasGeral++; this.senhasTotal++; }
  somaPrior() { this.senhasPrior++; this.senhasTotal++; }
  somaExame() { this.senhasExame++; this.senhasTotal++; }

  // Lógica principal da Lista 4: Gera a senha no padrão YYMMDD-PPSQ
  novaSenha(tipoSenha: string = 'SG') {
    const data = new Date();
    const ano = data.getFullYear().toString().substring(2, 4);
    // Note: Conforme a Lista 4, mes e dia também usam padStart
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const dia = data.getDate().toString().padStart(2, '0');
    
    let sequencia = 0;

    if (tipoSenha === 'SG') {
      this.somaGeral();
      sequencia = this.senhasArray['SG'].length + 1;
    } else if (tipoSenha === 'SP') {
      this.somaPrior();
      sequencia = this.senhasArray['SP'].length + 1;
    } else if (tipoSenha === 'SE') {
      this.somaExame();
      sequencia = this.senhasArray['SE'].length + 1;
    }

    // Monta a senha conforme o padrão YYMMDD-PPSQ exigido pelo projeto
    this.inputNovaSenha = `${ano}${mes}${dia}-${tipoSenha}${sequencia.toString().padStart(2, '0')}`;
    
    // Salva no array para o histórico (Lista 4)
    this.senhasArray[tipoSenha].push(this.inputNovaSenha);
    console.log(this.senhasArray);
  }

  // Método para o Atendente (AA) chamar a senha
  atenderSenha(tipo: string) {
    if (this.senhasArray[tipo].length > 0) {
      // .shift() remove o primeiro da fila (o mais antigo)
      this.senhaAtual = this.senhasArray[tipo].shift();
      this.senhasAtendidas++;
    } else {
      alert('Não há senhas na fila de ' + tipo);
    }
  }
}