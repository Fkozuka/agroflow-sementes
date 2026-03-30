import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useTemperaturasHistorico } from '@/hooks/useTemperaturasHistorico';
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

const formatPortaStatus = (value: any): string => {
  if (value === null || value === undefined) return '—';
  if (value === 1) return 'Aberta';
  if (value === 0) return 'Fechada';
  return String(value);
};

const TemperaturasHistorico = () => {
  const navigate = useNavigate();
  const params = useParams();

  const camaraIdParam = params.camaraId ? Number(params.camaraId) : null;
  const hojeUtc = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [dataInicial, setDataInicial] = React.useState<string>(hojeUtc);
  const [dataFinal, setDataFinal] = React.useState<string>(hojeUtc);
  const [dataInicialFiltro, setDataInicialFiltro] = React.useState<string>(hojeUtc);
  const [dataFinalFiltro, setDataFinalFiltro] = React.useState<string>(hojeUtc);

  const { historico, camarasIds, lastRecord, chartData, loading, error } = useTemperaturasHistorico(
    camaraIdParam,
    dataInicialFiltro,
    dataFinalFiltro
  );

  const currentCamaraIndex = React.useMemo(() => {
    if (camaraIdParam === null) return -1;
    return camarasIds.findIndex((id) => id === camaraIdParam);
  }, [camaraIdParam, camarasIds]);

  const camaraAnterior =
    currentCamaraIndex > 0 ? camarasIds[currentCamaraIndex - 1] : null;
  const proximaCamara =
    currentCamaraIndex >= 0 && currentCamaraIndex < camarasIds.length - 1
      ? camarasIds[currentCamaraIndex + 1]
      : null;

  const mediaAtual = React.useMemo(() => {
    if (!lastRecord) return null;
    const values = [lastRecord.temperatura_1, lastRecord.temperatura_2, lastRecord.temperatura_3].filter(
      (v): v is number => v !== null && v !== undefined
    );
    if (values.length === 0) return null;
    return values.reduce((acc, v) => acc + v, 0) / values.length;
  }, [lastRecord]);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="w-full">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-industrial-primary">Temperaturas - Histórico</h2>
                <p className="text-sm text-muted-foreground">
                  {camaraIdParam === null
                    ? 'Selecione um card para ver os registros'
                    : `Câmara ${camaraIdParam}`}
                </p>
              </div>
              <button
                type="button"
                className="text-sm text-industrial-primary hover:underline"
                onClick={() => navigate('/temperaturas')}
              >
                Voltar para Temperaturas
              </button>
            </div>

            {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}
            {loading && camaraIdParam === null ? (
              <p className="text-sm text-muted-foreground mb-4">Carregando histórico...</p>
            ) : null}

            {camaraIdParam === null ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {camarasIds.map((id) => {
                  const list = historico[id] ?? [];
                  const last = list.length > 0 ? list[list.length - 1] : null;

                  return (
                    <Card
                      key={id}
                      className="border border-industrial-primary/20 cursor-pointer hover:shadow-md"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/temperaturas-historico/${id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') navigate(`/temperaturas-historico/${id}`);
                      }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-base font-semibold">Câmara {id}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Temperatura média</span>
                          <span className="font-semibold">
                            {last?.temperatura_1 === null &&
                            last?.temperatura_2 === null &&
                            last?.temperatura_3 === null
                              ? '—'
                              : `${(
                                  ([last?.temperatura_1, last?.temperatura_2, last?.temperatura_3].filter(
                                    (v): v is number => v !== null && v !== undefined
                                  ) as number[]).reduce((acc, v) => acc + v, 0) /
                                  Math.max(
                                    1,
                                    [last?.temperatura_1, last?.temperatura_2, last?.temperatura_3].filter(
                                      (v): v is number => v !== null && v !== undefined
                                    ).length
                                  )
                                ).toFixed(1)}°C`}
                          </span>
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
                          Registros da Câmara {camaraIdParam}
                        </CardTitle>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="h-9 px-3 rounded-md border border-input bg-background text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={camaraAnterior === null}
                            onClick={() => {
                              if (camaraAnterior !== null) {
                                navigate(`/temperaturas-historico/${camaraAnterior}`);
                              }
                            }}
                          >
                            Anterior
                          </button>
                          <button
                            type="button"
                            className="h-9 px-3 rounded-md border border-input bg-background text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={proximaCamara === null}
                            onClick={() => {
                              if (proximaCamara !== null) {
                                navigate(`/temperaturas-historico/${proximaCamara}`);
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
                        <div className="text-xs text-muted-foreground">Temperatura média (°C)</div>
                        <div className="text-lg font-semibold">
                          {mediaAtual === null ? '—' : mediaAtual.toFixed(1)}
                        </div>
                      </div>
                      <div className="rounded-md bg-muted/30 p-3">
                        <div className="text-xs text-muted-foreground">Temperatura 3 (°C)</div>
                        <div className="text-lg font-semibold">
                          {lastRecord?.temperatura_3 === null || lastRecord?.temperatura_3 === undefined
                            ? '—'
                            : lastRecord.temperatura_3.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="text-sm font-semibold">Evolução (todos os registros do período)</div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-muted-foreground">
                            Temperaturas (1/2/3)
                          </div>
                          <div className="h-[200px]">
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
                                  dataKey="temperatura1"
                                  stroke="#f59e0b"
                                  dot={false}
                                  name="Temperatura 1 (°C)"
                                />
                                <Line
                                  type="monotone"
                                  dataKey="temperatura2"
                                  stroke="#22c55e"
                                  dot={false}
                                  name="Temperatura 2 (°C)"
                                />
                                <Line
                                  type="monotone"
                                  dataKey="temperatura3"
                                  stroke="#3b82f6"
                                  dot={false}
                                  name="Temperatura 3 (°C)"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-muted-foreground">
                            Média das Temperaturas
                          </div>
                          <div className="h-[170px]">
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
                                  dataKey="media"
                                  stroke="#a855f7"
                                  dot={false}
                                  name="Média (°C)"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-muted-foreground">
                            Status da Porta (Aberta/Fechada)
                          </div>
                          <div className="h-[150px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis
                                  domain={[0, 1]}
                                  ticks={[0, 1]}
                                  tickFormatter={(value: any) => formatPortaStatus(value)}
                                />
                                <RechartsTooltip
                                  formatter={(value: any) => [formatPortaStatus(value), 'Porta']}
                                />
                                <Line
                                  type="stepAfter"
                                  dataKey="portaStatus"
                                  stroke="#ef4444"
                                  dot={false}
                                  name="Status da Porta"
                                  connectNulls={false}
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

export default TemperaturasHistorico;

