import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useEnergiaHistorico } from '@/hooks/useEnergiaHistorico';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

const formatValue1Decimal = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' && Number.isFinite(value)) return value.toFixed(1);
  return String(value);
};

const EnergiaHistorico = () => {
  const navigate = useNavigate();
  const params = useParams();

  const maquinaIdParam = params.maquinaId ? Number(params.maquinaId) : null;

  // Por padrão, filtra pelo dia atual (no formato do input: YYYY-MM-DD).
  // Usamos ISO UTC para ficar consistente com a conversão do filtro em UTC.
  const hojeUtc = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [dataInicial, setDataInicial] = React.useState<string>(hojeUtc); // valor no input
  const [dataFinal, setDataFinal] = React.useState<string>(hojeUtc); // valor no input
  const [dataInicialFiltro, setDataInicialFiltro] = React.useState<string>(hojeUtc); // valor aplicado
  const [dataFinalFiltro, setDataFinalFiltro] = React.useState<string>(hojeUtc); // valor aplicado

  const { historico, maquinasIds, lastRecord, chartData, loading, error } = useEnergiaHistorico(
    maquinaIdParam,
    dataInicialFiltro,
    dataFinalFiltro
  );

  const currentMachineIndex = React.useMemo(() => {
    if (maquinaIdParam === null) return -1;
    return maquinasIds.findIndex((id) => id === maquinaIdParam);
  }, [maquinaIdParam, maquinasIds]);

  const maquinaAnterior =
    currentMachineIndex > 0 ? maquinasIds[currentMachineIndex - 1] : null;
  const proximaMaquina =
    currentMachineIndex >= 0 && currentMachineIndex < maquinasIds.length - 1
      ? maquinasIds[currentMachineIndex + 1]
      : null;

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="w-full">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-industrial-primary">Energia - Histórico</h2>
                <p className="text-sm text-muted-foreground">
                  {maquinaIdParam === null
                    ? 'Selecione um card para ver os registros'
                    : `Máquina ${maquinaIdParam}`}
                </p>
              </div>
              <button
                type="button"
                className="text-sm text-industrial-primary hover:underline"
                onClick={() => navigate('/energia')}
              >
                Voltar para Energia
              </button>
            </div>

          {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}
          {loading && maquinaIdParam === null ? (
            <p className="text-sm text-muted-foreground mb-4">Carregando histórico...</p>
          ) : null}

          {maquinaIdParam === null ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {maquinasIds.map((id) => {
                const list = historico[id] ?? [];
                const last = list.length > 0 ? list[list.length - 1] : null;
                const energia = last?.energia_ativa_consumida ?? null;

                return (
                  <Card
                    key={id}
                    className="border border-industrial-primary/20 cursor-pointer hover:shadow-md"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/energia-historico/${id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') navigate(`/energia-historico/${id}`);
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base font-semibold">Máquina {id}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Energia (kWh)</span>
                        <span className="font-semibold">{energia === null ? '—' : energia.toFixed(3)}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col items-start gap-3 w-full">
                    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <CardTitle className="text-base font-semibold">
                        Registros da Máquina {maquinaIdParam}
                      </CardTitle>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="h-9 px-3 rounded-md border border-input bg-background text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={maquinaAnterior === null}
                          onClick={() => {
                            if (maquinaAnterior !== null) {
                              navigate(`/energia-historico/${maquinaAnterior}`);
                            }
                          }}
                        >
                          Anterior
                        </button>
                        <button
                          type="button"
                          className="h-9 px-3 rounded-md border border-input bg-background text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={proximaMaquina === null}
                          onClick={() => {
                            if (proximaMaquina !== null) {
                              navigate(`/energia-historico/${proximaMaquina}`);
                            }
                          }}
                        >
                          Próxima
                        </button>
                      </div>
                    </div>

                    <div className="w-full flex flex-col sm:flex-row gap-3 sm:items-end sm:justify-end">
                      <div className="flex flex-col">
                        <label className="text-xs text-muted-foreground mb-1">
                          Data inicial
                        </label>
                        <Input
                          type="date"
                          value={dataInicial}
                          onChange={(e) => setDataInicial(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-muted-foreground mb-1">
                          Data final
                        </label>
                        <Input
                          type="date"
                          value={dataFinal}
                          onChange={(e) => setDataFinal(e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        className="h-10 px-3 rounded-md border border-input bg-background text-sm hover:bg-accent"
                        onClick={() => {
                          setDataInicialFiltro(dataInicial);
                          setDataFinalFiltro(dataFinal);
                        }}
                      >
                        Filtrar
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-md bg-muted/30 p-3">
                      <div className="text-xs text-muted-foreground">Energia ativa consumida (kWh)</div>
                      <div className="text-lg font-semibold">
                        {lastRecord?.energia_ativa_consumida === null || lastRecord?.energia_ativa_consumida === undefined
                          ? '—'
                          : lastRecord.energia_ativa_consumida.toFixed(3)}
                      </div>
                    </div>
                    <div className="rounded-md bg-muted/30 p-3">
                      <div className="text-xs text-muted-foreground">Potência ativa total (kW)</div>
                      <div className="text-lg font-semibold">
                        {lastRecord?.potencia_ativa_total === null || lastRecord?.potencia_ativa_total === undefined
                          ? '—'
                          : lastRecord.potencia_ativa_total.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm font-semibold">Evolução (todos os registros do período)</div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground">
                          Tensão (Fases A/B/C)
                        </div>
                        <div className="h-[180px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="time" />
                              <YAxis domain={[0, 440]} tickFormatter={formatValue1Decimal} />
                              <RechartsTooltip
                                formatter={(value: any, name: any) => [formatValue1Decimal(value), name]}
                              />
                              <Line
                                type="monotone"
                                dataKey="tensaoA"
                                stroke="#16a34a"
                                dot={false}
                                name="Tensão A (V)"
                              />
                              <Line
                                type="monotone"
                                dataKey="tensaoB"
                                stroke="#22c55e"
                                dot={false}
                                name="Tensão B (V)"
                              />
                              <Line
                                type="monotone"
                                dataKey="tensaoC"
                                stroke="#14b8a6"
                                dot={false}
                                name="Tensão C (V)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground">
                          Corrente (Fases A/B/C)
                        </div>
                        <div className="h-[180px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="time" />
                              <YAxis tickFormatter={formatValue1Decimal} />
                              <RechartsTooltip
                                formatter={(value: any, name: any) => [formatValue1Decimal(value), name]}
                              />
                              <Line
                                type="monotone"
                                dataKey="correnteA"
                                stroke="#2563eb"
                                dot={false}
                                name="Corrente A (A)"
                              />
                              <Line
                                type="monotone"
                                dataKey="correnteB"
                                stroke="#3b82f6"
                                dot={false}
                                name="Corrente B (A)"
                              />
                              <Line
                                type="monotone"
                                dataKey="correnteC"
                                stroke="#60a5fa"
                                dot={false}
                                name="Corrente C (A)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground">
                          Potência (Ativa/Aparente)
                        </div>
                        <div className="h-[180px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="time" />
                              <YAxis tickFormatter={formatValue1Decimal} />
                              <RechartsTooltip
                                formatter={(value: any, name: any) => [formatValue1Decimal(value), name]}
                              />
                              <Line
                                type="monotone"
                                dataKey="potenciaAtiva"
                                stroke="#f59e0b"
                                dot={false}
                                name="Potência Ativa (kW)"
                              />
                              <Line
                                type="monotone"
                                dataKey="potenciaAparente"
                                stroke="#ef4444"
                                dot={false}
                                name="Potência Aparente (kVA)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground">
                          Energia Ativa Consumida (kWh)
                        </div>
                        <div className="h-[180px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="time" />
                              <YAxis tickFormatter={formatValue1Decimal} />
                              <RechartsTooltip
                                formatter={(value: any, name: any) => [formatValue1Decimal(value), name]}
                              />
                              <Line
                                type="monotone"
                                dataKey="energiaAtiva"
                                stroke="#a855f7"
                                dot={false}
                                name="Energia (kWh)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnergiaHistorico;

