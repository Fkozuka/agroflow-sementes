import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import FiltrosEBusca from '@/components/FiltrosEBusca';
import LotesProducao from '@/components/LotesProducao';
import { useListaProducao } from '@/hooks/useListaProducao';
import { useComandos } from '@/hooks/useComandos';
import { useCarregaListaProducao } from '@/hooks/useCarregaListaProducao';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

const Producao = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [dataInicial, setDataInicial] = useState<string>('');
  const [dataFinal, setDataFinal] = useState<string>('');
  const [expandedRowId, setExpandedRowId] = useState<string | number | null>(null);
  const { toast } = useToast();
  
  // Buscar dados reais da API
  const { dadosListaProducao, loading: loadingData, error: errorData, carregarDadosListaProducao } = useListaProducao(dataInicial, dataFinal);
  
  // Hook para atualizar lista de produção
  const { loading: loadingUpdate, carregarStatusCarregaListaProducao } = useCarregaListaProducao();

  // Hook para enviar comandos (atualizar status via GET)
  const { carregarStatusComandos } = useComandos();

  // Função para atualizar a lista de produção
  const handleAtualizarLotes = async () => {
    try {
      // Chama a função para carregar a lista do SAP
      const resultado = await carregarStatusCarregaListaProducao();
      
      // Verifica se houve erro na atualização
      if (resultado && resultado.statusErro === true) {
        toast({
          title: "Erro ao atualizar lotes",
          description: "Não foi possível carregar a lista de produção do SAP.",
          variant: "destructive",
        });
        return;
      }
      
      // Se não houve erro, atualiza os dados
      toast({
        title: "Lotes atualizados",
        description: "Lista de produção atualizada com sucesso!",
      });
      
      // Pequeno delay para garantir que o estado foi atualizado
      setTimeout(async () => {
        // Recarrega os dados da lista sem recarregar a página
        await carregarDadosListaProducao();
      }, 1000);
    } catch (error) {
      console.error('Erro ao atualizar lotes:', error);
      toast({
        title: "Erro ao atualizar lotes",
        description: "Erro ao conectar com o servidor.",
        variant: "destructive",
      });
    }
  };


  const filteredData = dadosListaProducao.filter(item => {
    const matchesSearch = item.produtoacab?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.materiaPrima?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.lote?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.ordemPrd?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.descMateriaPrima?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || item.descStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });


  const handleVerDetalhes = (rowId: string) => {
    // Toggle expansão inline com chave estável
    setExpandedRowId((prev) => (prev === rowId ? null : rowId));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-industrial-primary">Gestão de Produção</h2>
               <Button 
                 className="bg-industrial-primary hover:bg-industrial-primary/90"
                 onClick={handleAtualizarLotes}
                 disabled={loadingUpdate}
               >
                 <RefreshCw className={`mr-2 h-4 w-4 ${loadingUpdate ? 'animate-spin' : ''}`} />
                 {loadingUpdate ? 'Atualizando...' : 'Atualizar Lotes'}
               </Button>
            </div>
            
            {/* Filtros e busca */}
            <FiltrosEBusca
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              dataInicial={dataInicial}
              setDataInicial={setDataInicial}
              dataFinal={dataFinal}
              setDataFinal={setDataFinal}
              totalFiltrado={filteredData.length}
              totalGeral={dadosListaProducao.length}
            />

            {/* Tabela de produção */}
            <LotesProducao
              filteredData={filteredData}
              loadingData={loadingData}
              errorData={errorData}
              expandedRowId={expandedRowId}
              setExpandedRowId={setExpandedRowId}
              handleVerDetalhes={handleVerDetalhes}
              carregarStatusComandos={carregarStatusComandos}
              carregarDadosListaProducao={carregarDadosListaProducao}
            />
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
};

export default Producao;

