import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface FiltrosEBuscaProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  dataInicial: string;
  setDataInicial: (value: string) => void;
  dataFinal: string;
  setDataFinal: (value: string) => void;
  totalFiltrado: number;
  totalGeral: number;
}

const FiltrosEBusca: React.FC<FiltrosEBuscaProps> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  dataInicial,
  setDataInicial,
  dataFinal,
  setDataFinal,
  totalFiltrado,
  totalGeral,
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filtros e Busca</CardTitle>
        <CardDescription>
          Mostrando {totalFiltrado} de {totalGeral} lotes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por produto, matéria prima, lote ou ordem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="date"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Data inicial"
            />
            <Input
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Data final"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-industrial-primary"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Programada">Programada</option>
              <option value="Separação">Separação</option>
              <option value="Pendente">Pendente</option>
              <option value="Cancelada">Cancelada</option>
              <option value="Em Produção">Em Produção</option>
              <option value="Concluída">Concluída</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FiltrosEBusca;

