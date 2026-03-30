import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { useListaTemperaturasOnline, type TemperaturaCamaraOnline } from '@/hooks/useTemperaturasOnline';

const formatDateTime = (value: string) => {
  if (!value) return '—';
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

const Temperaturas = () => {
  const navigate = useNavigate();
  const { dadosTemperaturasOnline, loading, error } = useListaTemperaturasOnline();

  const temperaturaById = React.useMemo(() => {
    const map = new Map<number, TemperaturaCamaraOnline>();
    for (const item of dadosTemperaturasOnline) {
      if (item && Number.isFinite(item.camara_id)) {
        map.set(item.camara_id, item);
      }
    }
    return map;
  }, [dadosTemperaturasOnline]);

  const camaras = Array.from({ length: 6 }).map((_, index) => {
    const camaraId = index + 1;
    const found = temperaturaById.get(camaraId);

    if (found) return found;

    return {
      camara_id: camaraId,
      empresa: '',
      unidade: '',
      data_hora: '',
      temperatura_1: null,
      temperatura_2: null,
      temperatura_3: null,
      porta_aberta: null,
      status: '',
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
              Monitoramento das temperaturas das Câmaras
            </h2>

            {error ? (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            ) : loading ? (
              <p className="text-sm text-muted-foreground mb-4">
                Carregando dados de temperaturas...
              </p>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {camaras.map((camara) => {
                const values = [camara.temperatura_1, camara.temperatura_2, camara.temperatura_3].filter(
                  (v): v is number => v !== null && v !== undefined
                );
                const media = values.length > 0 ? values.reduce((acc, v) => acc + v, 0) / values.length : null;

                const isOnline = values.length > 0;
                const isPortaAberta = camara.porta_aberta === true;

                const portaLabel = camara.porta_aberta === null ? '—' : isPortaAberta ? 'Aberta' : 'Fechada';
                const portaColor = isPortaAberta
                  ? 'bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800'
                  : 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800';

                const statusColor =
                  isOnline
                    ? 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800';

                return (
                  <Card
                    key={camara.camara_id}
                    className="border border-industrial-primary/20 cursor-pointer hover:shadow-md transition-shadow"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/temperaturas-historico/${camara.camara_id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        navigate(`/temperaturas-historico/${camara.camara_id}`);
                      }
                    }}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-semibold">
                        Câmara {camara.camara_id}
                      </CardTitle>
                      <Badge className={statusColor}>{isOnline ? 'Online' : 'Sem dados'}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Temperatura 1
                          </p>
                          <p className="text-lg font-semibold">
                            {camara.temperatura_1 === null ? '—' : `${camara.temperatura_1.toFixed(1)}°C`}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Temperatura 2
                          </p>
                          <p className="text-lg font-semibold">
                            {camara.temperatura_2 === null ? '—' : `${camara.temperatura_2.toFixed(1)}°C`}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Temperatura 3
                          </p>
                          <p className="text-lg font-semibold">
                            {camara.temperatura_3 === null ? '—' : `${camara.temperatura_3.toFixed(1)}°C`}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Média
                          </p>
                          <p className="text-lg font-semibold">
                            {media === null ? '—' : `${media.toFixed(1)}°C`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t text-xs gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Porta</span>
                          <Badge className={portaColor}>{portaLabel}</Badge>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatDateTime(camara.data_hora)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Temperaturas;
