import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // <-- Importante para fazer a comunicação remota
import { firstValueFrom } from 'rxjs'; // <-- Lógica idêntica ao PDF do professor para usar async/await

@Injectable({
  providedIn: 'root'
})
export class SenhasService {
  // Endereço do nosso servidor Node onde toda a lógica real agora roda
  private api = 'http://localhost:3000/api/senhas';

  // Variáveis globais que suas telas ainda vão ler para mostrar na interface
  public senhaAtual: string = 'Nenhuma';
  public inputNovaSenha: string = '';

  constructor(private http: HttpClient) { }

  // 1. ADAPTAÇÃO DA NOVA SENHA (TOTEM - TAB1)
  // Em vez de fazer a conta da data aqui, enviamos para a API calcular e nos devolver pronta!
  async novaSenha(tipoSenha: string = 'SG') {
    try {
      const body = { tipo: tipoSenha };
      // Envia a requisição POST para a API, igual a função addUser do PDF (cite: IonicSQLite_API_REST.pdf)
      const resultado = await firstValueFrom(
        this.http.post(`${this.api}/emitir`, body)
      );

      // Guarda o número retornado pela API para a Tab1 exibir na tela
      this.inputNovaSenha = resultado.numero;
      return resultado;
    } catch (error) {
      console.error('Erro ao emitir senha na API:', error);
      throw error;
    }
  }

  // 2. ADAPTAÇÃO DO ATENDER SENHA (ATENDENTE - TAB2)
  // O .shift() e a checagem de filas agora acontecem no servidor Node!
  async atenderSenha(guiche: string) {
    try {
      const body = { guiche: guiche };
      // Chama a rota que escolhe a senha pela regra de prioridade da Fase 2
      const resultado = await firstValueFrom(
        this.http.post(`${this.api}/chamar`, body)
      );

      // Atualiza a variável que o painel e a tela usam para mostrar a senha chamada
      this.senhaAtual = resultado.chamado.numero;
      return resultado; // Retorna o objeto completo (com o painel das últimas 5)
    } catch (error: any) {
      console.error('Erro ao chamar senha na API:', error);
      throw error;
    }
  }

  // 3. NOVO MÉTODO PARA PEGAR OS RELATÓRIOS (GERENCIAL - TAB3)
  // Como as somas acontecem na API, criamos esse método para buscar os contadores atualizados
  async obterRelatorios() {
    try {
      return await firstValueFrom(
        this.http.get<any>(`${this.api}/relatorios`)
      );
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      throw error;
    }
  }

  // 4. NOVO MÉTODO PARA O PAINEL DE ÚLTIMAS CHAMADAS (TAB2)
  async obterUltimasChamadas() {
    try {
      return await firstValueFrom(
        this.http.get<any[]>(`${this.api}/painel`)
      );
    } catch (error) {
      console.error('Erro ao buscar histórico do painel:', error);
      throw error;
    }
  }
}
