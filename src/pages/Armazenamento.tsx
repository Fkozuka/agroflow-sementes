import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const camaras = Array.from({ length: 6 }).map((_, index) => ({
  id: index + 1,
  nome: `Câmara ${index + 1}`,
  tempAlta: 18 + (index % 3),
  tempBaixa: 14 + (index % 3),
  tempSensorPorta: 16 + (index % 2),
  portaAberta: index % 4 === 0,
  status: index % 5 === 0 ? 'Alerta' : 'Normal',
}));

const Armazenamento = () => {
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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {camaras.map((camara) => {
                const media =
                  (camara.tempAlta + camara.tempBaixa + camara.tempSensorPorta) / 3;

                const portaLabel = camara.portaAberta ? 'Aberta' : 'Fechada';
                const portaColor = camara.portaAberta
                  ? 'bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800'
                  : 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800';

                const statusColor =
                  camara.status === 'Normal'
                    ? 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800';

                return (
                  <Card key={camara.id} className="border border-industrial-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-semibold">
                        {camara.nome}
                      </CardTitle>
                      <Badge className={statusColor}>{camara.status}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Temperatura 1
                          </p>
                          <p className="text-lg font-semibold">
                            {camara.tempAlta.toFixed(1)}°C
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Temperatura 2
                          </p>
                          <p className="text-lg font-semibold">
                            {camara.tempBaixa.toFixed(1)}°C
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Temperatura 3
                          </p>
                          <p className="text-lg font-semibold">
                            {camara.tempSensorPorta.toFixed(1)}°C
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Média
                          </p>
                          <p className="text-lg font-semibold">
                            {media.toFixed(1)}°C
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Porta</span>
                          <Badge className={portaColor}>{portaLabel}</Badge>
                        </div>
                        <span className="text-muted-foreground">
                          Atualizado há poucos segundos
                        </span>
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

export default Armazenamento;

