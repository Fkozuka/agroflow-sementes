import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

export type TemperaturaCamaraOnline = {
  camara_id: number;
  empresa: string;
  unidade: string;
  data_hora: string;
  temperatura_1: number | null;
  temperatura_2: number | null;
  temperatura_3: number | null;
  porta_aberta: boolean | null;
  status: string;
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

const toBooleanOrNull = (value: unknown): boolean | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return null;
  }
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (['1', 'true', 'sim', 'aberta', 'open'].includes(v)) return true;
    if (['0', 'false', 'nao', 'não', 'fechada', 'closed'].includes(v)) return false;
  }
  return null;
};

const pickNumber = (item: any, keys: string[]): number | null => {
  for (const key of keys) {
    const parsed = toNumberOrNull(item?.[key]);
    if (parsed !== null) return parsed;
  }
  return null;
};

const pickBoolean = (item: any, keys: string[]): boolean | null => {
  for (const key of keys) {
    const parsed = toBooleanOrNull(item?.[key]);
    if (parsed !== null) return parsed;
  }
  return null;
};

export const useListaTemperaturasOnline = () => {
  const [dadosTemperaturasOnline, setDadosTemperaturasOnline] = useState<TemperaturaCamaraOnline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialLoadRef = useRef(true);

  const carregarDadosTemperaturasOnline = useCallback(async () => {
    if (isInitialLoadRef.current) setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://10.99.2.17:1881/temperaturas-online`);

      if (Array.isArray(response.data)) {
        const normalized: TemperaturaCamaraOnline[] = response.data.map((item: any) => ({
          camara_id: Number(item?.camara_id ?? item?.maquina_id),
          empresa: String(item?.empresa ?? ''),
          unidade: String(item?.unidade ?? ''),
          data_hora: String(item?.data_hora ?? ''),
          temperatura_1: pickNumber(item, ['temperatura_1', 'temperatura1', 'temp_1', 'temp1', 'tempAlta']),
          temperatura_2: pickNumber(item, ['temperatura_2', 'temperatura2', 'temp_2', 'temp2', 'tempBaixa']),
          temperatura_3: pickNumber(item, [
            'temperatura_3',
            'temperatura3',
            'temp_3',
            'temp3',
            'tempSensorPorta',
          ]),
          porta_aberta: pickBoolean(item, ['porta_aberta', 'portaAberta']),
          status: String(item?.status ?? ''),
        }));
        setDadosTemperaturasOnline(normalized);
      } else {
        setError('Formato de dados inválido');
      }
    } catch {
      setError('Erro ao carregar dados de temperaturas online');
    } finally {
      setLoading(false);
      isInitialLoadRef.current = false;
    }
  }, []);

  useEffect(() => {
    carregarDadosTemperaturasOnline();

    const interval = setInterval(() => {
      carregarDadosTemperaturasOnline();
    }, 5000);

    return () => clearInterval(interval);
  }, [carregarDadosTemperaturasOnline]);

  return {
    dadosTemperaturasOnline,
    loading,
    error,
    carregarDadosTemperaturasOnline,
  };
};

