# Instruções para AI Coding Agents - Academia Prime

## Visão Geral da Arquitetura

**Academia Prime** é um sistema de gerenciamento de academia com:
- **Frontend**: SPA vanilla JavaScript (sem frameworks) - `index.html`, `script.js`, `styles.css`
- **Backend**: Python HTTP Server (ThreadingHTTPServer) - `server.py`
- Autenticação stateless com tokens SHA-256 salted
- Persistência JSON em arquivos: `users.json`, `plans.json`, `sessions.json`
- Suporte offline (dados salvos em localStorage quando servidor indisponível)

## Fluxo Arquitetural Principal

1. **Frontend** inicia na página hero e permite registro/login
2. **UI State** centralizando em objeto `state = {user, plan, token, online}`
3. **Sync Pattern**: Dados salvos simultaneamente em localStorage (fallback) e servidor (quando online)
4. **Área do Aluno**: Editor de treino por dia da semana (tabela dinâmica)
5. **API REST**: Endpoints `/api/{ping, register, login, plan}` com CORS e autenticação por header `X-Auth-Token`

## Padrões e Convenções Específicos

### Frontend (script.js)
- **Seletores**: `qs()` = querySelector, `qsa()` = querySelectorAll (aliases no topo)
- **Estado**: Variável global `state` é a single source of truth (user, plan, token, online)
- **DOM Cache**: Objeto `els` pré-cacheia todos os elementos usados (evita requerys)
- **Padrão de Persistência**: 
  - `loadUser()` / `saveUser()` = localStorage para credenciais
  - `loadToken()` / `saveToken()` = localStorage para token
  - `loadPlan()` / `savePlan()` = localStorage com fallback de API
- **Renderização**: Função `renderDay()` reconstrói a tabela do dia selecionado
- **Workflow do Treino**:
  1. `selectDay` muda → `renderDay()` lê `state.plan[day]`
  2. Usuário edita inputs → `addRow()` cria/atualiza linhas dinâmicas
  3. `btnSave` clica → `collectRows()` → `savePlan()` (localStorage + API se online)
  4. `btnExport` clica → `exportJSON()` com Blob

### Backend (server.py)
- **Arquivos de persistência**:
  - `users.json`: `{email: {name, salt, hash}}`
  - `plans.json`: `{email: {Segunda: [], Terça: [], ...}}`
  - `sessions.json`: `{token: email}`
- **Segurança**: 
  - Senhas hasheadas com SHA-256 + salt aleatório (16 bytes hex)
  - Token de sessão gerado com `secrets.token_hex(24)` (48 caracteres)
  - Validação de autenticação por header `X-Auth-Token`
- **Endpoints**:
  - `GET /api/ping` → `{ok: true}` (detecta conectividade)
  - `POST /api/register` → `{token, user}` ou erro 400/409
  - `POST /api/login` → `{token, user}` ou erro 401
  - `GET /api/plan` → `{plan}` requer token válido (401 se inválido)
  - `PUT /api/plan` → salva plano requer token (401 se inválido)
- **CORS**: Liberado para `*` com headers `Content-Type, X-Auth-Token`

### Estilos (styles.css)
- **Design Token**: Cores em CSS variables (`:root`)
  - `--primary: #ffcc00` (amarelo accent)
  - `--bg: #0b0b0b` (dark mode)
- **Componentes reutilizáveis**: `.btn`, `.btn-primary`, `.btn-ghost`, `.card`, `.plan`, `.table`
- **Animações**: Scroll reveal com IntersectionObserver + classe `.in`
- **Responsividade**: Breakpoints em 992px e 640px com mobile nav sidebar
- **Acessibilidade**: Uso de `aria-hidden`, `aria-expanded`, `aria-label`

## Fluxos Críticos para Modificações

### Adicionar novo campo ao treino
1. Editar estrutura em `defaultPlan()` (frontend)
2. Adicionar coluna `<td>` em `addRow()` e `collectRows()`
3. Atualizar estrutura do plano no backend se necessário

### Adicionar autenticação extra (ex: 2FA)
1. Expandir `users.json` com novo campo
2. Adicionar validação em `/api/login`
3. Implementar UI modal de verificação no frontend

### Modo offline mais robusto
- Frontend já salva em localStorage antes de enviar (padrão copy-on-persist)
- Backend retorna 401 se token inválido; frontend fallback para localStorage
- `ping()` detecta status online - usar `state.online` para UX condicionado

## Inicialização do Projeto

```bash
# Backend (Python 3.6+, não requer dependências externas)
python server.py  # Inicia em http://localhost:8081

# Frontend
# Servir com qualquer HTTP server (ex: Python 3.6+)
python -m http.server 8000  # Acessa em http://localhost:8000
```

## Checklist para PR/Features

- [ ] Manter `state` em sync: localStorage AND servidor quando online
- [ ] CORS headers em toda resposta HTTP (incluir no handler)
- [ ] Tokens SHA-256 com salt, não plaintext
- [ ] Testes de modo offline (desabilitar servidor)
- [ ] UI feedback: disable buttons durante fetch (`apiXxx()`)
- [ ] Validação lado-cliente E servidor
- [ ] Manter estilos dark/gold para coerência visual

## Estrutura de Dados Crítica

```javascript
// Frontend state
{user: {name, email, password}, plan: {DiaString: [{ex, series, reps, weight, rest, obs}, ...]}, token, online}

// Backend user
{email: {name: string, salt: hex16, hash: hex256}}

// Backend session
{token: hex48 → email}

// Backend plan
{email: {Segunda: [...], Terça: [...], ...}}
```

## Fluxo de Autenticação Step-by-Step

### Registro (register)
1. `formRegister.submit` → valida name/email/password (mín 6 caracteres)
2. Se online: `apiRegister(name, email, password)` → POST `/api/register`
3. Backend: gera salt, hash com SHA-256, salva em `users.json`, gera token
4. Backend retorna: `{token, user: {name, email}}`
5. Frontend: `state.token = token`, `saveToken()`, `setUser()`, fecha modal
6. Se offline: apenas salva em localStorage, sem token

### Login (login)
1. `formLogin.submit` → valida email/password
2. Se online: `apiLogin(email, password)` → POST `/api/login`
3. Backend: busca em `users.json`, valida hash, gera novo token
4. Backend retorna: `{token, user: {name, email}}`
5. Frontend: mesmo fluxo que registro
6. Se offline: valida contra localStorage (`loadUser()` + password)
7. Em offline, token permanece vazio mas UX funciona com localStorage

### Logout
1. `btnLogout.click` → `setUser(null)` → limpa `state.user` e token
2. localStorage não é limpo (permite login offline depois)
3. UI retorna para `alunoLocked` hidden

### Token Validation
- Token enviado em header `X-Auth-Token` em todas as requisições `/api/plan`
- Backend valida token contra `sessions.json`
- Se inválido: resposta 401, frontend fallback para localStorage
- Token não expira (sessão persiste enquanto `sessions.json` existir)

## Padrão de Error Handling

### Frontend (script.js)
```javascript
// Funções API retornam null se erro
async function api(path, method, body) {
  try {
    const r = await fetch(...)
    if (!r.ok) return null  // Qualquer status não 2xx vira null
    return await r.json()
  } catch {
    return null  // Network error vira null
  }
}

// Caller valida resultado
const r = await apiLogin(email, password)
if (r) {  // Sucesso
  state.token = r.token
  setUser(r.user)
} else {  // Erro OU offline
  // Fallback para localStorage
  const u = loadUser()
  if (u && u.email === email && u.password === password) {
    setUser(u)
  }
  // Caso contrário: falha silenciosa, usuário permanece não autenticado
}
```

**Padrão**: Não há UI de erro explícita - fallback automático para offline mode

### Backend (server.py)
- `400`: Validação client-side falhou (campos obrigatórios vazios, password < 6 chars)
- `401`: Autenticação falhou (token inválido, email/password incorretos)
- `409`: Conflito (email já registrado)
- `404`: Endpoint não existe
- Sem corpo de erro - apenas status code

**Convenção**: Sempre chamar `_cors()` ANTES de `end_headers()` para erros também

### Comportamento Offline
- Frontend detecta offline via `ping()` no `init()` → `state.online = false/true`
- Se offline: API calls retornam null, fallback automático para localStorage
- Dados SEMPRE salvos em localStorage ANTES de tentar API
- **Nunca** perder dados do usuário por falha de conectividade

## Como Testar Modo Offline

### Teste 1: Desabilitar Backend
```bash
# Iniciar frontend SEM backend rodando
# No browser: Abrir DevTools → Network → Throttle para "Offline"
# Tentar fazer login/register → deve funcionar com localStorage
# Plano deve salvar localmente, dados persistem
```

### Teste 2: CORS/Network Error
```javascript
// Injetar no console para forçar erro:
state.online = false  // Simula modo offline

// Tentar clicar em botões
// Verificar se dados salvam em localStorage
localStorage.getItem('plan:email@example.com')  // Deve ter dados
```

### Teste 3: Token Inválido
```bash
# Com backend rodando:
# 1. Fazer login, copiar token do localStorage
# 2. Modificar token manualmente no localStorage
# 3. Tentar acessar /api/plan
# Backend retorna 401
# Frontend fallback para localStorage, dados ainda aparecem
```

### Teste 4: Alternar Online/Offline
```javascript
// No console:
state.online = true; ping()   // Vai tentar API
state.online = false          // Volta para localStorage
// Dados devem estar em sync sempre
```

### Checklist de Teste
- [ ] Login offline: dados salvos em localStorage
- [ ] Login online: token recebido e armazenado
- [ ] Editar plano offline: salva em localStorage
- [ ] Editar plano online: salva em localStorage E API
- [ ] Token inválido: fallback para localStorage funciona
- [ ] Trocar de dia: dados do dia anterior persistem
- [ ] Clear plan: localStorage atualizado
- [ ] Export JSON: arquivo contém dados corretos

## Como Estender Funcionalidades

### Exemplo 1: Adicionar Campo "Tempo de Execução" ao Treino

**1. Frontend - Estrutura de Dados**
```javascript
// Em defaultPlan():
return {
  Segunda: [{ex, series, reps, weight, rest, obs, tempo}, ...]
}

// Em addRow():
// Adicionar coluna <td> antes de delete button:
tr.innerHTML = `
  ...
  <td><input placeholder="2min" value="${data.tempo||''}" inputmode="numeric"></td>
  <td><button class="btn btn-del">Remover</button></td>
`

// Em collectRows():
// Adicionar tempo ao destructuring:
const [ex, series, reps, weight, rest, tempo] = [...tr.querySelectorAll('input')]
return {ex, series, reps, weight, rest, tempo, obs}
```

**2. Backend - Aceitar Novo Campo**
```python
# Em do_PUT (PUT /api/plan):
# Python automaticamente preserva campos extras em JSON
# Nenhuma mudança necessária - backend aceita qualquer estrutura
```

**3. Testes**
```javascript
// Verificar se salva:
collectRows()
console.log(state.plan)  // Deve incluir "tempo" em cada exercício
savePlan()
// Verificar localStorage:
localStorage.getItem('plan:email@example.com')  // Deve ter "tempo"
```

### Exemplo 2: Adicionar Novo Dia da Semana (Treino B)

**1. Frontend**
```javascript
// Em defaultPlan():
return {
  Segunda: [], Terça: [], Quarta: [], Quinta: [], Sexta: [],
  'Treino B': []  // Novo dia
}

// Em selectDay <select>:
<option value="Treino B">Treino B</option>
```

**2. HTML**
```html
<!-- Em index.html, adicionar opção ao <select id="select-day">: -->
<option value="Treino B">Treino B</option>
```

**3. Backend**
```python
# Em do_POST (register):
if email not in plans:
    plans[email] = {
        'Segunda': [], 'Terça': [], 'Quarta': [], 'Quinta': [],
        'Sexta': [], 'Sábado': [], 'Domingo': [],
        'Treino B': []  # Adicionar aqui
    }
```

### Exemplo 3: Adicionar Validação de Email Duplicado (Frontend)

```javascript
// Em formRegister.submit:
const email = qs('#register-email').value.trim().toLowerCase()

// Validação local:
const existing = loadUser()
if (existing && existing.email === email) {
  alert('Você já tem uma conta com este email!')
  return
}

// Continuar com registro normalmente
```

### Padrão para Adicionar Feature Nova

1. **Identificar camada**:
   - Só frontend? (localStorage apenas)
   - Frontend + Backend? (precisa de novo endpoint)

2. **Frontend**:
   - Atualizar `state` e `defaultPlan()` se necessário
   - Adicionar elemento HTML com ID no `els` cache
   - Atualizar função relacionada (ex: `renderDay`, `collectRows`)
   - Testar offline (localStorage) + online (com token)

3. **Backend** (se needed):
   - Novo endpoint ou modificar existente
   - Validar token em header `X-Auth-Token`
   - Responder com JSON correto ou erro apropriado
   - Testar com curl/Postman

4. **Segurança**:
   - Tokens sempre verificados
   - Senhas nunca trafegam em plaintext
   - CORS headers em todas as respostas
   - Validação de entrada (length, type)

5. **Offline**:
   - Sempre salvar localStorage ANTES de API
   - Testar com `state.online = false`
   - Dados devem persistir mesmo se API falhar

## Troubleshooting Common Issues

- **"Usuário não carrega após login"**: Verificar se `loadUser()` está sendo chamado no `init()` e se `setUser()` atualiza `els.alunoUserName.textContent`
- **"Plano não salva"**: Certificar que `state.online` foi definido por `ping()` e que token é válido
- **"CORS error no browser"**: Garantir que `_cors()` é chamado ANTES de `end_headers()` em todo handler
- **"Mudança de dia não reflete"**: Sempre chamar `collectRows()` antes de mudar de dia para persistir dados
- **"Dados diferentes entre abas do browser"**: localStorage é por aba/domínio - dados devem sincronizar ao fazer login
- **"Export JSON não funciona"**: Verificar se `collectRows()` foi chamado antes de `exportJSON()` para ter dados atualizados
- **"Backend retorna 401 mesmo com token válido"**: Token pode estar expirado ou não estar sendo enviado no header `X-Auth-Token`

