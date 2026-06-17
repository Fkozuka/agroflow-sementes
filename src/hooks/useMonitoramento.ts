import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

interface dadosOnlineTransportadores {
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

// ============================================================================
// HOOK PRINCIPAL - MONITORAMENTO DE EQUIPAMENTOS
// ============================================================================

export const useMonitoramentoEquipamentos = (tipoSelecionado: 'transportador' | 'gaveta' | 'bifurcada') => {
  // Estados
  const [dadosMonitoramento, setDadosMonitoramento] = useState<dadosOnlineTransportadores[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Função para carregar dados de monitoramento
  const carregarDadosMonitoramento = useCallback(async () => {
    // Só mostra loading no carregamento inicial
    if (isInitialLoad) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await axios.get(`http://10.99.2.17:1881/monitoramente`, {
        params: {
          tipo: tipoSelecionado,
        },
      });
      if (!Array.isArray(response.data)) {
        setError('Formato de dados inválido');
        return;
      }

    } catch {
      setError('Erro ao carregar dados de monitoramento');
      setDadosMonitoramento([]);
    } finally {
      // Só desabilita loading no carregamento inicial
      if (isInitialLoad) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, [tipoSelecionado, isInitialLoad]);

  // Effect para carregar dados
  useEffect(() => {
    carregarDadosMonitoramento();
    const interval = setInterval(() => carregarDadosMonitoramento(), 5000);
    return () => clearInterval(interval);
  }, [carregarDadosMonitoramento]);

  // A API já recebe o tipo da aba selecionada, então evitamos filtros redundantes.
  const transportadores = useMemo(
    () => (tipoSelecionado === 'transportador' ? dadosMonitoramento : []),
    [dadosMonitoramento, tipoSelecionado]
  );
  const gavetas = useMemo(
    () => (tipoSelecionado === 'gaveta' ? dadosMonitoramento : []),
    [dadosMonitoramento, tipoSelecionado]
  );
  const bifurcadas = useMemo(
    () => (tipoSelecionado === 'bifurcada' ? dadosMonitoramento : []),
    [dadosMonitoramento, tipoSelecionado]
  );

  return { transportadores, gavetas, bifurcadas, dadosMonitoramento, loading, error, carregarDadosMonitoramento };
};


