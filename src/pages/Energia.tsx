import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, Gauge, Droplets, Zap } from 'lucide-react';
import { useListaEnergiaOnline, type EnergiaMaquinaOnline } from '@/hooks/useEnergiaOnline';

const formatDateTime = (value: string) => {
  if (!value) return '—';

  // O servidor envia ISO com `Z` (UTC). Para manter o mesmo instante,
  // exibimos em UTC e com formato mais legível.
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(dt);
};

const formatNumber = (value: number | null, decimals: number) => {
  if (value === null || value === undefined) return '—';
  return value.toFixed(decimals);
};

const toPct = (value: number | null, min: number, max: number) => {
  if (value === null || value === undefined) return 0;
  if (max <= min) return 0;
  const clamped = Math.min(max, Math.max(min, value));
  return ((clamped - min) / (max - min)) * 100;
};

const ExpectedRangeProgress = ({
  value,
  min,
  max,
  expectedMin,
  expectedMax,
  className = 'h-2',
}: {
  value: number | null;
  min: number;
  max: number;
  expectedMin: number;
  expectedMax: number;
  className?: string;
}) => {
  const isNull = value === null || value === undefined;

  const pct = toPct(value, min, max);
  const expectedMinPct = toPct(expectedMin, min, max);
  const expectedMaxPct = toPct(expectedMax, min, max);

  const safeExpectedMinPct = Math.min(expectedMinPct, expectedMaxPct);
  const safeExpectedMaxPct = Math.max(expectedMinPct, expectedMaxPct);

  const isExpected =
    !isNull && value! >= Math.min(expectedMin, expectedMax) && value! <= Math.max(expectedMin, expectedMax);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-full ${className} ${
        isNull ? 'bg-muted/30' : 'bg-red-500/15'
      }`}
    >
      {!isNull && (
        <div
          className="absolute top-0 bottom-0 bg-green-500/60"
          style={{
            left: `${safeExpectedMinPct}%`,
            width: `${Math.max(0, safeExpectedMaxPct - safeExpectedMinPct)}%`,
          }}
        />
      )}
      <div
        className={`absolute top-0 bottom-0 left-0 ${
          isNull ? 'bg-muted/60' : isExpected ? 'bg-green-600/80' : 'bg-red-600/80'
        }`}
        style={{ width: `${isNull ? 0 : pct}%` }}
      />
    </div>
  );
};

const Energia = () => {
  const { dadosEnergiaOnline, loading, error } = useListaEnergiaOnline();

  const energiaById = React.useMemo(() => {
    const map = new Map<number, EnergiaMaquinaOnline>();
    for (const item of dadosEnergiaOnline) {
      if (item && Number.isFinite(item.maquina_id)) {
        map.set(item.maquina_id, item);
      }
    }
    return map;
  }, [dadosEnergiaOnline]);

  const maxPotenciaAtivaMock = Math.max(
    1,
    ...dadosEnergiaOnline.map((m) => m.potencia_ativa_total ?? 0)
  );
  const maxPotenciaAparenteMock = Math.max(
    1,
    ...dadosEnergiaOnline.map((m) => m.potencia_aparente_total ?? 0)
  );

  const maquinas = Array.from({ length: 18 }).map((_, index) => {
    const maquinaId = index + 1;
    const found = energiaById.get(maquinaId);

    if (found) return found;

    return {
      maquina_id: maquinaId,
      empresa: '',
      unidade: '',
      data_hora: '',
      tensao_fase_a: null,
      tensao_fase_b: null,
      tensao_fase_c: null,
      corrente_fase_a: null,
      corrente_fase_b: null,
      corrente_fase_c: null,
      potencia_ativa_total: null,
      potencia_aparente_total: null,
      energia_ativa_consumida: null,
    };
  });

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="w-full">
            <h2 className="text-2xl font-bold text-industrial-primary mb-6">
              Monitoramento de consumo de Energia (Conela)
            </h2>

            {error ? (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            ) : loading ? (
              <p className="text-sm text-muted-foreground mb-4">
                Carregando dados de energia...
              </p>
            ) : null}

            <TooltipProvider delayDuration={0}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {maquinas.map((maquina) => {
                  const isOnline =
                    maquina.tensao_fase_a !== null ||
                    maquina.corrente_fase_a !== null ||
                    maquina.potencia_ativa_total !== null;

                  const statusColor = isOnline
                    ? 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800';

                  const tensaoMedia =
                    [maquina.tensao_fase_a, maquina.tensao_fase_b, maquina.tensao_fase_c].filter(
                      (v) => v !== null && v !== undefined
                    ) as number[];
                  const tensaoMediaValue =
                    tensaoMedia.length > 0
                      ? tensaoMedia.reduce((acc, v) => acc + v, 0) / tensaoMedia.length
                      : null;

                  const correnteMedia =
                    [maquina.corrente_fase_a, maquina.corrente_fase_b, maquina.corrente_fase_c].filter(
                      (v) => v !== null && v !== undefined
                    ) as number[];
                  const correnteMediaValue =
                    correnteMedia.length > 0
                      ? correnteMedia.reduce((acc, v) => acc + v, 0) / correnteMedia.length
                      : null;

                  return (
                    <Card
                      key={maquina.maquina_id}
                      className="border border-industrial-primary/20"
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold">
                          Máquina {maquina.maquina_id}
                        </CardTitle>
                        <Badge className={statusColor}>{isOnline ? 'Online' : 'Sem dados'}</Badge>
                      </CardHeader>

                      <CardContent className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Empresa</p>
                          <p className="text-sm font-semibold">{maquina.empresa}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Unidade</p>
                          <p className="text-sm font-semibold">{maquina.unidade}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Atualizado</span>
                        </div>
                        <span className="text-foreground">{formatDateTime(maquina.data_hora)}</span>
                      </div>

                      <Separator />

                      {/* TENSÃO */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Gauge className="h-4 w-4 text-industrial-primary" />
                            <span className="text-sm font-semibold">Tensão</span>
                          </div>
                        </div>

                        <div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-help w-full">
                                <ExpectedRangeProgress
                                  value={tensaoMediaValue}
                                  min={0}
                                  max={440}
                                  expectedMin={365}
                                  expectedMax={390}
                                  className="h-2"
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {tensaoMediaValue === null || tensaoMediaValue === undefined
                                ? 'Média (A/B/C): —'
                                : `Média (A/B/C): ${formatNumber(tensaoMediaValue, 2)} V`}
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: 'A', value: maquina.tensao_fase_a },
                            { label: 'B', value: maquina.tensao_fase_b },
                            { label: 'C', value: maquina.tensao_fase_c },
                          ].map((f) => (
                            <div
                              key={f.label}
                              className="rounded-md bg-muted/30 px-2 py-2 flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 min-w-[44px]">
                                <span className="text-xs font-semibold text-muted-foreground">{f.label}</span>
                              </div>
                              <span className="text-xs font-semibold whitespace-nowrap">
                                {formatNumber(f.value, 2)} V
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CORRENTE */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-industrial-primary" />
                            <span className="text-sm font-semibold">Corrente</span>
                          </div>
                        </div>

                        <div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-help w-full">
                                <ExpectedRangeProgress
                                  value={correnteMediaValue}
                                  min={0}
                                  max={70}
                                  expectedMin={0}
                                  expectedMax={63}
                                  className="h-2"
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {correnteMediaValue === null || correnteMediaValue === undefined
                                ? 'Média (A/B/C): —'
                                : `Média (A/B/C): ${formatNumber(correnteMediaValue, 2)} A`}
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: 'A', value: maquina.corrente_fase_a },
                            { label: 'B', value: maquina.corrente_fase_b },
                            { label: 'C', value: maquina.corrente_fase_c },
                          ].map((f) => (
                            <div
                              key={f.label}
                              className="rounded-md bg-muted/30 px-2 py-2 flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 min-w-[44px]">
                                <span className="text-xs font-semibold text-muted-foreground">{f.label}</span>
                              </div>
                              <span className="text-xs font-semibold whitespace-nowrap">
                                {formatNumber(f.value, 2)} A
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* POTÊNCIA */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-industrial-primary" />
                            <span className="text-sm font-semibold">Potência</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-muted-foreground">Ativa</span>
                            <span className="text-xs font-semibold whitespace-nowrap">
                              {formatNumber(maquina.potencia_ativa_total, 2)} kW
                            </span>
                          </div>
                          <ExpectedRangeProgress
                            value={maquina.potencia_ativa_total}
                            min={0}
                            max={42}
                            expectedMin={0}
                            expectedMax={34}
                            className="h-2"
                          />

                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-muted-foreground">Aparente</span>
                            <span className="text-xs font-semibold whitespace-nowrap">
                              {formatNumber(maquina.potencia_aparente_total, 2)} VA
                            </span>
                          </div>
                          <ExpectedRangeProgress
                            value={maquina.potencia_aparente_total}
                            min={0}
                            max={42}
                            expectedMin={0}
                            expectedMax={33}
                            className="h-2"
                          />
                        </div>
                      </div>

                      {/* ENERGIA */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-industrial-primary" />
                            <span className="text-sm font-semibold">Energia</span>
                          </div>
                        </div>

                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Ativa consumida</p>
                            <p className="text-xl font-bold leading-none">
                              {formatNumber(maquina.energia_ativa_consumida, 3)} kWh
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">ID</p>
                            <p className="text-sm font-semibold">{maquina.maquina_id}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TooltipProvider>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Energia;

