import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

//Interface dados
interface statusCarregaListaProducao {
  statusErro: boolean;
}

export const useCarregaListaProducao = () => {
  // Estados
  const [statusCarregaListaProducao, setStatusCarregaListaProducao] = useState<statusCarregaListaProducao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarStatusCarregaListaProducao = useCallback(async () => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await axios.get(`http://10.99.2.17:1881/read-sap`);
      
      if (response.data && typeof response.data.statusErro === 'boolean') {
        setStatusCarregaListaProducao(response.data);
        setLoading(false);
        return response.data;
      } else {
        setError('Formato de dados inválido');
        setLoading(false);
        return null;
      }
    } catch (err) {
      setError('Erro ao carregar status da lista de produção');
      setLoading(false);
      throw err;
    }
  }, []);

  // Effect para carregar dados
  useEffect(() => {
    carregarStatusCarregaListaProducao();
  }, [carregarStatusCarregaListaProducao]);

  return {
    statusCarregaListaProducao,
    loading,
    error,
    carregarStatusCarregaListaProducao
  };
};

