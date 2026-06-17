import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const linhas = [
  { id: 1, nome: 'Linha 1' },
  { id: 2, nome: 'Linha 2' },
  { id: 3, nome: 'Linha 3' },
];

const Expedicao = () => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="w-full">
            <h2 className="text-2xl font-bold text-industrial-primary mb-6">
              Expedição
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {linhas.map((linha) => (
                <Card
                  key={linha.id}
                  className="border border-industrial-primary/20 hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">{linha.nome}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Acompanhe os dados da {linha.nome.toLowerCase()}.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Expedicao;

