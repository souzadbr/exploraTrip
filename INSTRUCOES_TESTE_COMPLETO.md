# 🧪 Instruções de Teste - Fluxo Completo de Cadastro e Ativação

## 🚀 **Setup Inicial**

### **1. Servidores Necessários:**
- **Frontend**: `http://localhost:5174` ✅ (Rodando)
- **Backend**: `http://localhost:5052` ⚠️ (Precisa ser iniciado)

### **2. Verificar Backend:**
```bash
# Teste se o backend está rodando
curl -X GET http://localhost:5052/api/user -v
```

## 🎯 **Teste 1: Cadastro Completo (Primeira Vez)**

### **Objetivo:** Testar o fluxo completo de cadastro → ativação → login automático

### **Passo 1 - Cadastro:**
1. **Acesse**: `http://localhost:5174/register`
2. **Preencha o formulário:**
   ```
   Nome: João Silva Teste
   Email: seu.email.real@gmail.com  (USE SEU EMAIL REAL!)
   Senha: MinhaSenh@123
   Confirmar Senha: MinhaSenh@123
   ```
3. **Clique**: "Cadastrar"
4. **Resultado esperado:**
   - ✅ Mensagem: "Cadastro realizado com sucesso!"
   - ✅ Redirecionamento automático para `/verify-registration`
   - ✅ Email enviado para seu email com código de 6 dígitos

### **Passo 2 - Verificar Email:**
1. **Abra seu email** (Gmail, Outlook, etc.)
2. **Procure por email** do ExploraTrip
3. **Copie o código** de 6 dígitos (ex: 123456)

### **Passo 3 - Ativação:**
1. **Na tela de verificação**, digite o código recebido
2. **Clique**: "Confirmar código"
3. **Resultado esperado:**
   - ✅ Mensagem: "Conta ativada com sucesso!"
   - ✅ Login automático (primeira vez)
   - ✅ Redirecionamento para `/dashboard`
   - ✅ Usuário logado automaticamente

## 🔄 **Teste 2: Reenvio de Código**

### **Objetivo:** Testar funcionalidade de reenvio quando código não chega

### **Cenário A - Código não chegou:**
1. **Na tela de verificação**, clique "Reenviar código"
2. **Resultado esperado:**
   - ✅ Mensagem: "Código reenviado com sucesso!"
   - ✅ Novo email enviado
3. **Digite o novo código** e confirme

### **Cenário B - Código expirado:**
1. **Aguarde** alguns minutos (códigos expiram em 3 minutos)
2. **Tente usar código antigo**
3. **Resultado esperado:**
   - ❌ Erro: "Código inválido ou expirado"
4. **Clique "Reenviar código"** e use o novo

## 🔐 **Teste 3: Login Posterior**

### **Objetivo:** Testar login após conta já ativada

### **Passo 1 - Logout:**
1. **No dashboard**, clique "Sair" (se estiver logado)
2. **Resultado**: Redirecionamento para `/login`

### **Passo 2 - Login:**
1. **Na tela de login**, digite:
   ```
   Email: seu.email.real@gmail.com
   Senha: MinhaSenh@123
   ```
2. **Clique**: "Entrar"
3. **Resultado esperado:**
   - ✅ Login bem-sucedido
   - ✅ Redirecionamento para `/dashboard`

## 🚨 **Teste 4: Cenários de Erro**

### **Erro 1 - Email já cadastrado:**
1. **Tente cadastrar** com mesmo email novamente
2. **Resultado esperado:**
   - ❌ Erro: "Email já cadastrado"
   - ✅ Opção de "Reenviar código de ativação"

### **Erro 2 - Código inválido:**
1. **Digite código errado** (ex: 000000)
2. **Resultado esperado:**
   - ❌ Erro: "Código inválido ou expirado"

### **Erro 3 - Usuário já ativo:**
1. **Tente ativar** conta já ativada
2. **Resultado esperado:**
   - ❌ Erro: "Este usuário já está ativo"
   - ✅ Sugestão para fazer login

## 📊 **Monitoramento Durante Testes**

### **Console do Navegador (F12):**
```javascript
// Logs que você deve ver:
"Enviando dados para API: {Name: '...', EmailVal: '...', Password: '...'}"
"Resposta da API - Status: 201"
"Confirmando cadastro para: email com código: 123456"
"Resposta da confirmação - Status: 200"
"Login automático após ativação"
```

### **Network Tab:**
- ✅ `POST /api/user` (201 Created)
- ✅ `POST /api/user/confirmCode` (200 OK)
- ✅ `POST /api/user/resendActivationCode/email` (200 OK)
- ✅ `POST /api/user/login` (200 OK)

## 🔧 **Troubleshooting**

### **Problema 1: Backend não responde**
```bash
# Verificar se backend está rodando
curl -X GET http://localhost:5052/api/user
```
**Solução**: Iniciar o backend do ExploraTrip

### **Problema 2: Email não chega**
- Verificar pasta de spam
- Verificar configuração SMTP do backend
- Usar email real (não temporário)

### **Problema 3: Erro 500 no cadastro**
- Email pode já existir no banco
- Verificar logs do backend
- Tentar com email diferente

### **Problema 4: Redirecionamento não funciona**
- Verificar console para erros JavaScript
- Verificar se rotas estão configuradas
- Limpar localStorage: `localStorage.clear()`

## ✅ **Checklist de Validação**

### **Funcionalidades Básicas:**
- [ ] Cadastro com email novo funciona
- [ ] Email com código é recebido
- [ ] Confirmação de código ativa conta
- [ ] Login automático após primeira ativação
- [ ] Logout funciona
- [ ] Login posterior funciona

### **Funcionalidades Avançadas:**
- [ ] Reenvio de código funciona
- [ ] Tratamento de código expirado
- [ ] Tratamento de email duplicado
- [ ] Tratamento de usuário já ativo
- [ ] Validação de campos obrigatórios
- [ ] Validação de formato de email

### **Interface e UX:**
- [ ] Mensagens de erro claras
- [ ] Mensagens de sucesso visíveis
- [ ] Loading states funcionam
- [ ] Redirecionamentos automáticos
- [ ] Botões desabilitados durante loading
- [ ] Interface responsiva

## 🎯 **Resultado Final Esperado**

Após todos os testes:

1. **✅ Cadastro**: Usuário consegue se cadastrar com email real
2. **✅ Email**: Código de ativação é recebido por email
3. **✅ Ativação**: Código confirma e ativa a conta
4. **✅ Login Automático**: Primeira ativação faz login automático
5. **✅ Dashboard**: Usuário é redirecionado para área logada
6. **✅ Login Manual**: Logins posteriores funcionam normalmente
7. **✅ Reenvio**: Sistema de reenvio de código operacional
8. **✅ Erros**: Tratamento robusto de todos os cenários de erro

## 📝 **Relatório de Teste**

Após completar os testes, documente:

```
✅ PASSOU | ❌ FALHOU | ⚠️ PARCIAL

[ ] Cadastro inicial
[ ] Recebimento de email
[ ] Ativação com código
[ ] Login automático
[ ] Reenvio de código
[ ] Login posterior
[ ] Tratamento de erros
[ ] Interface responsiva

Observações:
- [Descreva problemas encontrados]
- [Sugestões de melhoria]
- [Comportamentos inesperados]
```

## 🚀 **Próximos Passos**

Após validação completa:
1. **Documentar** fluxo final
2. **Otimizar** tratamento de erros
3. **Implementar** melhorias de UX
4. **Preparar** para produção
5. **Configurar** monitoramento
6. **Treinar** usuários finais

**🎉 O sistema estará pronto para uso em produção!**
