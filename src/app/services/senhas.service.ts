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

  
  async novaSenha(tipoSenha: string = 'SG') {
    try {
      const body = { tipo: tipoSenha };
      
      const resultado = await firstValueFrom(
        this.http.post<any>(`${this.api}/emitir`, body)
      );

      
      this.inputNovaSenha = resultado.numero;
      return resultado;
    } catch (error) {
      console.error('Erro ao emitir senha na API:', error);
      throw error;
    }
  }

  async atenderSenha(guiche: string) {
    try {
      const body = { guiche: guiche };
      const resultado = await firstValueFrom(
        this.http.post<any>(`${this.api}/chamar`, body)
      );

      this.senhaAtual = resultado.chamado.numero;
      return resultado; 
    } catch (error: any) {
      console.error('Erro ao chamar senha na API:', error);
      throw error;
    }
  }

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
