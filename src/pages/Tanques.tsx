import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Droplets, History } from 'lucide-react';
import { useNivelIbcs, type DadosNivel } from '@/hooks/useNivelIbcs';

const MAQUINAS = ['1', '2', '3'];
const LINHAS_IBC = Array.from({ length: 12 }, (_, i) => `L${String(i + 1).padStart(2, '0')}`);
const NIVEL_MAX_PADRAO = 1000;

const ordenarLinhas = (linhas: string[]) =>
  [...linhas].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const calcularNivelMax = (dados: DadosNivel[]) => {
  const valores = dados
    .map((item) => Number(item.nivel))
    .filter((valor) => Number.isFinite(valor));
  return Math.max(NIVEL_MAX_PADRAO, ...valores, 1);
};

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

const formatNivel = (value: number | null | undefined) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return value.toFixed(2);
};

const nivelPct = (nivel: number | null | undefined, nivelMax: number) => {
  if (nivel === null || nivel === undefined || !Number.isFinite(nivel)) return 0;
  return Math.min(100, Math.max(0, (nivel / nivelMax) * 100));
};

const getNivelColor = (pct: number) => {
  if (pct <= 0) return 'bg-muted/60';
  if (pct < 25) return 'bg-red-500';
  if (pct < 50) return 'bg-orange-500';
  if (pct < 75) return 'bg-yellow-500';
  return 'bg-green-500';
};

const TanqueVisual = ({
  nivel,
  produto,
  nivelMax,
}: {
  nivel: number | null;
  produto: string;
  nivelMax: number;
}) => {
  const pct = nivelPct(nivel, nivelMax);
  const fillColor = getNivelColor(pct);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-14 h-32 rounded-lg border-2 border-industrial-primary/30 bg-muted/20 overflow-hidden">
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${fillColor}`}
          style={{ height: `${pct}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Droplets className="h-5 w-5 text-white/40" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center line-clamp-2 min-h-[2rem]">
        {produto || 'Sem produto'}
      </p>
    </div>
  );
};

const TanqueCard = ({
  maquina,
  linha,
  tanque,
  nivelMax,
  onNavigate,
}: {
  maquina: string;
  linha: string;
  tanque: DadosNivel | null;
  nivelMax: number;
  onNavigate: (path: string) => void;
}) => {
  const hasData = tanque !== null;
  const pct = nivelPct(tanque?.nivel, nivelMax);

  return (
    <Card
      className="border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      role="button"
      tabIndex={0}
      onClick={() => onNavigate(`/tanques-historico/${maquina}?linha=${linha}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onNavigate(`/tanques-historico/${maquina}?linha=${linha}`);
        }
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3">
        <CardTitle className="text-sm font-semibold">Tanque {linha}</CardTitle>
        <Badge
          className={
            hasData
              ? 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800'
              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800'
          }
        >
          {hasData ? 'Online' : 'Sem dados'}
        </Badge>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-2">
        <div className="flex justify-center">
          <TanqueVisual
            nivel={tanque?.nivel ?? null}
            produto={tanque?.produto ?? ''}
            nivelMax={nivelMax}
          />
        </div>

        <div className="text-center">
          <p className="text-xl font-bold text-industrial-primary">{formatNivel(tanque?.nivel)}</p>
          <p className="text-xs text-muted-foreground">Nível</p>
        </div>

        <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getNivelColor(pct)}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Atualizado</span>
          </div>
          <span className="text-foreground text-right text-[10px] sm:text-xs">
            {formatDateTime(tanque?.data ?? '')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const TanquesMaquina = ({ maquina }: { maquina: string }) => {
  const navigate = useNavigate();
  const { dadosNivel, loading, error, carregarDadosNivel } = useNivelIbcs(maquina, 'online');

  useEffect(() => {
    const interval = setInterval(() => carregarDadosNivel(), 5000);
    return () => clearInterval(interval);
  }, [carregarDadosNivel]);

  const tanquesMap = useMemo(() => {
    const map = new Map<string, DadosNivel>();

    for (const item of dadosNivel) {
      const key = String(item.linha);
      const existing = map.get(key);
      if (!existing || new Date(item.data).getTime() >= new Date(existing.data).getTime()) {
        map.set(key, item);
      }
    }

    return map;
  }, [dadosNivel]);

  const nivelMax = useMemo(() => calcularNivelMax(dadosNivel), [dadosNivel]);

  const linhasExibir = useMemo(() => {
    const fromApi = [...tanquesMap.keys()];
    const merged = new Set([...LINHAS_IBC, ...fromApi]);
    return ordenarLinhas([...merged]);
  }, [tanquesMap]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-industrial-primary hover:text-industrial-primary"
          onClick={() => navigate(`/tanques-historico/${maquina}`)}
        >
          <History className="h-4 w-4 mr-1" />
          Ver histórico desta máquina
        </Button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando níveis dos tanques...</p>
      ) : null}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {linhasExibir.map((linha) => (
          <TanqueCard
            key={linha}
            maquina={maquina}
            linha={linha}
            tanque={tanquesMap.get(linha) ?? null}
            nivelMax={nivelMax}
            onNavigate={navigate}
          />
        ))}
      </div>
    </div>
  );
};

const Tanques = () => {
  const navigate = useNavigate();
  const [maquinaAtiva, setMaquinaAtiva] = useState(MAQUINAS[0]);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-industrial-primary">Nível dos Tanques IBC</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  12 tanques por máquina — atualização a cada 5 segundos
                </p>
              </div>
              <Button
                variant="outline"
                className="border-industrial-primary text-industrial-primary hover:bg-industrial-primary/10"
                onClick={() => navigate('/tanques-historico')}
              >
                <History className="h-4 w-4 mr-2" />
                Histórico de consumo
              </Button>
            </div>

            <Tabs value={maquinaAtiva} onValueChange={setMaquinaAtiva}>
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
                {MAQUINAS.map((maquina) => (
                  <TabsTrigger key={maquina} value={maquina}>
                    Máquina {maquina}
                  </TabsTrigger>
                ))}
              </TabsList>

              {MAQUINAS.map((maquina) => (
                <TabsContent key={maquina} value={maquina}>
                  {maquinaAtiva === maquina && <TanquesMaquina maquina={maquina} />}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Tanques;
