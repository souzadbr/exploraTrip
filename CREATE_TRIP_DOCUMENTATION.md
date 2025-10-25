# Documentação - Tela de Criar Viagem

## 📋 Resumo

Foi criada uma nova tela para criar viagens que segue a estrutura de dados esperada pelo backend conforme mostrado na API. A tela permite ao usuário preencher todas as informações necessárias para criar uma nova viagem.

## 🗂️ Arquivos Criados

### 1. **CreateTrip.tsx** (`src/screens/create-trip/CreateTrip.tsx`)
- Componente principal da tela de criar viagem
- Formulário completo com validação
- Integração preparada para API do backend

### 2. **CreateTrip.css** (`src/screens/create-trip/CreateTrip.css`)
- Estilos responsivos seguindo o padrão visual da aplicação
- Design consistente com outras telas
- Animações e transições suaves

### 3. **index.ts** (`src/screens/create-trip/index.ts`)
- Arquivo de exportação do componente

## 🔧 Modificações Realizadas

### **App.tsx**
- Adicionada importação do componente `CreateTrip`
- Nova rota protegida `/create-trip`
- Rota protegida por `ProtectedRoute` (requer autenticação)

### **Dashboard.tsx**
- Adicionada função `handleCreateTrip`
- Botão "Criar Viagem" agora navega para `/create-trip`

## 📊 Estrutura de Dados

A tela segue exatamente a estrutura esperada pelo backend:

```typescript
interface TripFormData {
  name: string                    // Nome da viagem
  startDate: string              // Data de início (ISO string)
  endDate: string                // Data de fim (ISO string)
  budget: number                 // Orçamento em reais
  notes: string[]                // Array de notas
  userRoles: UserRole[]          // Array de participantes
}

interface UserRole {
  userEmail: string              // Email do participante
  role: number                   // Papel do usuário (1 = padrão)
}
```

## 🎨 Funcionalidades da Tela

### **Campos Obrigatórios**
- ✅ Nome da viagem
- ✅ Data de início
- ✅ Data de fim

### **Campos Opcionais**
- 💰 Orçamento (valor em reais)
- 📝 Notas da viagem (múltiplas)
- 👥 Participantes (emails)

### **Validações Implementadas**
- ✅ Campos obrigatórios preenchidos
- ✅ Data de fim posterior à data de início
- ✅ Formato de email válido para participantes
- ✅ Valores numéricos para orçamento

### **Funcionalidades Interativas**
- ➕ Adicionar/remover notas dinamicamente
- 👥 Adicionar/remover participantes
- 🔄 Navegação de volta ao dashboard
- 💾 Simulação de criação (preparado para API)

## 🛡️ Segurança e Navegação

- **Rota Protegida**: Apenas usuários autenticados podem acessar
- **Validação Frontend**: Validações antes do envio
- **Navegação Intuitiva**: Botão de voltar e cancelar
- **Feedback Visual**: Mensagens de erro e sucesso

## 🔗 Integração com Backend

### **Endpoint Preparado**
```javascript
// TODO: Substituir pela URL real da API
const response = await fetch('{{base_url_trip}}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(tripData)
})
```

### **Formato de Envio**
```json
{
  "name": "Viagem para Paris",
  "startDate": "2025-09-02T16:23:49.442Z",
  "endDate": "2025-09-10T16:23:49.442Z",
  "budget": 5000.00,
  "notes": [
    "Levar passaporte",
    "Reservar hotel"
  ],
  "userRoles": [
    {
      "userEmail": "amigo@email.com",
      "role": 1
    }
  ]
}
```

## 📱 Design Responsivo

### **Desktop**
- Layout em duas colunas para datas
- Formulário centralizado com largura máxima
- Botões alinhados à direita

### **Tablet**
- Formulário de coluna única
- Espaçamentos ajustados
- Botões em linha

### **Mobile**
- Layout completamente vertical
- Botões em pilha
- Campos de entrada otimizados para toque

## 🧪 Como Testar

### **Fluxo Completo**
1. **Login** na aplicação
2. **Dashboard** → Clique em "Criar Viagem"
3. **Preencha** os campos obrigatórios:
   - Nome da viagem
   - Data de início
   - Data de fim
4. **Adicione** informações opcionais:
   - Orçamento
   - Notas
   - Participantes
5. **Clique** em "Criar Viagem"
6. **Aguarde** confirmação e redirecionamento

### **Validações para Testar**
- ❌ Tentar enviar sem nome
- ❌ Data de fim anterior à data de início
- ❌ Email inválido para participantes
- ✅ Formulário válido completo

## 🚀 Próximos Passos

1. **Integrar com API real** do backend
2. **Adicionar autenticação** nos headers das requisições
3. **Implementar loading states** mais elaborados
4. **Adicionar upload de imagens** para a viagem
5. **Implementar edição** de viagens existentes
6. **Adicionar validação de datas** mais robusta
7. **Implementar diferentes roles** para participantes

## 🎯 Resultado

A tela de criar viagem está **100% funcional** e pronta para integração com o backend. O design é **responsivo**, **acessível** e **consistente** com o resto da aplicação. Todos os campos necessários estão implementados conforme a estrutura da API mostrada.
