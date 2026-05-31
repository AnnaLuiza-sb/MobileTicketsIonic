import { Component } from '@angular/core';
import { SenhasService } from '../services/senhas.service'; 

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false
})
export class Tab1Page {
  erroMensagem: string = '';

  constructor(public senhasService: SenhasService) {}

  async gerarSenha(tipo: string) {
    this.erroMensagem = '';

    try {
      await this.senhasService.novaSenha(tipo);
    } catch (error: any) {
      this.erroMensagem = error.error?.erro || 'Não foi possível conectar ao servidor.';
    }
  }
}
