import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface DadosNivel {
  id: number;
  maquina: string;
  linha: string;
  produto: string;
  nivel: number;
  data: string;
}

// ============================================================================
// HOOK PRINCIPAL - NÍVEL IBCs
// ============================================================================

export const useNivelIbcs = (
  maquina?: string,
  tipoDados?: string,
  dataIncial?: string,
  dataFinail?: string,
) => {
  const [dadosNivel, setDadosNivel] = useState<DadosNivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const carregarDadosNivel = useCallback(async () => {
    const params = { maquina, tipoDados, dataIncial, dataFinail };

    if (isInitialLoad) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await axios.get<DadosNivel[]>(`http://10.99.2.17:1881/nivel-ibc`, {
        params,
      });

      if (Array.isArray(response.data)) {
        const normalizado = response.data.map((item) => ({
          ...item,
          id: Number(item?.id) || 0,
          maquina: String(item?.maquina ?? ''),
          linha: String(item?.linha ?? ''),
          produto: String(item?.produto ?? ''),
          nivel: Number(item?.nivel),
          data: String(item?.data ?? ''),
        }));
        setDadosNivel(normalizado);
      } else {
        setError('Formato de dados inválido');
      }
    } catch {
      setError('Erro ao carregar dados de nível IBC');
    } finally {
      if (isInitialLoad) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, [maquina, tipoDados, dataIncial, dataFinail, isInitialLoad]);

  useEffect(() => {
    carregarDadosNivel();
  }, [carregarDadosNivel]);

  return {
    dadosNivel,
    loading,
    error,
    carregarDadosNivel,
  };
};
