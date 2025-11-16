# Academia Prime

Um sistema completo de gerenciamento de academia com frontend responsivo e moderno. A plataforma oferece funcionalidades de registro, login, edição de fichas de treino, agendamento de avaliações médicas e galeria de fotos da academia.

## 📸 Screenshots

### Home - Desktop
![Home Desktop](https://via.placeholder.com/800x400?text=Home+Desktop)

### Área do Aluno
![Área do Aluno](https://via.placeholder.com/800x400?text=Área+do+Aluno)

### Conhecer a Academia - Galeria
![Galeria](https://via.placeholder.com/800x400?text=Galeria+Fotos)

### Mobile Responsivo
![Mobile](https://via.placeholder.com/400x600?text=Mobile+Responsivo)

## 🚀 Características

- ✅ **Autenticação**: Registro e login com senhas hashadas (SHA-256 + salt)
- ✅ **Fichas de Treino**: Editor dinâmico de exercícios por dia da semana
- ✅ **Avaliações Médicas**: Agendamento e gerenciamento de consultas
- ✅ **Lembretes**: Notificações de próximas avaliações na navbar
- ✅ **Galeria**: Página com cards responsivos da academia
- ✅ **Responsivo**: Layout adaptado para desktop, tablet e smartphone
- ✅ **Modo Offline**: Dados salvos em localStorage com sincronização automática
- ✅ **Dark Mode**: Design moderno com tema escuro e destaque amarelo

## 📁 Estrutura do Projeto

```
ACADEMIA/
├── index.html                 # Página principal (home)
├── avaliacao.html            # Página de agendamento de avaliações médicas
├── conhecer.html             # Página com galeria da academia
├── script.js                 # Lógica JavaScript (frontend)
├── styles.css                # Estilos CSS responsivos
├── server.py                 # Backend HTTP (Python)
├── users.json                # Banco de dados de usuários
├── plans.json                # Fichas de treino persistidas
├── sessions.json             # Sessões ativas
├── .gitignore               # Configuração Git
└── README.md                # Este arquivo
```

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript Vanilla (sem frameworks)
- **Persistência**: JSON (localStorage no cliente, arquivos no servidor)
- **Segurança**: SHA-256 password hashing + stateless tokens
- **Design**: Poppins font, cores: #0b0b0b (dark), #ffcc00 (yellow accent)

## 🚀 Como Usar

### 1️⃣ Acesso Online
Abra seu navegador e acesse o arquivo `index.html` diretamente ou hospede em um servidor web.

### 2️⃣ Desenvolvimento Local
```bash
# Clone o repositório
git clone https://github.com/Allexsanderr/PROJETO.ACADEMIAJF.git
cd PROJETO.ACADEMIAJF

# Abra index.html em seu navegador
# Ou use um servidor HTTP simples

# Para teste com backend (opcional)
cd "c:\Users\allex\Desktop\PROJETO ACADEMIA\ACADEMIA"
python -m http.server 8000
# Acesse em http://localhost:8000
```

## 📱 Responsividade

O site é totalmente responsivo com breakpoints:
- **Desktop**: Layout completo (>992px)
- **Tablet**: Grid de 2 colunas → 1 coluna (768px-992px)
- **Mobile**: Layout vertical otimizado (<768px)
  - Menu hambúrguer
  - Botões com tap targets ampliados
  - Fontes redimensionadas

## 🔐 Segurança

- Senhas: SHA-256 com salt aleatório (16 bytes hex)
- Tokens: Gerados com `secrets.token_hex(24)` (48 caracteres)
- Autenticação: Baseada em header `X-Auth-Token`
- CORS: Habilitado para segurança entre domínios

## 💾 Dados Persistidos

### localStorage (Cliente)
- `gymUser`: Dados do usuário logado
- `gymToken`: Token de autenticação
- `plan:{email}`: Ficha de treino do usuário
- `medical-appointments`: Avaliações agendadas (data, hora, médico, notas)

## 🎨 Customização

### Cores
Editáveis em `styles.css` (`:root`):
```css
--primary: #ffcc00      /* Amarelo accent */
--bg: #0b0b0b          /* Fundo escuro */
--text: #f7f7f7        /* Texto claro */
```

### Fontes
Google Fonts: Poppins (300, 400, 600, 800)

## 🔧 Funcionalidades Avançadas

### Modo Offline
- Dados salvos localmente antes de enviar à API
- Sincronização automática quando online
- Fallback para localStorage em caso de erro

### Lembretes de Avaliação
- Banner no topo mostra próxima avaliação
- Formatado em português (pt-BR)
- Fecha automaticamente ou persiste

### Galeria Responsiva
- Cards com overlay ao hover
- Emojis como placeholders para fotos
- Sem dependências externas

## 📝 Funcionalidades Principais

### 🔐 Autenticação
- Registro de novo usuário
- Login seguro com validação
- Modo offline com localStorage
- Recuperação de senha

### 📋 Ficha de Treino
- Criar/editar/deletar exercícios
- Organização por dia da semana
- Salvar treino por exercício individual
- Resumo diário com contagem e emojis
- Sincronização automática

### 🏥 Avaliações Médicas
- Agendamento com data e hora
- Seleção de médico
- Notas adicionais
- Histórico de avaliações
- Lembretes automáticos na home

### 🏋️ Galeria
- Fotos/cards da academia
- Responsive em desktop, tablet e mobile
- Overlay com descrição ao hover
- Design moderno com emojis

### 📱 Responsividade
- Menu hamburguês em mobile
- Layout adaptado (<768px)
- Botões com tap targets aumentados
- Tela inteira otimizada para cada tamanho

## 🧪 Testes Recomendados

- [ ] Registro e login (online e offline)
- [ ] Edição de ficha por dia
- [ ] Agendamento de avaliação
- [ ] Lembretes aparecem na home
- [ ] Responsividade em múltiplos viewports
- [ ] Token inválido → fallback para localStorage
- [ ] Clear plan → todas as fichas limpas

## 🤝 Contribuição

Siga as instruções em `.github/copilot-instructions.md` para modificações no código.

## 📄 Licença

Projeto Academia Prime - Todos os direitos reservados © 2025

## 📞 Contato

Academia Prime - Juiz de Fora, MG
