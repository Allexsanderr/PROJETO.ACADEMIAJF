# Academia Prime

Um sistema completo de gerenciamento de academia com frontend responsivo e backend Python. A plataforma oferece funcionalidades de registro, login, edição de fichas de treino, agendamento de avaliações médicas e galeria de fotos da academia.

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
└── .github/copilot-instructions.md # Documentação para AI agents
```

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript Vanilla (sem frameworks)
- **Backend**: Python 3.6+ (ThreadingHTTPServer)
- **Persistência**: JSON (localStorage no cliente, arquivos no servidor)
- **Segurança**: SHA-256 password hashing + stateless tokens
- **Design**: Poppins font, cores: #0b0b0b (dark), #ffcc00 (yellow accent)

## 🚀 Como Rodar

### Backend (Python)
```bash
cd "c:\Users\allex\Desktop\PROJETO ACADEMIA\ACADEMIA"
python server.py
# Servidor iniciado em http://localhost:8081
```

### Frontend
```bash
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
- CORS: Habilitado para `*` com headers apropriados
- Autenticação: Baseada em header `X-Auth-Token`

## 📋 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/ping` | Verifica conectividade |
| POST | `/api/register` | Registro de novo usuário |
| POST | `/api/login` | Login e geração de token |
| GET | `/api/plan` | Obtém ficha de treino (requer token) |
| PUT | `/api/plan` | Salva ficha de treino (requer token) |

## 💾 Dados Persistidos

### localStorage (Cliente)
- `gymUser`: Dados do usuário logado
- `gymToken`: Token de autenticação
- `plan:{email}`: Ficha de treino do usuário
- `medical-appointments`: Avaliações agendadas

### Arquivos JSON (Servidor)
- `users.json`: `{email: {name, salt, hash}}`
- `plans.json`: `{email: {dia: [...exercícios]}}`
- `sessions.json`: `{token: email}`

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

## 📝 Fluxos Principais

### Registro/Login
1. Usuário preenche formulário
2. Dados validados (client-side e server-side)
3. Senha hasheada com salt
4. Token gerado e armazenado
5. Redirecionado para "Área do Aluno"

### Edição de Ficha
1. Usuário seleciona dia da semana
2. Adiciona/edita/remove exercícios
3. Cada exercício salvo individualmente (botão 💾)
4. Resumo do dia exibido em card destacado
5. Dados persistem em localStorage e API

### Agendamento de Avaliação
1. Usuário acessa `avaliacao.html`
2. Seleciona data (bloqueia passado), hora, médico
3. Adiciona notas opcionais
4. Salva em localStorage
5. Banner na home atualizado automaticamente

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
