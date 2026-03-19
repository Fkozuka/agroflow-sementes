import { useCallback, useEffect, useMemo, useState } from 'react';
import { useListaEnergiaOnline, type EnergiaMaquinaOnline } from './useEnergiaOnline';
import axios from 'axios';

export type EnergiaHistoricoChartPoint = {
  time: string;
  tensaoA: number | null;
  tensaoB: number | null;
  tensaoC: number | null;
  correnteA: number | null;
  correnteB: number | null;
  correnteC: number | null;
  potenciaAtiva: number | null;
  potenciaAparente: number | null;
  energiaAtiva: number | null;
};

export const formatValue1Decimal = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' && Number.isFinite(value)) return value.toFixed(1);
  return String(value);
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

export const useEnergiaHistorico = (
  maquinaIdParam: number | null,
  dataInicial: string,
  dataFinal: string
) => {
  const { dadosEnergiaOnline, loading, error } = useListaEnergiaOnline();

  const [historico, setHistorico] = useState<Record<number, EnergiaMaquinaOnline[]>>({});

  const carregarHistorico = useCallback(async () => {
    try {
      const response = await axios.get(`http://10.99.2.17:1881/energia-historico`, {
        params: {
          maquinaId: maquinaIdParam || undefined,
          dateInicial: dataInicial || undefined,
          dateFinal: dataFinal || undefined,
        },
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Formato de dados inválido');
      }

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

      const byId: Record<number, EnergiaMaquinaOnline[]> = {};
      for (const it of normalized) {
        if (!it || !Number.isFinite(it.maquina_id) || !it.data_hora) continue;
        const id = it.maquina_id;
        byId[id] = Array.isArray(byId[id]) ? byId[id] : [];
        byId[id].push(it);
      }

      // Ordena por data_hora para facilitar a série.
      for (const id of Object.keys(byId)) {
        byId[Number(id)] = byId[Number(id)].sort(
          (a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime()
        );
      }

      setHistorico(byId);
    } catch {
      setHistorico({});
    }
  }, [maquinaIdParam, dataInicial, dataFinal]);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  const maquinasIds = useMemo(() => {
    const ids = new Set<number>();

    for (const item of dadosEnergiaOnline) {
      if (item?.maquina_id !== undefined && Number.isFinite(item.maquina_id)) ids.add(item.maquina_id);
    }

    for (const idStr of Object.keys(historico)) {
      const id = Number(idStr);
      if (Number.isFinite(id)) ids.add(id);
    }

    return Array.from(ids).sort((a, b) => a - b);
  }, [dadosEnergiaOnline, historico]);

  const series = useMemo(() => {
    if (maquinaIdParam === null) return [];

    const list = historico[maquinaIdParam] ?? [];
    return [...list]
      .filter((x) => Boolean(x?.data_hora))
      .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());
  }, [historico, maquinaIdParam]);

  const dateRange = useMemo(() => {
    const toUtcMs = (value: string, isEnd: boolean): number | null => {
      if (!value) return null;
      const suffix = isEnd ? 'T23:59:59.999Z' : 'T00:00:00.000Z';
      const dt = new Date(`${value}${suffix}`);
      if (Number.isNaN(dt.getTime())) return null;
      return dt.getTime();
    };

    const startMs = toUtcMs(dataInicial, false);
    const endMs = toUtcMs(dataFinal, true);
    return { startMs, endMs };
  }, [dataInicial, dataFinal]);

  const filterByDate = useCallback(
    (items: EnergiaMaquinaOnline[]) => {
      if (dateRange.startMs === null && dateRange.endMs === null) return items;

      return items.filter((it) => {
        if (!it?.data_hora) return false;
        const ms = new Date(it.data_hora).getTime();
        if (!Number.isFinite(ms)) return false;

        if (dateRange.startMs !== null && ms < dateRange.startMs) return false;
        if (dateRange.endMs !== null && ms > dateRange.endMs) return false;
        return true;
      });
    },
    [dateRange.startMs, dateRange.endMs]
  );

  const seriesFiltered = useMemo(() => filterByDate(series), [series, filterByDate]);

  const lastRecord =
    seriesFiltered.length > 0 ? seriesFiltered[seriesFiltered.length - 1] : null;

  const chartData = useMemo<EnergiaHistoricoChartPoint[]>(() => {
    const slice = seriesFiltered.slice(Math.max(0, seriesFiltered.length - 30));

    return slice.map((r) => ({
      time: r.data_hora?.slice(11, 19) ?? '',
      tensaoA: r.tensao_fase_a ?? null,
      tensaoB: r.tensao_fase_b ?? null,
      tensaoC: r.tensao_fase_c ?? null,
      correnteA: r.corrente_fase_a ?? null,
      correnteB: r.corrente_fase_b ?? null,
      correnteC: r.corrente_fase_c ?? null,
      potenciaAtiva: r.potencia_ativa_total ?? null,
      potenciaAparente: r.potencia_aparente_total ?? null,
      energiaAtiva: r.energia_ativa_consumida ?? null,
    }));
  }, [seriesFiltered]);

  return {
    historico,
    maquinasIds,
    seriesFiltered,
    lastRecord,
    chartData,
    loading,
    error,
    carregarHistorico,
  };
};

