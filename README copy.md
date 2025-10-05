# 🌱 AgroFlow Sementes

Sistema de gestão de produção de sementes desenvolvido com tecnologias modernas para controle e monitoramento de processos agrícolas.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca para interface de usuário
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Build tool e servidor de desenvolvimento
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Biblioteca de componentes
- **React Router** - Roteamento para aplicações React
- **React Query** - Gerenciamento de estado e cache
- **Lucide React** - Ícones modernos

## 📋 Funcionalidades

- ✅ **Dashboard Principal** - Visão geral dos indicadores de produção
- ✅ **Sistema de Autenticação** - Login seguro com proteção de rotas
- ✅ **Lista de Produção** - Gestão completa de ordens de produção
- ✅ **Interface Responsiva** - Funciona em desktop e mobile
- ✅ **Tema Industrial** - Design otimizado para ambiente industrial
- ✅ **Componentes Reutilizáveis** - Biblioteca de componentes UI

## 🛠️ Instalação

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos para instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/agroflow-sementes.git
cd agroflow-sementes
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Execute o projeto em modo de desenvolvimento:**
```bash
npm run dev
```

4. **Acesse no navegador:**
```
http://localhost:8080
```

## 🔐 Login

Para acessar o sistema, use as credenciais:

- **Usuário:** `admin`
- **Senha:** `admin123`

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Cria build de produção
npm run build:dev    # Cria build de desenvolvimento

# Qualidade de código
npm run lint         # Executa ESLint

# Preview
npm run preview      # Visualiza build de produção
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes de interface (shadcn/ui)
│   ├── Header.tsx      # Cabeçalho da aplicação
│   ├── Sidebar.tsx     # Barra lateral de navegação
│   └── ...
├── hooks/              # Hooks customizados
│   ├── use-auth.tsx    # Hook de autenticação
│   └── use-mobile.tsx  # Hook para detecção mobile
├── pages/              # Páginas da aplicação
│   ├── Index.tsx       # Dashboard principal
│   ├── Login.tsx       # Página de login
│   ├── ListaProducao.tsx # Gestão de produção
│   └── NotFound.tsx    # Página 404
├── lib/                # Utilitários
└── App.tsx             # Componente principal
```

## 🎨 Tema e Design

O projeto utiliza um tema industrial personalizado com:

- **Cores principais:** Azul industrial (#1A3A5A)
- **Background:** Cinza claro (#F2F4F8)
- **Acentos:** Amarelo de alerta (#FFC857)
- **Status:** Verde sucesso, vermelho erro

## 📱 Responsividade

- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (até 767px)

## 🔧 Configuração de Desenvolvimento

### TypeScript
- Configuração estrita desabilitada para facilitar desenvolvimento
- Path mapping configurado (`@/` aponta para `src/`)

### ESLint
- Configuração para React e TypeScript
- Regras personalizadas para o projeto

### Tailwind CSS
- Configuração customizada com tema industrial
- Variáveis CSS para cores e espaçamentos

## 🚀 Deploy

### Build de Produção
```bash
npm run build
```

Os arquivos de produção serão gerados na pasta `dist/`.

### Deploy no GitHub Pages
1. Execute `npm run build`
2. Configure GitHub Pages para usar a pasta `dist/`
3. Acesse: `https://seu-usuario.github.io/agroflow-sementes`

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Padrões de Desenvolvimento

Consulte o arquivo `ESTRUTURA.txt` para padrões de:
- Nomenclatura de hooks
- Estrutura de componentes
- Tratamento de APIs
- Gerenciamento de estado

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Equipe

Desenvolvido para gestão de produção de sementes com foco em usabilidade e performance.

---

**AgroFlow Sementes** - Modernizando a gestão agrícola 🚜
