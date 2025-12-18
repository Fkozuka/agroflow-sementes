import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// GET PARA RECEBER OS DADOS DE LISTA DE PRODUÇÃO
interface dadosListaProducao {
  numPlanej: string;
  mjahr: string;
  werksPrd: string;
  ordemPrd: string;
  tipoPlanej: string;
  materiaPrima: string;
  QtdeConsumirMp: string;
  pesoConsumirMp: string;
  pesoLiqUnitMp: string;
  produtoacab: string;
  qtdeProduzir: string;
  pesoProduzir: string;
  umb: string;
  pesoLiqUnitPa: string;
  pesoBrutUnitPa: string;
  lote: string;
  loteforn: string;
  dataPrd: string;
  horaProduzir: string;
  qtdeRealProd: string;
  pesoRealLiqUnit: string;
  pesoRealBrutUnit: string;
  pesoRealLiqTotal: string;
  pesoRealBrutTotal: string;
  confirmacao: string;
  numConf: string;
  numMaquina: string;
  prioridade: string;
  numPrioridade: string;
  codEmbalagem: string;
  pms: string;
  margem: string;
  codCultivar: string;
  codTecnologia: string;
  codAgrupador: string;
  codCiclo: string;
  codTsi: string;
  codTipo: string;
  codCategoria: string;
  peneira: string;
  numSementes: string;
  pesoBag: string;
  gerPrevia: string;
  gerOficial: string;
  observacao: string;
  dataRegistro: string;
  horaRegistro: string;
  usuario: string;
  status: string;
  descMateriaPrima: string;
  descProdutoAcabado: string;
  descPrioridade: string;
  descCodEmbalagem: string;
  descCultivar: string;
  descTecnologia: string;
  descCodAgrupador: string;
  descCiclo: string;
  descCodTsi: string;
  descCodTipo: string;
  descCodCategoria: string;
  descStatus: string;
}

// ============================================================================
// HOOK PRINCIPAL - LISTA DE PRODUÇÃO
// ============================================================================


export const useListaProducao = (dateInicial?: string, dateFinal?: string) => {
  // Estados
  const [dadosListaProducao, setDadosListaProducao] = useState<dadosListaProducao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);


  //Função para carregar dados da lista de produção
  const carregarDadosListaProducao = useCallback(async () => {
    // Só mostra loading no carregamento inicial
    if (isInitialLoad) {
      setLoading(true);
    }
    setError(null);
    
    try {
      // Buscar dados das válvulas
      const response = await axios.get(`http://10.99.2.17:1881/producao/lista`, {
        params: {
          dateInicial,
          dateFinal
        }
      });
      
      if (Array.isArray(response.data)) {
        setDadosListaProducao(response.data);
      } else {
        setError('Formato de dados inválido');
      }
    } catch (err) {
      setError('Erro ao carregar dados das lista de produção');
    } finally {
      // Só desabilita loading no carregamento inicial
      if (isInitialLoad) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, [dateInicial, dateFinal, isInitialLoad]);

  //Effect para carregar dados
  useEffect(() => {
    carregarDadosListaProducao();
  }, [carregarDadosListaProducao]);

  return {
    dadosListaProducao,
    loading,
    error,
    carregarDadosListaProducao
  };
};