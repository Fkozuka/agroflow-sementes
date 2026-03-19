import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, Gauge, Droplets, Zap } from 'lucide-react';

type EnergiaMaquinaOnline = {
  maquina_id: number;
  empresa: string;
  unidade: string;
  data_hora: string; // TIMESTAMP (ISO string)

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

const formatDateTime = (value: string) => {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
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

const maquinasOnlineMock: EnergiaMaquinaOnline[] = Array.from({ length: 18 }).map(
  (_, index) => {
    const maquinaId = index + 1;

    // Mock determinístico: valores variam com o ID da máquina.
    const tensaoA = 220 + (maquinaId % 5) * 0.4;
    const tensaoB = 221 + (maquinaId % 4) * 0.5;
    const tensaoC = 219 + (maquinaId % 3) * 0.6;

    const correnteA = 10.2 + (maquinaId % 6) * 0.3;
    const correnteB = 10.0 + (maquinaId % 5) * 0.25;
    const correnteC = 9.8 + (maquinaId % 4) * 0.28;

    const potenciaAtiva = 5.2 + (maquinaId % 7) * 0.35; // kW
    const potenciaAparente = 6.0 + (maquinaId % 7) * 0.4; // kVA

    const energiaConsumida = 1.234 + (maquinaId % 9) * 0.087; // kWh

    return {
      maquina_id: maquinaId,
      empresa: 'AgroFlow Sementes',
      unidade: `Unidade ${((maquinaId - 1) % 3) + 1}`,
      data_hora: new Date(Date.now() - maquinaId * 60_000).toISOString(),

      tensao_fase_a: tensaoA,
      tensao_fase_b: tensaoB,
      tensao_fase_c: tensaoC,

      corrente_fase_a: correnteA,
      corrente_fase_b: correnteB,
      corrente_fase_c: correnteC,

      potencia_ativa_total: potenciaAtiva,
      potencia_aparente_total: potenciaAparente,

      energia_ativa_consumida: energiaConsumida,
    };
  }
);

const maxPotenciaAtivaMock = Math.max(
  ...maquinasOnlineMock.map((m) => m.potencia_ativa_total ?? 0),
  1
);
const maxPotenciaAparenteMock = Math.max(
  ...maquinasOnlineMock.map((m) => m.potencia_aparente_total ?? 0),
  1
);

const Energia = () => {
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

            <TooltipProvider delayDuration={0}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {maquinasOnlineMock.map((maquina) => {
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
                                  min={200}
                                  max={240}
                                  expectedMin={215}
                                  expectedMax={225}
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
                                  max={20}
                                  expectedMin={9.2}
                                  expectedMax={11.0}
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
                            max={maxPotenciaAtivaMock}
                            expectedMin={0}
                            expectedMax={8}
                            className="h-2"
                          />

                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-muted-foreground">Aparente</span>
                            <span className="text-xs font-semibold whitespace-nowrap">
                              {formatNumber(maquina.potencia_aparente_total, 2)} kVA
                            </span>
                          </div>
                          <ExpectedRangeProgress
                            value={maquina.potencia_aparente_total}
                            min={0}
                            max={maxPotenciaAparenteMock}
                            expectedMin={0}
                            expectedMax={10}
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

