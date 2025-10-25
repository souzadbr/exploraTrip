# Instruções para Testar a Integração com Backend

## 🚀 Pré-requisitos

### 1. **Backend Rodando**
Certifique-se de que o backend está rodando em:
```
http://localhost:5052
```

### 2. **Verificar Conectividade**
Teste se o backend está acessível:
```bash
curl -X GET http://localhost:5052/api/trip -v
```

## 🧪 Testes de Integração

### **Teste 1: Criar Viagem com Sucesso**

1. **Acesse a aplicação**: `http://localhost:5173`
2. **Faça login** (qualquer usuário/senha)
3. **Clique em "Criar Viagem"**
4. **Preencha os dados**:
   - Nome: "Viagem de Teste"
   - Data início: Hoje
   - Data fim: Amanhã
   - Orçamento: 1000
   - Nota: "Teste de integração"
   - Participante: "teste@email.com"
5. **Clique em "Criar Viagem"**

**Resultado Esperado**:
- ✅ Loading aparece
- ✅ Mensagem de sucesso
- ✅ Redirecionamento para dashboard
- ✅ Console mostra logs da requisição

### **Teste 2: Validação de Campos**

1. **Acesse "Criar Viagem"**
2. **Deixe campos obrigatórios vazios**
3. **Clique em "Criar Viagem"**

**Resultado Esperado**:
- ❌ Erro: "Nome da viagem é obrigatório"
- ❌ Não envia requisição

### **Teste 3: Validação de Datas**

1. **Preencha nome da viagem**
2. **Data início**: Amanhã
3. **Data fim**: Hoje (anterior)
4. **Clique em "Criar Viagem"**

**Resultado Esperado**:
- ❌ Erro: "Data de fim deve ser posterior à data de início"

### **Teste 4: Erro do Backend**

1. **Pare o backend**
2. **Tente criar uma viagem**

**Resultado Esperado**:
- ❌ Erro de conexão
- ❌ Mensagem: "Não foi possível conectar ao servidor"

## 🔍 Debug e Monitoramento

### **Console do Navegador (F12)**

Durante os testes, observe os logs:

```javascript
// Dados enviados
"Enviando dados da viagem:" {
  name: "Viagem de Teste",
  startDate: "2025-01-20T00:00:00.000Z",
  endDate: "2025-01-21T00:00:00.000Z",
  budget: 1000,
  notes: ["Teste de integração"],
  userRoles: [{userEmail: "teste@email.com", role: 1}]
}

// Resposta da API
"Resposta da API - Status:" 200
"Resposta da API - Body:" {
  data: {...},
  isSuccess: true,
  message: "Viagem criada com sucesso"
}
```

### **Network Tab (F12 > Network)**

Verifique a requisição HTTP:
- **URL**: `http://localhost:5052/api/trip`
- **Method**: POST
- **Headers**: Content-Type: application/json
- **Body**: JSON com dados da viagem
- **Status**: 200 (sucesso) ou erro

## 🐛 Possíveis Problemas e Soluções

### **Problema 1: CORS Error**
```
Access to fetch at 'http://localhost:5052/api/trip' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solução**: Configurar CORS no backend para aceitar `http://localhost:5173`

### **Problema 2: 404 Not Found**
```
POST http://localhost:5052/api/trip 404 (Not Found)
```

**Soluções**:
- Verificar se a rota `/api/trip` existe no backend
- Verificar se o endpoint aceita POST
- Verificar se o backend está rodando

### **Problema 3: 400 Bad Request**
```
POST http://localhost:5052/api/trip 400 (Bad Request)
```

**Soluções**:
- Verificar estrutura do JSON enviado
- Verificar se todos os campos obrigatórios estão presentes
- Verificar tipos de dados (string, number, array)

### **Problema 4: 401 Unauthorized**
```
POST http://localhost:5052/api/trip 401 (Unauthorized)
```

**Solução**: Implementar autenticação com token no header

## 🔧 Configurações Avançadas

### **Alterar URL da API**

Se o backend estiver em outra porta/URL, edite:

```typescript
// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: 'http://localhost:NOVA_PORTA/api', // Altere aqui
  ENDPOINTS: {
    USER: '/user',
    TRIP: '/trip',
  }
}
```

### **Adicionar Autenticação**

Quando o token estiver disponível:

```typescript
// src/services/tripService.ts
private static getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken') // Obter token real
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // Descomentar
  }
}
```

### **Timeout de Requisição**

Para adicionar timeout:

```typescript
// src/services/tripService.ts
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s

const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TRIP), {
  method: 'POST',
  headers: this.getAuthHeaders(),
  body: JSON.stringify(tripData),
  signal: controller.signal
})

clearTimeout(timeoutId)
```

## 📊 Checklist de Testes

### **Funcionalidade**
- [ ] Criar viagem com dados válidos
- [ ] Validação de campos obrigatórios
- [ ] Validação de datas
- [ ] Adicionar/remover notas
- [ ] Adicionar/remover participantes
- [ ] Cancelar criação

### **Integração**
- [ ] Requisição HTTP enviada corretamente
- [ ] Headers corretos
- [ ] Body JSON válido
- [ ] Resposta de sucesso processada
- [ ] Erros de validação exibidos
- [ ] Erros de rede tratados

### **Interface**
- [ ] Loading state durante requisição
- [ ] Mensagens de sucesso/erro
- [ ] Campos com erro destacados
- [ ] Redirecionamento após sucesso
- [ ] Botões desabilitados durante loading

## 🎯 Resultado Esperado

Após todos os testes, a integração deve:

1. **Enviar dados corretamente** para o backend
2. **Processar respostas** de sucesso e erro
3. **Exibir feedback visual** apropriado
4. **Validar dados** antes do envio
5. **Tratar erros** de forma robusta
6. **Manter boa experiência** do usuário

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** do console
2. **Analise a aba Network** do DevTools
3. **Confirme se o backend** está rodando
4. **Teste a API** diretamente com Postman/curl
5. **Verifique a configuração** de CORS no backend
