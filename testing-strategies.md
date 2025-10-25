# 🧪 Estratégias para Testes com Emails

## 📧 1. Emails Temporários (Recomendado)

### **Serviços de Email Temporário:**
- **10MinuteMail**: https://10minutemail.com/
- **TempMail**: https://temp-mail.org/
- **Guerrilla Mail**: https://www.guerrillamail.com/
- **Mailinator**: https://www.mailinator.com/

### **Vantagens:**
- ✅ Sempre disponíveis para novos cadastros
- ✅ Não precisam ser "limpos"
- ✅ Recebem emails reais
- ✅ Ideais para testes

## 🔄 2. Reutilizar Email Existente

### **Método 1: Reenviar Código**
```javascript
// No console do navegador:
fetch('http://localhost:5052/api/user/resend-confirmation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'seu@email.com' })
})
.then(r => r.json())
.then(console.log);
```

### **Método 2: Reset de Senha**
1. Vá para `/forgot-password`
2. Digite o email
3. Use o código recebido para resetar
4. Isso "reativa" o usuário

### **Método 3: Verificar Status**
```javascript
// Verificar se email está disponível:
fetch('http://localhost:5052/api/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'teste@email.com', password: 'qualquer' })
})
.then(r => r.json())
.then(data => {
  if (data.message?.includes('User does not exist')) {
    console.log('✅ Disponível para cadastro');
  } else if (data.message?.includes('User is disabled')) {
    console.log('⚠️ Existe mas inativo - pode reenviar código');
  } else {
    console.log('❌ Já está ativo');
  }
});
```

## 🛠️ 3. Limpeza Manual (Backend)

### **Se você tem acesso ao backend:**
```sql
-- Remover usuários não confirmados (mais de 24h)
DELETE FROM users 
WHERE isActive = false 
AND createdAt < NOW() - INTERVAL 24 HOUR;

-- Ou resetar status de um usuário específico
UPDATE users 
SET isActive = false, confirmationCode = NULL 
WHERE email = 'seu@email.com';
```

## 📱 4. Variações de Email

### **Técnica do "+":**
Se seu email é `seuemail@gmail.com`, use:
- `seuemail+teste1@gmail.com`
- `seuemail+teste2@gmail.com`
- `seuemail+dev@gmail.com`

**Todos chegam na mesma caixa de entrada!**

### **Técnica do ".":**
Para Gmail, estes são equivalentes:
- `seu.email@gmail.com`
- `seuemail@gmail.com`
- `s.e.u.e.m.a.i.l@gmail.com`

## 🎯 5. Fluxo Recomendado para Testes

### **Opção A: Email Temporário (Mais Fácil)**
1. Acesse https://10minutemail.com/
2. Copie o email temporário
3. Use para cadastro
4. Verifique o código no site
5. Complete o teste

### **Opção B: Reutilizar Email**
1. Abra console do navegador (F12)
2. Execute: `localStorage.clear()`
3. Execute função de verificação de status
4. Se inativo: reenvie código
5. Se ativo: use reset de senha

### **Opção C: Variação de Email**
1. Use `seuemail+teste1@gmail.com`
2. Para próximo teste: `seuemail+teste2@gmail.com`
3. Todos chegam no mesmo email

## 🚀 6. Automação para Desenvolvimento

### **Script de Limpeza Rápida:**
```javascript
// Salve como bookmark para uso rápido
javascript:(function(){
  localStorage.clear();
  alert('Dados locais limpos! Pronto para novo teste.');
})();
```

### **Função Completa de Preparação:**
```javascript
async function prepararTeste(email) {
  localStorage.clear();
  
  const response = await fetch('http://localhost:5052/api/user/resend-confirmation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  if (response.ok) {
    alert('✅ Email preparado! Verifique a caixa de entrada.');
  } else {
    alert('⚠️ Email pode estar ativo. Tente outro ou use reset de senha.');
  }
}
```

## 💡 Dicas Importantes

1. **Sempre limpe localStorage** antes de novos testes
2. **Use emails temporários** para testes automatizados
3. **Mantenha um email real** para testes manuais
4. **Documente emails de teste** usados
5. **Configure timeout** para códigos de confirmação no backend
