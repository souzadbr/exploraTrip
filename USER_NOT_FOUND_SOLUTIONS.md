# Soluções para "User not found"

## 🚨 **Problema**
Ao criar uma viagem, você está recebendo o erro **"User not found"** quando tenta adicionar `customiza.ee@gmail.com` como participante.

## 🔍 **Diagnóstico**

### **Cenário 1: Email não cadastrado**
O email `customiza.ee@gmail.com` não existe no banco de dados do backend.

**Solução**: 
1. Registre o email `customiza.ee@gmail.com` na tela de cadastro
2. Ou use apenas emails que já foram registrados

### **Cenário 2: Diferença de emails**
Você se registrou com um email diferente do que está tentando usar como participante.

**Solução**: 
1. Verifique qual email você usou para se registrar
2. Use o mesmo email ou registre o novo email

### **Cenário 3: Validação rigorosa do backend**
O backend está validando se todos os participantes existem antes de criar a viagem.

## 🛠️ **Soluções Implementáveis**

### **Solução 1: Não adicionar participantes inicialmente**
Crie a viagem sem participantes e adicione depois.

### **Solução 2: Usar apenas seu próprio email**
Use apenas o email com que você se registrou.

### **Solução 3: Melhorar tratamento de erro**
Vou melhorar o frontend para mostrar erros mais específicos.

### **Solução 4: Tornar participantes opcionais**
Modificar o frontend para permitir criar viagens sem participantes.

## 🔧 **Implementação das Soluções**

### **Solução Imediata: Participantes Opcionais**
Vou modificar o código para permitir criar viagens sem participantes obrigatórios.

### **Solução de Longo Prazo: Melhor UX**
- Validar emails antes de enviar
- Sugerir emails existentes
- Permitir convites para emails não cadastrados
