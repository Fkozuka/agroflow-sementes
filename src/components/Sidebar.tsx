
import React from 'react';
import { Gauge, Database, Package, BarChart, Settings, List, Factory } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useStatusCLP } from '@/hooks/useStatusCLP';

const sidebarItems = [
  { name: 'Dashboard', icon: Gauge, path: '/' },
  { name: 'Produção', icon: Factory, path: '/producao' },
  { name: 'Estoque de Sementes', icon: Package, path: '/estoque' },
  { name: 'Armazenamento', icon: Database, path: '/armazenamento' },
  { name: 'Relatórios', icon: BarChart, path: '/relatorios' },
  { name: 'Configurações', icon: Settings, path: '/configuracoes' },
];

const Sidebar = () => {
  const { statusCLP, loading, error } = useStatusCLP();
  
  const handleNavigation = (path: string, e: React.MouseEvent) => {
    if (path === '#') {
      e.preventDefault();
    }
  };

  // Determina o status baseado nos dados do CLP
  const getSystemStatus = () => {
    if (loading) {
      return {
        color: 'bg-yellow-500',
        text: 'Carregando...',
        status: 'loading'
      };
    }
    
    if (error) {
      return {
        color: 'bg-red-500',
        text: 'Desconectado',
        status: 'error'
      };
    }
    
    if (statusCLP.length > 0 && statusCLP[0].status === true) {
      return {
        color: 'bg-industrial-success',
        text: 'Conectado',
        status: 'online'
      };
    }
    
    return {
      color: 'bg-red-500',
      text: 'Desconectado',
      status: 'offline'
    };
  };

  const systemStatus = getSystemStatus();

  return (
    <div className="bg-industrial-primary text-white w-64 flex-shrink-0 hidden md:block">
      <div className="p-4 h-full flex flex-col">
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className="w-full justify-start text-white hover:bg-industrial-primary/80 hover:text-white"
              asChild
            >
              {item.path !== '#' ? (
                <Link to={item.path} onClick={(e) => handleNavigation(item.path, e)}>
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.name}
                </Link>
              ) : (
                <a href={item.path} onClick={(e) => handleNavigation(item.path, e)}>
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.name}
                </a>
              )}
            </Button>
          ))}
        </div>
        
        <div className="mt-auto p-4 bg-industrial-dark/30 rounded-lg">
          <div className="text-sm text-gray-300">Status do Sistema</div>
          <div className="flex items-center mt-2">
            <div className={`w-3 h-3 ${systemStatus.color} rounded-full mr-2`}></div>
            <span className="text-sm font-medium">{systemStatus.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
