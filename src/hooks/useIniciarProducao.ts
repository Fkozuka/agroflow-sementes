import { useState, useCallback } from 'react';
import axios from 'axios';

interface statusIniciarProducao {
  statusErro: boolean;
}

export interface DadosIniciarProducao {
  numPlanej: string;
  numMaquina: string;
  lote: string;
  pesoProduzir: string;
  descMateriaPrima: string;
  gerOficial: string;
  peneira: string;
  pms: string;
  descCodTsi: string;
}

export const useIniciarProducao = () => {
  const [statusIniciarProducao, setStatusIniciarProducao] = useState<statusIniciarProducao | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviarLoteIniciarProducao = useCallback(async (dados: DadosIniciarProducao) => {
    setError(null);
    setLoading(true);

    try {
      const response = await axios.get('http://10.99.2.17:1881/iniciar-producao', {
        params: {
          numPlanej: String(dados.numPlanej ?? ''),
          numMaquina: String(dados.numMaquina ?? ''),
          lote: String(dados.lote ?? ''),
          pesoProduzir: String(dados.pesoProduzir ?? ''),
          descMateriaPrima: String(dados.descMateriaPrima ?? ''),
          gerOficial: String(dados.gerOficial ?? ''),
          peneira: String(dados.peneira ?? ''),
          pms: String(dados.pms ?? ''),
          descCodTsi: String(dados.descCodTsi ?? ''),
        },
      });

      if (response.data && typeof response.data.statusErro === 'boolean') {
        setStatusIniciarProducao(response.data);
        setLoading(false);
        return response.data;
      }

      setError('Formato de dados inválido');
      setLoading(false);
      return null;
    } catch (err) {
      setError('Erro ao iniciar produção');
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    statusIniciarProducao,
    loading,
    error,
    enviarLoteIniciarProducao,
  };
};
