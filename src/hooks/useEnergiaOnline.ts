import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

export type EnergiaMaquinaOnline = {
  maquina_id: number;
  empresa: string;
  unidade: string;
  data_hora: string;

  // Tensão (V)
  tensao_fase_a: number | null;
  tensao_fase_b: number | null;
  tensao_fase_c: number | null;

  // Corrente (A)
  corrente_fase_a: number | null;
  corrente_fase_b: number | null;
  corrente_fase_c: number | null;

  // Potências (kW / kVA)
  potencia_ativa_total: number | null;
  potencia_aparente_total: number | null;

  // Energia (kWh)
  energia_ativa_consumida: number | null;
};

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/**
 * Busca em `http://10.99.2.17:1881/energia-online` e normaliza campos numéricos.
 * Mantém o mesmo padrão dos hooks do projeto (loading inicial + função de recarregar).
 */
export const useListaEnergiaOnline = () => {
  const [dadosEnergiaOnline, setDadosEnergiaOnline] = useState<EnergiaMaquinaOnline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialLoadRef = useRef(true);

  const carregarDadosEnergiaOnline = useCallback(async () => {
    if (isInitialLoadRef.current) setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://10.99.2.17:1881/energia-online`);

      if (Array.isArray(response.data)) {
        const normalized: EnergiaMaquinaOnline[] = response.data.map((item: any) => ({
          maquina_id: Number(item?.maquina_id),
          empresa: String(item?.empresa ?? ''),
          unidade: String(item?.unidade ?? ''),
          data_hora: String(item?.data_hora ?? ''),

          tensao_fase_a: toNumberOrNull(item?.tensao_fase_a),
          tensao_fase_b: toNumberOrNull(item?.tensao_fase_b),
          tensao_fase_c: toNumberOrNull(item?.tensao_fase_c),

          corrente_fase_a: toNumberOrNull(item?.corrente_fase_a),
          corrente_fase_b: toNumberOrNull(item?.corrente_fase_b),
          corrente_fase_c: toNumberOrNull(item?.corrente_fase_c),

          potencia_ativa_total: toNumberOrNull(item?.potencia_ativa_total),
          potencia_aparente_total: toNumberOrNull(item?.potencia_aparente_total),

          energia_ativa_consumida: toNumberOrNull(item?.energia_ativa_consumida),
        }));
        setDadosEnergiaOnline(normalized);
      } else {
        setError('Formato de dados inválido');
      }
    } catch (err) {
      setError('Erro ao carregar dados de energia online');
    } finally {
      setLoading(false);
      isInitialLoadRef.current = false;
    }
  }, []);

  useEffect(() => {
    carregarDadosEnergiaOnline();

    const interval = setInterval(() => {
      carregarDadosEnergiaOnline();
    }, 5000);

    return () => clearInterval(interval);
  }, [carregarDadosEnergiaOnline]);

  return {
    dadosEnergiaOnline,
    loading,
    error,
    carregarDadosEnergiaOnline,
  };
};

