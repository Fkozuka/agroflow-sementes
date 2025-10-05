import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useEquipamentoDetalhes } from '@/hooks/useEquipamentos';

interface EquipmentDetailsProps {
  equipment: {
    id: number;
    codigo: string;
    tipo: string;
    status: string;
    corrente_amperes: number;
  };
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ equipment }) => {
  const { detalhes, loading, error } = useEquipamentoDetalhes(equipment.id);

  // Dados padrão caso não haja detalhes ou esteja carregando
  const detalhesAtuais = detalhes?.[0] || {
    emergencia: true,
    bloqueio: true,
    intertravado: true,
    chave_auto: true,
    falha_partida: false,
    falha_temp_mancal: false,
    falha_temp_mancal_superior: false,
    falha_temp_mancal_inferior: false,
    falha_embuchamento: false,
    falha_rotacao: false,
    confirma_partida: true
  };

  const getStatusIcon = (value: boolean) => {
    return value ? (
      <CheckCircle className="h-5 w-5 text-industrial-success" />
    ) : (
      <XCircle className="h-5 w-5 text-industrial-error" />
    );
  };

  const getStatusText = (value: boolean) => {
    return value ? 'Normal' : 'Falha';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-6 w-6 animate-spin text-industrial-primary" />
              <span className="ml-2">Carregando detalhes...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center h-20 text-industrial-error">
              <AlertCircle className="h-6 w-6 mr-2" />
              <span>Erro ao carregar detalhes: {error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-industrial-gray">Código</p>
              <p className="font-medium">{equipment.codigo}</p>
            </div>
            <div>
              <p className="text-sm text-industrial-gray">Tipo</p>
              <p className="font-medium">
                {equipment.tipo === 'elevator' ? 'Elevador' :
                 equipment.tipo === 'chain' ? 'Transportador por Corrente' :
                 'Transportador por Rosca'}
              </p>
            </div>
            <div>
              <p className="text-sm text-industrial-gray">Status</p>
              <p className="font-medium">
                {equipment.status === 'running' ? 'Em Operação' :
                 equipment.status === 'warning' ? 'Atenção' :
                 equipment.status === 'error' ? 'Falha' : 'Inativo'}
              </p>
            </div>
            <div>
              <p className="text-sm text-industrial-gray">Corrente Elétrica</p>
              <p className="font-medium">{equipment.corrente_amperes.toFixed(1)} A</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">Status dos Sensores</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(detalhesAtuais.emergencia)}
              <span>Emergência</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(!detalhesAtuais.bloqueio)}
              <span>Bloqueio</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(!detalhesAtuais.intertravado)}
              <span>Intertravado</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(detalhesAtuais.chave_auto)}
              <span>Chave Auto</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(!detalhesAtuais.falha_partida)}
              <span>Falha Partida</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(!detalhesAtuais.falha_temp_mancal)}
              <span>Falha Temp. Mancal</span>
            </div>
            {equipment.tipo === 'elevator' && (
              <>
                <div className="flex items-center gap-2">
                  {getStatusIcon(!detalhesAtuais.falha_temp_mancal_superior)}
                  <span>Falha Temp. Mancal Superior</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(!detalhesAtuais.falha_temp_mancal_inferior)}
                  <span>Falha Temp. Mancal Inferior</span>
                </div>
              </>
            )}
            {(equipment.tipo === 'chain' || equipment.tipo === 'screw') && (
              <div className="flex items-center gap-2">
                {getStatusIcon(!detalhesAtuais.falha_embuchamento)}
                <span>Falha Embuchamento</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              {getStatusIcon(!detalhesAtuais.falha_rotacao)}
              <span>Falha Rotação</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(detalhesAtuais.confirma_partida)}
              <span>Confirma Partida</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentDetails;
