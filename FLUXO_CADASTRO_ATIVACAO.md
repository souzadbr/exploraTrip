# Fluxo de Cadastro e Ativação - ExploraTrip

## 🔍 **Análise do Backend**

Baseado na documentação e imagens fornecidas, o fluxo real do backend é:

### **📡 Endpoints Implementados:**

#### **1. Cadastro de Usuário**
```
POST /api/user
```
**Request:**
```json
{
  "Name": "Nome do Usuário",
  "EmailVal": "usuario@email.com", 
  "Password": "senha123"
}
```
**Response (201 Created):**
```json
{
  "data": {
    "id": "uuid-do-usuario",
    "userName": "Nome do Usuário",
    "email": "usuario@email.com",
    "isActive": false
  },
  "isSuccess": true,
  "message": ""
}
```

#### **2. Reenvio de Código de Ativação**
```
POST /api/user/resendActivationCode/{email}
```
**Response (200 OK):**
```json
{
  "isSuccess": true,
  "data": "Activation code resent successfully!",
  "message": null
}
```

#### **3. Confirmação de Código**
```
POST /api/user/confirmCode
```
**Request:**
```json
{
  "email": "usuario@email.com",
  "confirmationCode": "123456"
}
```
**Response (200 OK):**
```json
{
  "data": {
    "id": "uuid-do-usuario",
    "userName": "Nome do Usuário", 
    "email": "usuario@email.com",
    "isActive": true,
    "token": "jwt-token-aqui"
  },
  "isSuccess": true,
  "message": "Conta ativada com sucesso"
}
```

#### **4. Login**
```
POST /api/user/login
```
**Request:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```
**Response (200 OK):**
```json
{
  "data": {
    "id": "uuid-do-usuario",
    "name": "Nome do Usuário",
    "email": "usuario@email.com", 
    "token": "jwt-token-aqui"
  },
  "isSuccess": true,
  "message": "Login realizado com sucesso"
}
```

## 🔄 **Fluxo Completo**

### **1. Cadastro Inicial:**
1. Usuário preenche formulário de cadastro
2. Frontend chama `POST /api/user`
3. Backend cria usuário com `isActive: false`
4. Backend envia email com código de 6 dígitos
5. Frontend redireciona para tela de verificação

### **2. Ativação da Conta:**
1. Usuário recebe email com código
2. Usuário insere código na tela de verificação
3. Frontend chama `POST /api/user/confirmCode`
4. Backend valida código e ativa usuário
5. Backend retorna dados do usuário + token
6. Frontend faz login automático
7. Frontend redireciona para dashboard

### **3. Reenvio de Código (se necessário):**
1. Usuário clica "Reenviar código"
2. Frontend chama `POST /api/user/resendActivationCode/{email}`
3. Backend envia novo código por email
4. Usuário insere novo código

### **4. Login Posterior:**
1. Usuário usa email/senha na tela de login
2. Frontend chama `POST /api/user/login`
3. Backend valida credenciais
4. Backend retorna dados + token
5. Frontend salva dados e redireciona

## 🛠️ **Implementação no Frontend**

### **Arquivos Modificados:**

#### **1. `src/config/api.ts`**
- Endpoints atualizados para corresponder ao backend real
- Removidos endpoints não utilizados

#### **2. `src/services/authService.ts`**
- `confirmRegistration()`: Usa `POST /api/user/confirmCode`
- `resendActivationCode()`: Usa `POST /api/user/resendActivationCode/{email}`
- Tratamento de erros específicos do backend

#### **3. `src/screens/register/Register.tsx`**
- Mantém formato de dados correto: `{Name, EmailVal, Password}`
- Redireciona para verificação após cadastro bem-sucedido

#### **4. `src/screens/verify-registration/VerifyRegistration.tsx`**
- Usa endpoints reais de confirmação e reenvio
- Login automático após ativação bem-sucedida

## 🧪 **Como Testar**

### **Pré-requisitos:**
1. Backend rodando em `http://localhost:5052`
2. Servidor de email configurado no backend
3. Frontend rodando em `http://localhost:5173`

### **Teste 1: Cadastro Completo (Primeira Vez)**

#### **Passo 1 - Cadastro:**
1. Acesse `http://localhost:5173/register`
2. Preencha:
   - **Nome**: "João Silva"
   - **Email**: "joao.silva@email.com" (email real para receber código)
   - **Senha**: "MinhaSenh@123"
   - **Confirmar Senha**: "MinhaSenh@123"
3. Clique "Cadastrar"
4. **Resultado esperado**: 
   - Mensagem "Cadastro realizado com sucesso!"
   - Redirecionamento para `/verify-registration`
   - Email enviado com código de 6 dígitos

#### **Passo 2 - Ativação:**
1. Verifique seu email e copie o código de 6 dígitos
2. Na tela de verificação, digite o código
3. Clique "Confirmar código"
4. **Resultado esperado**:
   - Mensagem "Conta ativada com sucesso!"
   - Login automático
   - Redirecionamento para `/dashboard`

### **Teste 2: Reenvio de Código**

#### **Cenário: Código não chegou ou expirou**
1. Na tela de verificação, clique "Reenviar código"
2. **Resultado esperado**:
   - Mensagem "Código reenviado com sucesso!"
   - Novo email enviado
3. Digite o novo código e confirme

### **Teste 3: Login Posterior**

#### **Após ativação bem-sucedida:**
1. Faça logout (se estiver logado)
2. Acesse `http://localhost:5173/login`
3. Digite:
   - **Email**: "joao.silva@email.com"
   - **Senha**: "MinhaSenh@123"
4. Clique "Entrar"
5. **Resultado esperado**:
   - Login bem-sucedido
   - Redirecionamento para `/dashboard`

## 🚨 **Possíveis Erros e Soluções**

### **Erro 1: "Código inválido ou expirado"**
- **Causa**: Código digitado incorretamente ou expirou
- **Solução**: Solicitar novo código via "Reenviar código"

### **Erro 2: "Usuário não encontrado"**
- **Causa**: Email não foi cadastrado
- **Solução**: Verificar email ou fazer novo cadastro

### **Erro 3: "Este usuário já está ativo"**
- **Causa**: Conta já foi ativada anteriormente
- **Solução**: Fazer login diretamente

### **Erro 4: "Email já cadastrado"**
- **Causa**: Email já existe no sistema
- **Solução**: Usar "Reenviar código" ou fazer login

## 📊 **Monitoramento**

### **Console do Navegador:**
- Logs detalhados de todas as requisições
- Status codes e respostas da API
- Dados enviados e recebidos

### **Network Tab:**
- Verificar requisições HTTP
- Confirmar endpoints chamados
- Verificar headers e payloads

## ✅ **Checklist de Teste**

- [ ] Cadastro com email novo funciona
- [ ] Email com código é recebido
- [ ] Confirmação de código ativa a conta
- [ ] Login automático após ativação
- [ ] Reenvio de código funciona
- [ ] Login posterior funciona
- [ ] Tratamento de erros está correto
- [ ] Redirecionamentos funcionam
- [ ] Interface responsiva
- [ ] Mensagens de feedback claras

## 🎯 **Resultado Esperado**

Após implementação completa:
1. **Fluxo de cadastro** totalmente funcional
2. **Ativação por email** funcionando
3. **Login automático** após primeira ativação
4. **Sistema de reenvio** operacional
5. **Tratamento robusto** de erros
6. **Interface intuitiva** e responsiva

**O sistema estará pronto para uso em produção!**
