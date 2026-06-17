import React, { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNivelIbcs } from '@/hooks/useNivelIbcs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const MAQUINAS = ['1', '2', '3'];
const LINHAS_IBC = Array.from({ length: 12 }, (_, i) => `L${String(i + 1).padStart(2, '0')}`);

const ordenarLinhas = (linhas: string[]) =>
  [...linhas].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const CHART_COLORS = ['#2563eb', '#16a34a', '#ea580c', '#9333ea'];

const formatDateTime = (value: string) => {
  if (!value) return '—';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(dt);
};

const formatChartTime = (value: string) => {
  if (!value) return '';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    hour12: false,
  }).format(dt);
};

const TanquesHistorico = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const maquinaParam = params.maquina ?? null;
  const linhaParam = searchParams.get('linha');

  const hoje = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [dataInicial, setDataInicial] = React.useState(hoje);
  const [dataFinal, setDataFinal] = React.useState(hoje);
  const [dataInicialFiltro, setDataInicialFiltro] = React.useState(hoje);
  const [dataFinalFiltro, setDataFinalFiltro] = React.useState(hoje);
  const [linhaFiltro, setLinhaFiltro] = React.useState<string>(linhaParam ?? 'todas');

  const { dadosNivel, loading, error } = useNivelIbcs(
    maquinaParam ?? undefined,
    'historico',
    dataInicialFiltro,
    dataFinalFiltro,
  );

  React.useEffect(() => {
    if (linhaParam) {
      setLinhaFiltro(linhaParam);
    }
  }, [linhaParam]);

  const dadosFiltrados = useMemo(() => {
    const sorted = [...dadosNivel].sort(
      (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime(),
    );

    if (linhaFiltro === 'todas') return sorted;
    return sorted.filter((item) => String(item.linha) === linhaFiltro);
  }, [dadosNivel, linhaFiltro]);

  const chartData = useMemo(() => {
    const byTime = new Map<string, Record<string, string | number | null>>();

    for (const item of dadosFiltrados) {
      const timeKey = item.data;
      if (!byTime.has(timeKey)) {
        byTime.set(timeKey, { time: timeKey });
      }
      const point = byTime.get(timeKey)!;
      point[`linha_${item.linha}`] = item.nivel;
      point[`produto_${item.linha}`] = item.produto;
    }

    return Array.from(byTime.values()).sort(
      (a, b) => new Date(String(a.time)).getTime() - new Date(String(b.time)).getTime(),
    );
  }, [dadosFiltrados]);

  const linhasNoGrafico = useMemo(() => {
    if (linhaFiltro !== 'todas') return [linhaFiltro];
    const set = new Set(dadosFiltrados.map((d) => String(d.linha)));
    return ordenarLinhas(LINHAS_IBC.filter((l) => set.has(l)));
  }, [dadosFiltrados, linhaFiltro]);

  const linhasDisponiveis = useMemo(() => {
    const set = new Set(dadosNivel.map((d) => String(d.linha)));
    const merged = new Set([...LINHAS_IBC, ...set]);
    return ordenarLinhas([...merged]);
  }, [dadosNivel]);

  const aplicarFiltro = () => {
    setDataInicialFiltro(dataInicial);
    setDataFinalFiltro(dataFinal);
  };

  const currentMaquinaIndex = maquinaParam ? MAQUINAS.indexOf(maquinaParam) : -1;
  const maquinaAnterior = currentMaquinaIndex > 0 ? MAQUINAS[currentMaquinaIndex - 1] : null;
  const proximaMaquina =
    currentMaquinaIndex >= 0 && currentMaquinaIndex < MAQUINAS.length - 1
      ? MAQUINAS[currentMaquinaIndex + 1]
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
                <h2 className="text-2xl font-bold text-industrial-primary">Tanques — Histórico de consumo</h2>
                <p className="text-sm text-muted-foreground">
                  {maquinaParam === null
                    ? 'Selecione uma máquina para ver o histórico'
                    : `Máquina ${maquinaParam}${linhaFiltro !== 'todas' ? ` — Tanque ${linhaFiltro}` : ''}`}
                </p>
              </div>
              <button
                type="button"
                className="text-sm text-industrial-primary hover:underline"
                onClick={() => navigate('/tanques')}
              >
                Voltar para Tanques
              </button>
            </div>

            {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}

            {maquinaParam === null ? (
              <>
                {loading ? (
                  <p className="text-sm text-muted-foreground mb-4">Carregando...</p>
                ) : null}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {MAQUINAS.map((maquina) => (
                    <Card
                      key={maquina}
                      className="border border-industrial-primary/20 cursor-pointer hover:shadow-md transition-shadow"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/tanques-historico/${maquina}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          navigate(`/tanques-historico/${maquina}`);
                        }
                      }}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Máquina {maquina}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">12 tanques IBC</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Clique para ver o histórico de nível e consumo
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Filtros</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col lg:flex-row flex-wrap gap-4 items-end">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Data inicial</label>
                      <Input
                        type="date"
                        value={dataInicial}
                        onChange={(e) => setDataInicial(e.target.value)}
                        className="w-[180px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Data final</label>
                      <Input
                        type="date"
                        value={dataFinal}
                        onChange={(e) => setDataFinal(e.target.value)}
                        className="w-[180px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Tanque</label>
                      <Select value={linhaFiltro} onValueChange={setLinhaFiltro}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Tanque" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todos os tanques</SelectItem>
                          {linhasDisponiveis.map((linha) => (
                            <SelectItem key={linha} value={linha}>
                              Tanque {linha}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="bg-industrial-primary hover:bg-industrial-primary/90"
                      onClick={aplicarFiltro}
                    >
                      Aplicar filtro
                    </Button>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!maquinaAnterior}
                    onClick={() => navigate(`/tanques-historico/${maquinaAnterior}`)}
                  >
                    ← Máquina anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!proximaMaquina}
                    onClick={() => navigate(`/tanques-historico/${proximaMaquina}`)}
                  >
                    Próxima máquina →
                  </Button>
                </div>

                {loading ? (
                  <p className="text-sm text-muted-foreground">Carregando histórico...</p>
                ) : null}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Evolução do nível</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[320px]">
                    {chartData.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum registro no período selecionado.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="time"
                            tickFormatter={formatChartTime}
                            minTickGap={30}
                            fontSize={11}
                          />
                          <YAxis fontSize={11} />
                          <RechartsTooltip
                            labelFormatter={(label) => formatDateTime(String(label))}
                            formatter={(value: number) => [value?.toFixed?.(2) ?? value, 'Nível']}
                          />
                          <Legend />
                          {linhasNoGrafico.map((linha, index) => (
                            <Line
                              key={linha}
                              type="monotone"
                              dataKey={`linha_${linha}`}
                              name={`Tanque ${linha}`}
                              stroke={CHART_COLORS[index % CHART_COLORS.length]}
                              dot={false}
                              connectNulls
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Registros</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Tanque</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Nível</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dadosFiltrados.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                              Nenhum registro encontrado.
                            </TableCell>
                          </TableRow>
                        ) : (
                          [...dadosFiltrados].reverse().map((item) => (
                            <TableRow key={`${item.linha}-${item.data}-${item.nivel}`}>
                              <TableCell>{formatDateTime(item.data)}</TableCell>
                              <TableCell>{item.linha}</TableCell>
                              <TableCell>{item.produto || '—'}</TableCell>
                              <TableCell className="text-right font-medium">
                                {Number(item.nivel).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
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

export default TanquesHistorico;
