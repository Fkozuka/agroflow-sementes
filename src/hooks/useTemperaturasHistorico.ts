import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useListaTemperaturasOnline, type TemperaturaCamaraOnline } from './useTemperaturasOnline';

export type TemperaturasHistoricoChartPoint = {
  time: string;
  temperatura1: number | null;
  temperatura2: number | null;
  temperatura3: number | null;
  media: number | null;
  portaStatus: number | null;
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

const mediaTemperaturas = (item: TemperaturaCamaraOnline): number | null => {
  const values = [item.temperatura_1, item.temperatura_2, item.temperatura_3].filter(
    (v): v is number => v !== null && v !== undefined
  );
  if (values.length === 0) return null;
  return values.reduce((acc, v) => acc + v, 0) / values.length;
};

export const useTemperaturasHistorico = (
  camaraIdParam: number | null,
  dataInicial: string,
  dataFinal: string
) => {
  const { dadosTemperaturasOnline, loading, error } = useListaTemperaturasOnline();
  const [historico, setHistorico] = useState<Record<number, TemperaturaCamaraOnline[]>>({});

  const carregarHistorico = useCallback(async () => {
    try {
      const response = await axios.get(`http://10.99.2.17:1881/temperaturas-historico`, {
        params: {
          maquinaId: camaraIdParam || undefined,
          dateInicial: dataInicial || undefined,
          dateFinal: dataFinal || undefined,
        },
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Formato de dados inválido');
      }

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

      const byId: Record<number, TemperaturaCamaraOnline[]> = {};
      for (const it of normalized) {
        if (!it || !Number.isFinite(it.camara_id) || !it.data_hora) continue;
        const id = it.camara_id;
        byId[id] = Array.isArray(byId[id]) ? byId[id] : [];
        byId[id].push(it);
      }

      for (const id of Object.keys(byId)) {
        byId[Number(id)] = byId[Number(id)].sort(
          (a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime()
        );
      }

      setHistorico(byId);
    } catch {
      setHistorico({});
    }
  }, [camaraIdParam, dataInicial, dataFinal]);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  const camarasIds = useMemo(() => {
    const ids = new Set<number>();

    for (const item of dadosTemperaturasOnline) {
      if (item?.camara_id !== undefined && Number.isFinite(item.camara_id)) ids.add(item.camara_id);
    }

    for (const idStr of Object.keys(historico)) {
      const id = Number(idStr);
      if (Number.isFinite(id)) ids.add(id);
    }

    return Array.from(ids).sort((a, b) => a - b);
  }, [dadosTemperaturasOnline, historico]);

  const series = useMemo(() => {
    if (camaraIdParam === null) return [];
    const list = historico[camaraIdParam] ?? [];
    return [...list]
      .filter((x) => Boolean(x?.data_hora))
      .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());
  }, [historico, camaraIdParam]);

  const dateRange = useMemo(() => {
    const toUtcMs = (value: string, isEnd: boolean): number | null => {
      if (!value) return null;
      const suffix = isEnd ? 'T23:59:59.999Z' : 'T00:00:00.000Z';
      const dt = new Date(`${value}${suffix}`);
      if (Number.isNaN(dt.getTime())) return null;
      return dt.getTime();
    };
    return {
      startMs: toUtcMs(dataInicial, false),
      endMs: toUtcMs(dataFinal, true),
    };
  }, [dataInicial, dataFinal]);

  const seriesFiltered = useMemo(() => {
    if (dateRange.startMs === null && dateRange.endMs === null) return series;
    return series.filter((it) => {
      if (!it?.data_hora) return false;
      const ms = new Date(it.data_hora).getTime();
      if (!Number.isFinite(ms)) return false;
      if (dateRange.startMs !== null && ms < dateRange.startMs) return false;
      if (dateRange.endMs !== null && ms > dateRange.endMs) return false;
      return true;
    });
  }, [series, dateRange.startMs, dateRange.endMs]);

  const lastRecord = seriesFiltered.length > 0 ? seriesFiltered[seriesFiltered.length - 1] : null;

  const chartData = useMemo<TemperaturasHistoricoChartPoint[]>(() => {
    return seriesFiltered.map((r) => ({
      time: r.data_hora?.slice(11, 19) ?? '',
      temperatura1: r.temperatura_1 ?? null,
      temperatura2: r.temperatura_2 ?? null,
      temperatura3: r.temperatura_3 ?? null,
      media: mediaTemperaturas(r),
      portaStatus: r.porta_aberta === null ? null : r.porta_aberta ? 1 : 0,
    }));
  }, [seriesFiltered]);

  return {
    historico,
    camarasIds,
    seriesFiltered,
    lastRecord,
    chartData,
    loading,
    error,
    carregarHistorico,
  };
};

