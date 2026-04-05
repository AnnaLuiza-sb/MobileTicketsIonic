import { Component } from '@angular/core';
import { SenhasService } from '../services/senhas.service'; // Importação importante

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false
})
export class Tab1Page {
  constructor(public senhasService: SenhasService) {} // Instância do serviço
}