import { Component } from '@angular/core';
import { SenhasService } from '../services/senhas.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false
})
export class Tab2Page {
  guicheSelecionado: string = 'Guichê 1'; 
  ultimas5Senhas: any[] = [];
  erroMensagem: string = '';

  constructor(public senhasService: SenhasService) {}

  async ionViewWillEnter() {
    this.atualizarHistoricoPainel();
  }

  async chamarSenha() {
    this.erroMensagem = '';
    try {
      const res = await this.senhasService.atenderSenha(this.guicheSelecionado);
      
      this.ultimas5Senhas = res.painel;
    } catch (error: any) {
      this.erroMensagem = error.error?.erro || 'Fila vazia ou erro no servidor.';
    }
  }

  async atualizarHistoricoPainel() {
    try {
      this.ultimas5Senhas = await this.senhasService.obterUltimasChamadas();
    } catch (error) {
      console.error('Erro ao atualizar painel:', error);
    }
  }
}