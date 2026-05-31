import { Component } from '@angular/core';
import { SenhasService } from '../services/senhas.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false
})
export class Tab3Page {
  public relatorio: any = {
    senhasTotal: 0,
    senhasAtendidas: 0,
    senhasPrior: 0,
    senhasGeral: 0,
    senhasExame: 0,
    tempoMedioMinutos: 0,
    totalDesistencias: 0,
    senhaAtual: 'Nenhuma'
  };

  constructor(public senhasService: SenhasService) {}

  async ionViewWillEnter() {
    await this.carregarDadosRelatorio();
  }

  async carregarDadosRelatorio() {
    try {
      this.relatorio = await this.senhasService.obterRelatorios();
    } catch (error) {
      console.error('Erro ao buscar dados estatísticos da API:', error);
    }
  }
}