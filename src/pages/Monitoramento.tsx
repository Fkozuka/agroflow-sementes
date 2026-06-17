import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMonitoramentoEquipamentos } from '@/hooks/useMonitoramento';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

/** Alinhado ao payload de `/monitoramente` usado em `useMonitoramentoEquipamentos`. */
interface EquipamentoMonitoramento {
  id: number;
  codigo: string;
  tipo: string;
  status: string;
  corrente: number | null;
  data_hora: string;
  segurancao: boolean | null;
  bloqueio: boolean | null;
  intetravamento: boolean | null;
  chave_auto: boolean | null;
  falha_partida: boolean | null;
  falha_temp_mancal_sup: boolean | null;
  falha_temp_mancal_inf: boolean | null;
  falha_rotacao: boolean | null;
  confirma_partida: boolean | null;
}

const useTransportadorDetalhes = (transportador: EquipamentoMonitoramento | null) => {
  const [correnteHistorico, setCorrenteHistorico] = useState<{ time: string; corrente: number }[]>([]);
  const transportadorRef = useRef(transportador);
  transportadorRef.current = transportador;

  const sinais = useMemo(() => {
    if (!transportador) return [] as { label: string; ativo: boolean }[];
    const ok = (v: boolean | null) => v === true;
    const semFalha = (v: boolean | null) => v !== true;
    return [
      { label: 'Segurança', ativo: ok(transportador.segurancao) },
      { label: 'Sem bloqueio', ativo: !ok(transportador.bloqueio) },
      { label: 'Intertravamento', ativo: ok(transportador.intetravamento) },
      { label: 'Chave automática', ativo: ok(transportador.chave_auto) },
      { label: 'Partida', ativo: semFalha(transportador.falha_partida) },
      { label: 'Temp. mancal superior', ativo: semFalha(transportador.falha_temp_mancal_sup) },
      { label: 'Temp. mancal inferior', ativo: semFalha(transportador.falha_temp_mancal_inf) },
      { label: 'Rotação', ativo: semFalha(transportador.falha_rotacao) },
      { label: 'Confirma partida', ativo: ok(transportador.confirma_partida) },
    ];
  }, [transportador]);

  useEffect(() => {
    if (!transportador) {
      setCorrenteHistorico([]);
    }
  }, [transportador]);

  useEffect(() => {
    if (!transportador) return;
    setCorrenteHistorico([]);

    const amostrar = () => {
      const t = transportadorRef.current;
      if (!t) return;
      const c = t.corrente;
      if (c === null || c === undefined) return;
      setCorrenteHistorico((prev) => {
        const ponto = { time: new Date().toLocaleTimeString('pt-BR'), corrente: c };
        const next = [...prev, ponto];
        return next.length > 120 ? next.slice(-120) : next;
      });
    };
    amostrar();
    const id = setInterval(amostrar, 2000);
    return () => clearInterval(id);
  }, [transportador?.id, transportador?.codigo]);

  return { sinais, correnteHistorico };
};

const ListaEquipamentos = ({
  itens,
  onDetalhes,
  mostrarDetalhes = true,
  mostrarCorrente = true,
}: {
  itens: EquipamentoMonitoramento[];
  onDetalhes: (item: EquipamentoMonitoramento) => void;
  mostrarDetalhes?: boolean;
  mostrarCorrente?: boolean;
}) => (
  <div className="space-y-2">
    <div
      className={`hidden md:grid gap-3 px-3 py-2 rounded-md bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wide ${
        mostrarDetalhes && mostrarCorrente
          ? 'grid-cols-[1.1fr_1fr_1fr_1fr_auto]'
          : mostrarCorrente
          ? 'grid-cols-[1.2fr_1fr_1fr_1fr]'
          : 'grid-cols-[1.4fr_1fr_1fr]'
      }`}
    >
      <span>Código</span>
      <span>Tipo</span>
      <span>Status</span>
      {mostrarCorrente ? <span>Corrente</span> : null}
      {mostrarDetalhes ? <span className="text-right">Ação</span> : null}
    </div>
    <ul className="space-y-2">
    {itens.map((item) => (
      <li
        key={item.id}
        className="rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm hover:shadow-md transition-shadow"
      >
        <div
          className={`grid grid-cols-1 gap-2 md:gap-3 items-center ${
            mostrarDetalhes && mostrarCorrente
              ? 'md:grid-cols-[1.1fr_1fr_1fr_1fr_auto]'
              : mostrarCorrente
              ? 'md:grid-cols-[1.2fr_1fr_1fr_1fr]'
              : 'md:grid-cols-[1.4fr_1fr_1fr]'
          }`}
        >
          <div className="flex items-center justify-between md:block">
            <span className="text-muted-foreground md:hidden">Código</span>
            <span className="font-semibold">{item.codigo}</span>
          </div>
          <div className="flex items-center justify-between md:block">
            <span className="text-muted-foreground md:hidden">Tipo</span>
            <span>{item.tipo}</span>
          </div>
          <div className="flex items-center justify-between md:block">
            <span className="text-muted-foreground md:hidden">Status</span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                item.status === 'Alerta'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {item.status}
            </span>
          </div>
          {mostrarCorrente ? (
            <div className="flex items-center justify-between md:block">
              <span className="text-muted-foreground md:hidden">Corrente</span>
              <span className="font-medium">
                {item.corrente === null || item.corrente === undefined ? '—' : `${item.corrente.toFixed(1)} A`}
              </span>
            </div>
          ) : null}
          {mostrarDetalhes ? (
            <Button
              type="button"
              variant="outline"
              className="w-full md:w-auto md:justify-self-end"
              onClick={() => onDetalhes(item)}
            >
              Detalhes
            </Button>
          ) : null}
        </div>
      </li>
    ))}
    </ul>
  </div>
);

const Monitoramento = () => {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState<'transportador' | 'gaveta' | 'bifurcada'>('transportador');
  const { transportadores, gavetas, bifurcadas, loading, error } = useMonitoramentoEquipamentos(abaAtiva);
  const [transportadorSelecionado, setTransportadorSelecionado] = useState<EquipamentoMonitoramento | null>(null);
  const { sinais, correnteHistorico } = useTransportadorDetalhes(transportadorSelecionado);
  const popupAberto = transportadorSelecionado !== null;

  useEffect(() => {
    if (!transportadorSelecionado) return;
    const atualizado =
      transportadores.find((item) => item.codigo === transportadorSelecionado.codigo) ??
      transportadores.find((item) => item.id === transportadorSelecionado.id);
    if (atualizado) setTransportadorSelecionado(atualizado);
  }, [transportadores, transportadorSelecionado]);

  const handleDetalhes = (item: EquipamentoMonitoramento) => {
    if (item.tipo === 'Transportador') {
      setTransportadorSelecionado(item);
      return;
    }

    navigate(`/monitoramento/oee/${encodeURIComponent(item.tipo)}/${encodeURIComponent(item.codigo)}`, {
      state: item,
    });
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="w-full space-y-4">
            <h2 className="text-2xl font-bold text-industrial-primary">Monitoramento</h2>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {loading ? <p className="text-sm text-muted-foreground">Carregando dados de monitoramento...</p> : null}

            <Tabs
              value={abaAtiva}
              onValueChange={(value) =>
                setAbaAtiva(value as 'transportador' | 'gaveta' | 'bifurcada')
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transportador">Transportador</TabsTrigger>
                <TabsTrigger value="gaveta">Gaveta</TabsTrigger>
                <TabsTrigger value="bifurcada">Bifurcada</TabsTrigger>
              </TabsList>

              <TabsContent value="transportador">
                <Card className="border border-industrial-primary/20">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      Transportadores ({transportadores.length} equipamentos)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ListaEquipamentos itens={transportadores} onDetalhes={handleDetalhes} mostrarDetalhes />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gaveta">
                <Card className="border border-industrial-primary/20">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      Gavetas ({gavetas.length} equipamentos)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ListaEquipamentos
                      itens={gavetas}
                      onDetalhes={handleDetalhes}
                      mostrarDetalhes={false}
                      mostrarCorrente={false}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bifurcada">
                <Card className="border border-industrial-primary/20">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      Bifurcadas ({bifurcadas.length} equipamentos)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ListaEquipamentos
                      itens={bifurcadas}
                      onDetalhes={handleDetalhes}
                      mostrarDetalhes={false}
                      mostrarCorrente={false}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <Dialog
        open={popupAberto}
        onOpenChange={(open) => {
          if (!open) {
            setTransportadorSelecionado(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Detalhes do Transportador {transportadorSelecionado?.codigo ?? ''}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {sinais.map(({ label, ativo }) => {
              return (
                <div
                  key={label}
                  className="rounded-md border border-border bg-muted/30 px-3 py-2 flex items-center justify-between"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {ativo ? 'OK' : 'Falha'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-muted-foreground">
              Histórico de corrente (inicia ao abrir o popup)
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={correnteHistorico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: any) => [`${value} A`, 'Corrente']} />
                  <Line
                    type="monotone"
                    dataKey="corrente"
                    stroke="#2563eb"
                    dot={false}
                    name="Corrente (A)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Monitoramento;

