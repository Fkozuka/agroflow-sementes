import { useState, useCallback } from 'react';
import axios from 'axios';

//Interface dados
interface statusComandos {
  statusErro: boolean;
}

export const useComandos = (numPlanej?: string, statusAtualizado?: string, motivo?: string) => {
  // Estados
  const [statusComandos, setStatusComandos] = useState<statusComandos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarStatusComandos = useCallback(async (numPlanejArg?: string, statusAtualizadoArg?: string, motivoArg?: string) => {
    setError(null);
    setLoading(true);
    
    try {
      const np = (numPlanejArg ?? numPlanej) ?? '';
      const st = (statusAtualizadoArg ?? statusAtualizado) ?? '';
      const mv = (motivoArg ?? motivo) ?? '';

      const response = await axios.get(`http://10.99.2.17:1881/atualiza-status`, {
        params: {
          numPlanej: String(np),
          statusAtualizado: String(st),
          motivo: mv ? String(mv) : undefined,
        }
      });
      
      if (response.data && typeof response.data.statusErro === 'boolean') {
        setStatusComandos(response.data);
        setLoading(false);
        return response.data;
      } else {
        setError('Formato de dados inválido');
        setLoading(false);
        return null;
      }
    } catch (err) {
      setError('Erro ao carregar status dos comandos');
      setLoading(false);
      throw err;
    }
  }, [numPlanej, statusAtualizado]);

  // Removido auto-carregamento; chamadas devem ser explícitas pelos handlers

  return {
    statusComandos,
    loading,
    error,
    carregarStatusComandos
  };
};

