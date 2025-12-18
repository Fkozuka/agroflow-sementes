import { useState } from 'react';
import axios from 'axios';

// GET PARA RECEBER STATUS AUTENTICAÇÃO
interface dadosAutenticacao {
    status: boolean;
}

/**
 * @param dataLogin 
 * @param dataPassword 
 * @returns 
 */
export const useLogin = () => {
    // Estados
    const [dadosAutenticacao, setDadosAutenticacao] = useState<dadosAutenticacao[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    // Função para autenticar login
    const autenticarLogin = async (dataLogin: string, dataPassword: string) => {
      setLoading(true);
      setError(null);
      
      try {
        // Buscar dados de autenticação
        const response = await axios.get(`http://10.99.2.17:1881/usuarios`, {
          params: {
            username: dataLogin,
            password: dataPassword
          }
        });
        
        if (Array.isArray(response.data)) {
          setDadosAutenticacao(response.data);
          return response.data; // Retorna os dados para verificação imediata
        } else {
          setError('Formato de dados inválido');
          return null;
        }
      } catch (err) {
        setError('Erro ao autenticar usuário');
        return null;
      } finally {
        setLoading(false);
      }
    };
  
    return {
      dadosAutenticacao,
      loading,
      error,
      autenticarLogin
    };
  };