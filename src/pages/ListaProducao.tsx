import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Edit, 
  Trash2, 
  Play,
  Calendar,
  Package,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Dados mockados para demonstração
const producaoData = [
  {
    id: 'PROD-001',
    numeroOrdem: 'ORD-001',
    numeroLote: 'LOTE-2024-001',
    numeroPlanejamento: 'PLAN-2024-001',
    materiaPrima: 'Sementes de Milho Híbrido',
    produtoAcabado: 'Milho Híbrido AG 8088',
    quantidadeProduzir: 1500,
    pesoProduzir: 1500,
    unidade: 'kg',
    status: 'Em Produção',
    prioridade: 'Alta',
    dataInicio: '2024-01-15'
  },
  {
    id: 'PROD-002',
    numeroOrdem: 'ORD-002',
    numeroLote: 'LOTE-2024-002',
    numeroPlanejamento: 'PLAN-2024-002',
    materiaPrima: 'Sementes de Soja',
    produtoAcabado: 'Soja BMX Potência',
    quantidadeProduzir: 2000,
    pesoProduzir: 2000,
    unidade: 'kg',
    status: 'Concluída',
    prioridade: 'Média',
    dataInicio: '2024-01-10'
  },
  {
    id: 'PROD-003',
    numeroOrdem: 'ORD-003',
    numeroLote: 'LOTE-2024-003',
    numeroPlanejamento: 'PLAN-2024-003',
    materiaPrima: 'Sementes de Trigo',
    produtoAcabado: 'Trigo BRS 254',
    quantidadeProduzir: 800,
    pesoProduzir: 800,
    unidade: 'kg',
    status: 'Pendente',
    prioridade: 'Baixa',
    dataInicio: '2024-02-01'
  },
  {
    id: 'PROD-004',
    numeroOrdem: 'ORD-004',
    numeroLote: 'LOTE-2024-004',
    numeroPlanejamento: 'PLAN-2024-004',
    materiaPrima: 'Sementes de Feijão',
    produtoAcabado: 'Feijão BRS Estilo',
    quantidadeProduzir: 1200,
    pesoProduzir: 1200,
    unidade: 'kg',
    status: 'Em Produção',
    prioridade: 'Alta',
    dataInicio: '2024-01-20'
  },
  {
    id: 'PROD-005',
    numeroOrdem: 'ORD-005',
    numeroLote: 'LOTE-2024-005',
    numeroPlanejamento: 'PLAN-2024-005',
    materiaPrima: 'Sementes de Arroz',
    produtoAcabado: 'Arroz BRS Querência',
    quantidadeProduzir: 3000,
    pesoProduzir: 3000,
    unidade: 'kg',
    status: 'Concluída',
    prioridade: 'Média',
    dataInicio: '2024-01-05'
  }
];

const ListaProducao = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Produção':
        return 'bg-blue-100 text-blue-800';
      case 'Concluída':
        return 'bg-green-100 text-green-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta':
        return 'bg-red-100 text-red-800';
      case 'Média':
        return 'bg-yellow-100 text-yellow-800';
      case 'Baixa':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredData = producaoData.filter(item => {
    const matchesSearch = item.produtoAcabado.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.materiaPrima.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.numeroLote.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.numeroOrdem.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalQuantidade = producaoData.reduce((sum, item) => sum + item.quantidadeProduzir, 0);
  const emProducao = producaoData.filter(item => item.status === 'Em Produção').length;
  const concluidas = producaoData.filter(item => item.status === 'Concluída').length;

  const handleIniciarProducao = (item: any) => {
    setSelectedItem(item);
    setShowConfirmDialog(true);
  };

  const confirmarIniciarProducao = () => {
    // Aqui você pode adicionar a lógica para iniciar a produção
    console.log('Iniciando produção para:', selectedItem);
    setShowConfirmDialog(false);
    setSelectedItem(null);
    // Aqui você pode adicionar uma notificação de sucesso
  };

  const cancelarIniciarProducao = () => {
    setShowConfirmDialog(false);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-industrial-primary">Lista de Produção</h2>
               <Button className="bg-industrial-primary hover:bg-industrial-primary/90">
                 <RefreshCw className="mr-2 h-4 w-4" />
                 Atualizar Lotes
               </Button>
            </div>
            
            {/* Filtros e busca */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filtros e Busca</CardTitle>
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
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-industrial-primary"
                    >
                      <option value="Todos">Todos os Status</option>
                      <option value="Em Produção">Em Produção</option>
                      <option value="Concluída">Concluída</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de produção */}
            <Card>
              <CardHeader>
                <CardTitle>Lotes de Produção</CardTitle>
                <CardDescription>
                  Lista completa dos lotes de produção de sementes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Ordem</TableHead>
                      <TableHead>Nº Lote</TableHead>
                      <TableHead>Nº Planejamento</TableHead>
                      <TableHead>Matéria Prima</TableHead>
                      <TableHead>Produto Acabado</TableHead>
                      <TableHead>Qtd. Produzir</TableHead>
                      <TableHead>Peso Produzir</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Data Início</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.numeroOrdem}</TableCell>
                        <TableCell>{item.numeroLote}</TableCell>
                        <TableCell>{item.numeroPlanejamento}</TableCell>
                        <TableCell>{item.materiaPrima}</TableCell>
                        <TableCell>{item.produtoAcabado}</TableCell>
                        <TableCell>{item.quantidadeProduzir.toLocaleString()} {item.unidade}</TableCell>
                        <TableCell>{item.pesoProduzir.toLocaleString()} {item.unidade}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPrioridadeColor(item.prioridade)}>
                            {item.prioridade}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(item.dataInicio).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleIniciarProducao(item)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Popup de confirmação para iniciar produção */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Início de Produção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja iniciar a produção do lote <strong>{selectedItem?.numeroLote}</strong>?
              <br /><br />
              <strong>Detalhes do lote:</strong>
              <br />
              • Ordem: {selectedItem?.numeroOrdem}
              <br />
              • Produto: {selectedItem?.produtoAcabado}
              <br />
              • Quantidade: {selectedItem?.quantidadeProduzir?.toLocaleString()} {selectedItem?.unidade}
              <br />
              • Prioridade: {selectedItem?.prioridade}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelarIniciarProducao}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmarIniciarProducao}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirmar Início
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ListaProducao;
