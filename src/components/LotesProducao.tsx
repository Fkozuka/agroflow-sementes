import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Edit, 
  Trash2, 
  Play,
  Package
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface LotesProducaoProps {
  filteredData: any[];
  loadingData: boolean;
  errorData: string | null;
  expandedRowId: string | number | null;
  setExpandedRowId: (value: string | number | null) => void;
  handleVerDetalhes: (rowId: string) => void;
  carregarStatusComandos: (numPlanej: string, status: string, observacao?: string) => Promise<any>;
  carregarDadosListaProducao: () => Promise<void>;
}

const LotesProducao: React.FC<LotesProducaoProps> = ({
  filteredData,
  loadingData,
  errorData,
  expandedRowId,
  setExpandedRowId,
  handleVerDetalhes,
  carregarStatusComandos,
  carregarDadosListaProducao,
}) => {
  const { toast } = useToast();
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Estados para os diálogos de confirmação
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showConfirmDialogSeparacao, setShowConfirmDialogSeparacao] = useState(false);
  const [showConfirmDialogExcluir, setShowConfirmDialogExcluir] = useState(false);
  const [observacaoExcluir, setObservacaoExcluir] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Calcular dados paginados
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Resetar para primeira página quando os dados filtrados mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredData.length]);

  // Função para mudar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll para o topo da tabela
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Função para gerar números de página a serem exibidos
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Se temos poucas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Sempre mostrar primeira página
      pages.push(1);

      if (currentPage <= 3) {
        // Perto do início
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Perto do fim
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // No meio
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Função para formatar data YYYYMMDD para DD/MM/YYYY
  const formatarData = (dataString: string): string => {
    if (!dataString || dataString.length !== 8) return '-';
    
    const ano = dataString.substring(0, 4);
    const mes = dataString.substring(4, 6);
    const dia = dataString.substring(6, 8);
    
    return `${dia}/${mes}/${ano}`;
  };

  // Função para formatar hora HHMMSS para HH:MM:SS
  const formatarHora = (horaString: string): string => {
    if (!horaString || horaString.length !== 6) return '-';
    
    const hora = horaString.substring(0, 2);
    const minuto = horaString.substring(2, 4);
    const segundo = horaString.substring(4, 6);
    
    return `${hora}:${minuto}:${segundo}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '1': // Programada
        return 'bg-blue-100 text-blue-800';
      case '2': // Separaçao
        return 'bg-yellow-100 text-yellow-800';
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

  // Handlers para os botões de ação
  const handleIniciarProducao = (item: any) => {
    setSelectedItem(item);
    setShowConfirmDialog(true);
  };

  const confirmarIniciarProducao = async () => {
    try {
      const resultado = await carregarStatusComandos(String(selectedItem?.numPlanej ?? ''), '1');
      if (resultado && resultado.statusErro === true) {
        toast({
          title: 'Falha ao iniciar produção',
          description: 'Não foi possível atualizar o status.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Produção iniciada',
          description: `Produção iniciada para o Nº Planej. ${selectedItem?.numPlanej}`,
        });
        setTimeout(() => carregarDadosListaProducao(), 500);
      }
    } catch (e) {
      toast({ title: 'Erro de conexão', description: 'Falha na comunicação com o servidor.', variant: 'destructive' });
    } finally {
      setShowConfirmDialog(false);
      setSelectedItem(null);
    }
  };

  const cancelarIniciarProducao = () => {
    setShowConfirmDialog(false);
    setSelectedItem(null);
  };

  const handleIniciarSeparacao = (item: any) => {
    setSelectedItem(item);
    setShowConfirmDialogSeparacao(true);
  };

  const confirmarIniciarSeparacao = async () => {
    try {
      const resultado = await carregarStatusComandos(String(selectedItem?.numPlanej ?? ''), '2');
      if (resultado && resultado.statusErro === true) {
        toast({
          title: 'Falha ao iniciar separação',
          description: 'Não foi possível atualizar o status.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Separação iniciada',
          description: `Separação iniciada para o Nº Planej. ${selectedItem?.numPlanej}`,
        });
        setTimeout(() => carregarDadosListaProducao(), 500);
      }
    } catch (e) {
      toast({ title: 'Erro de conexão', description: 'Falha na comunicação com o servidor.', variant: 'destructive' });
    } finally {
      setShowConfirmDialogSeparacao(false);
      setSelectedItem(null);
    }
  };

  const cancelarIniciarSeparacao = () => {
    setShowConfirmDialogSeparacao(false);
    setSelectedItem(null);
  };

  const handleExcluirProducao = (item: any) => {
    setSelectedItem(item);
    setObservacaoExcluir('');
    setShowConfirmDialogExcluir(true);
  };

  const confirmarExcluirProducao = async () => {
    if (!observacaoExcluir.trim()) {
      toast({
        title: "Observação obrigatória",
        description: "Por favor, informe o motivo da exclusão.",
        variant: "destructive",
      });
      return;
    }

    try {
      const resultado = await carregarStatusComandos(String(selectedItem?.numPlanej ?? ''), '4', observacaoExcluir);
      if (resultado && resultado.statusErro === true) {
        toast({
          title: 'Falha ao excluir produção',
          description: 'Não foi possível atualizar o status.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Produção excluída',
          description: `Exclusão solicitada para o Nº Planej. ${selectedItem?.numPlanej}`,
          variant: 'destructive',
        });
        setTimeout(() => carregarDadosListaProducao(), 500);
      }
    } catch (e) {
      toast({ title: 'Erro de conexão', description: 'Falha na comunicação com o servidor.', variant: 'destructive' });
    } finally {
      setShowConfirmDialogExcluir(false);
      setSelectedItem(null);
      setObservacaoExcluir('');
    }
  };

  const cancelarExcluirProducao = () => {
    setShowConfirmDialogExcluir(false);
    setSelectedItem(null);
    setObservacaoExcluir('');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Lotes de Produção</CardTitle>
            <CardDescription>
              Lista completa dos lotes de produção de sementes
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Itens por página:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="table-fixed w-full">
            <colgroup>
              <col className="w-[8%]" />
              <col className="w-[10%]" />
              <col className="w-[6%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[6%]" />
              <col className="w-[10%]" />
              <col className="w-[6%]" />
              <col className="w-[6%]" />
              <col className="w-[8%]" />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Planej.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Máquina</TableHead>
                <TableHead>Matéria Prima</TableHead>
                <TableHead>Produto Acabado</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Qtde Produzir</TableHead>
                <TableHead>Peneira</TableHead>
                <TableHead>Cultivar</TableHead>
                <TableHead>UMB</TableHead>
                <TableHead>PMS</TableHead>
                <TableHead>Prioridade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingData ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    Carregando dados...
                  </TableCell>
                </TableRow>
              ) : errorData ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8 text-red-600">
                    Erro ao carregar dados: {errorData}
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    Nenhum dado encontrado
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => {
                  const rowId = `${item.numPlanej || 'np'}-${item.lote || 'lt'}-${item.ordemPrd || index}`;
                  const isExpanded = expandedRowId === rowId;
                  return (
                    <>
                      <TableRow 
                        key={`row-${rowId}`}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleVerDetalhes(rowId)}
                      >
                        <TableCell className="font-medium">{item.numPlanej}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            {item.descStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.numMaquina || '-'}</TableCell>
                        <TableCell>{item.descMateriaPrima || '-'}</TableCell>
                        <TableCell>{item.descProdutoAcabado || '-'}</TableCell>
                        <TableCell>{item.lote || '-'}</TableCell>
                        <TableCell>{item.qtdeProduzir || '-'}</TableCell>
                        <TableCell>{item.peneira || '-'}</TableCell>
                        <TableCell>{item.descCultivar || '-'}</TableCell>
                        <TableCell>{item.umb || '-'}</TableCell>
                        <TableCell>{item.pms || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getPrioridadeColor(item.descPrioridade || '-')}>
                            {item.descPrioridade}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow key={`expand-${rowId}`} className="bg-gray-50">
                          <TableCell colSpan={12}>
                            <div className="py-4">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Identificação</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-500">Nº Planej.</div>
                                    <div className="text-gray-900 font-semibold">{item.numPlanej || '-'}</div>
                                    <div className="text-gray-500">Ano</div>
                                    <div className="text-gray-900">{item.mjahr || '-'}</div>
                                    <div className="text-gray-500">Centro</div>
                                    <div className="text-gray-900">{item.werksPrd || '-'}</div>
                                    <div className="text-gray-500">Ordem</div>
                                    <div className="text-gray-900">{item.ordemPrd || '-'}</div>
                                    <div className="text-gray-500">Tipo Planej.</div>
                                    <div className="text-gray-900">{item.tipoPlanej || '-'}</div>
                                    <div className="text-gray-500">Lote</div>
                                    <div className="text-gray-900 font-semibold">{item.lote || '-'}</div>
                                    <div className="text-gray-500">Lote Fornecedor</div>
                                    <div className="text-gray-900">{item.loteforn || '-'}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Matéria Prima</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-500">Matéria Prima</div>
                                    <div className="text-gray-900">{item.materiaPrima || '-'}</div>
                                    <div className="text-gray-500">Desc. Matéria Prima</div>
                                    <div className="text-gray-900">{item.descMateriaPrima || '-'}</div>
                                    <div className="text-gray-500">Qtde Consumir MP</div>
                                    <div className="text-gray-900">{item.QtdeConsumirMp || '-'}</div>
                                    <div className="text-gray-500">Peso Consumir MP</div>
                                    <div className="text-gray-900">{item.pesoConsumirMp || '-'}</div>
                                    <div className="text-gray-500">Peso Liq Unit MP</div>
                                    <div className="text-gray-900">{item.pesoLiqUnitMp || '-'}</div>
                                    <div className="text-gray-500">Máquina</div>
                                    <div className="text-gray-900">{item.numMaquina || '-'}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Produto Acabado</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-500">Produto Acabado</div>
                                    <div className="text-gray-900">{item.produtoacab || '-'}</div>
                                    <div className="text-gray-500">Desc. Produto Acabado</div>
                                    <div className="text-gray-900">{item.descProdutoAcabado || '-'}</div>
                                    <div className="text-gray-500">Qtde Produzir</div>
                                    <div className="text-gray-900">{item.qtdeProduzir || '-'}</div>
                                    <div className="text-gray-500">Peso Produzir</div>
                                    <div className="text-gray-900">{item.pesoProduzir || '-'}</div>
                                    <div className="text-gray-500">UMB</div>
                                    <div className="text-gray-900">{item.umb || '-'}</div>
                                    <div className="text-gray-500">Peso Liq Unit PA</div>
                                    <div className="text-gray-900">{item.pesoLiqUnitPa || '-'}</div>
                                    <div className="text-gray-500">Peso Brut Unit PA</div>
                                    <div className="text-gray-900">{item.pesoBrutUnitPa || '-'}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Produção Real</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-500">Qtde Real Prod</div>
                                    <div className="text-gray-900">{item.qtdeRealProd || '-'}</div>
                                    <div className="text-gray-500">Peso Real Liq Unit</div>
                                    <div className="text-gray-900">{item.pesoRealLiqUnit || '-'}</div>
                                    <div className="text-gray-500">Peso Real Brut Unit</div>
                                    <div className="text-gray-900">{item.pesoRealBrutUnit || '-'}</div>
                                    <div className="text-gray-500">Peso Real Liq Total</div>
                                    <div className="text-gray-900">{item.pesoRealLiqTotal || '-'}</div>
                                    <div className="text-gray-500">Peso Real Brut Total</div>
                                    <div className="text-gray-900">{item.pesoRealBrutTotal || '-'}</div>
                                    <div className="text-gray-500">Confirmação</div>
                                    <div className="text-gray-900">{item.confirmacao || '-'}</div>
                                    <div className="text-gray-500">Nº Conf</div>
                                    <div className="text-gray-900">{item.numConf || '-'}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Datas e Horários</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-500">Data Produção</div>
                                    <div className="text-gray-900">{formatarData(item.dataPrd)}</div>
                                    <div className="text-gray-500">Hora Produzir</div>
                                    <div className="text-gray-900">{formatarHora(item.horaProduzir)}</div>
                                    <div className="text-gray-500">Data Registro</div>
                                    <div className="text-gray-900">{formatarData(item.dataRegistro)}</div>
                                    <div className="text-gray-500">Hora Registro</div>
                                    <div className="text-gray-900">{formatarHora(item.horaRegistro)}</div>
                                    <div className="text-gray-500">Usuário</div>
                                    <div className="text-gray-900">{item.usuario || '-'}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Prioridade e Status</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-500">Prioridade</div>
                                    <div className="text-gray-900">
                                      <Badge className={getPrioridadeColor(item.descPrioridade)}>
                                        {item.descPrioridade || '-'}
                                      </Badge>
                                    </div>
                                    <div className="text-gray-500">Nº Prioridade</div>
                                    <div className="text-gray-900">{item.numPrioridade || '-'}</div>
                                    <div className="text-gray-500">Status</div>
                                    <div className="text-gray-900">
                                      <Badge className={getStatusColor(item.descStatus)}>
                                        {item.descStatus || '-'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Classificações</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-500">Cultivar</div>
                                    <div className="text-gray-900">{item.descCultivar || '-'}</div>
                                    <div className="text-gray-500">Tecnologia</div>
                                    <div className="text-gray-900">{item.descTecnologia || '-'}</div>
                                    <div className="text-gray-500">Ciclo</div>
                                    <div className="text-gray-900">{item.descCiclo || '-'}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Tipos e Categorias</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-500">Tipo</div>
                                    <div className="text-gray-900">{item.descCodTipo || '-'}</div>
                                    <div className="text-gray-500">Categoria</div>
                                    <div className="text-gray-900">{item.descCodCategoria || '-'}</div>
                                    <div className="text-gray-500">Tratamento</div>
                                    <div className="text-gray-900">{item.descCodTsi || '-'}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Embalagem e Pesos</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-500">Cód. Embalagem</div>
                                    <div className="text-gray-900">{item.codEmbalagem || '-'}</div>
                                    <div className="text-gray-500">Desc. Embalagem</div>
                                    <div className="text-gray-900">{item.descCodEmbalagem || '-'}</div>
                                    <div className="text-gray-500">PMS</div>
                                    <div className="text-gray-900">{item.pms || '-'}</div>
                                    <div className="text-gray-500">Margem</div>
                                    <div className="text-gray-900">{item.margem || '-'}</div>
                                    <div className="text-gray-500">Peso Bag</div>
                                    <div className="text-gray-900">{item.pesoBag || '-'}</div>
                                    <div className="text-gray-500">Peneira</div>
                                    <div className="text-gray-900">{item.peneira || '-'}</div>
                                    <div className="text-gray-500">Nº Sementes</div>
                                    <div className="text-gray-900">{item.numSementes || '-'}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Agrupadores</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-500">Agrupador</div>
                                    <div className="text-gray-900">{item.descCodAgrupador || '-'}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Germinação</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-500">Ger. Prévia</div>
                                    <div className="text-gray-900">{item.gerPrevia || '-'}</div>
                                    <div className="text-gray-500">Ger. Oficial</div>
                                    <div className="text-gray-900">{item.gerOficial || '-'}</div>
                                    <div className="text-gray-500">Observação</div>
                                    <div className="text-gray-900">{item.observacao || '-'}</div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Botões de Ação */}
                              <div className="mt-6 pt-4 border-t border-gray-200">
                                <div className="flex flex-wrap gap-3 justify-center">
                                  <Button 
                                    size="sm" 
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => handleIniciarSeparacao(item)}
                                  >
                                    <Package className="h-4 w-4 mr-2" />
                                    Iniciar Separação
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleIniciarProducao(item)}
                                  >
                                    <Play className="h-4 w-4 mr-2" />
                                    Iniciar Produção
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="border-gray-300 hover:bg-gray-50"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        const resultado = await carregarStatusComandos(String(item?.numPlanej ?? ''), '3');
                                        if (resultado && resultado.statusErro === true) {
                                          toast({ title: 'Falha ao editar', description: 'Não foi possível atualizar o status.', variant: 'destructive' });
                                        } else {
                                          toast({ title: 'Editar', description: `Status atualizado para edição (${item?.numPlanej}).` });
                                          setTimeout(() => carregarDadosListaProducao(), 500);
                                        }
                                      } catch (err) {
                                        toast({ title: 'Erro de conexão', description: 'Falha de comunicação com o SAP.', variant: 'destructive' });
                                      }
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                    onClick={() => handleExcluirProducao(item)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Controles de Paginação */}
        {filteredData.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de {filteredData.length} lotes
            </div>
            
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {getPageNumbers().map((page, idx) => (
                    <PaginationItem key={idx}>
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page as number);
                          }}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </CardContent>

      {/* Popup de confirmação para iniciar produção */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Início de Produção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja iniciar a produção <strong>{selectedItem?.numPlanej}</strong>?
              <br /><br />
              <strong>Detalhes da produção:</strong>
              <br />
              • Ordem: {selectedItem?.ordemPrd}
              <br />
              • Materia Prima: {selectedItem?.descMateriaPrima}
              <br />
              • Produto: {selectedItem?.descProdutoAcabado}
              <br />
              • Quantidade: {selectedItem?.qtdeProduzir} {selectedItem?.umb}
              <br />
              • Máquina: {selectedItem?.numMaquina}
              <br />
              • Prioridade: {selectedItem?.descPrioridade}
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

      {/* Popup de confirmação para iniciar separação */}
      <AlertDialog open={showConfirmDialogSeparacao} onOpenChange={setShowConfirmDialogSeparacao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Início de Separação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja iniciar a separação da ordem de produção <strong>{selectedItem?.numPlanej}</strong>?
              <br /><br />
              <strong>Detalhes da produção:</strong>
              <br />
              • Ordem: {selectedItem?.ordemPrd}
              <br />
              • Materia Prima: {selectedItem?.descMateriaPrima}
              <br />
              • Produto: {selectedItem?.descProdutoAcabado}
              <br />
              • Quantidade: {selectedItem?.qtdeProduzir} {selectedItem?.umb}
              <br />
              • Máquina: {selectedItem?.numMaquina}
              <br />
              • Prioridade: {selectedItem?.descPrioridade}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelarIniciarSeparacao}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmarIniciarSeparacao}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirmar Separação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Popup de confirmação para excluir Produção */}
      <AlertDialog open={showConfirmDialogExcluir} onOpenChange={setShowConfirmDialogExcluir}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão de Produção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a produção da ordem de produção <strong>{selectedItem?.numPlanej}</strong>?
              <br /><br />
              <strong>Detalhes da produção:</strong>
              <br />
              • Ordem: {selectedItem?.ordemPrd}
              <br />
              • Materia Prima: {selectedItem?.descMateriaPrima}
              <br />
              • Produto: {selectedItem?.descProdutoAcabado}
              <br />
              • Quantidade: {selectedItem?.qtdeProduzir} {selectedItem?.umb}
              <br />
              • Máquina: {selectedItem?.numMaquina}
              <br />
              • Prioridade: {selectedItem?.descPrioridade}
              <br /><br />
              <strong className="text-red-600">Esta ação não pode ser desfeita!</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 py-4">
            <label className="block text-sm font-medium mb-2">
              Motivo da exclusão <span className="text-red-600">*</span>
            </label>
            <Textarea
              placeholder="Descreva o motivo da exclusão da produção..."
              value={observacaoExcluir}
              onChange={(e) => setObservacaoExcluir(e.target.value)}
              maxLength={255}
              className="min-h-[100px]"
              required
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                O preenchimento deste campo é obrigatório para confirmar a exclusão.
              </p>
              <span className="text-xs text-gray-400">{observacaoExcluir.length}/255</span>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelarExcluirProducao}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmarExcluirProducao}
              className="bg-red-600 hover:bg-red-700"
              disabled={!observacaoExcluir.trim()}
            >
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default LotesProducao;

