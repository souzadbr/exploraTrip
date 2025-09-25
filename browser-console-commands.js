// Comandos para executar no console do navegador (F12)
// Cole estes comandos no console para limpar/testar emails

// 1. LIMPAR DADOS LOCAIS
localStorage.clear();
console.log('✅ Todos os dados locais foram limpos');

// 2. VERIFICAR SE EMAIL EXISTE (substitua pelo seu email)
const testEmail = 'seu@email.com';

fetch('http://localhost:5052/api/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: testEmail, password: 'qualquersenha' })
})
.then(response => response.json())
.then(data => {
  console.log('Status do email:', data);
  if (data.message?.includes('User does not exist')) {
    console.log('✅ Email disponível para cadastro');
  } else if (data.message?.includes('User is disabled')) {
    console.log('⚠️ Email existe mas não está ativo - pode reenviar código');
  } else {
    console.log('ℹ️ Email já está em uso');
  }
});

// 3. REENVIAR CÓDIGO DE CONFIRMAÇÃO
fetch('http://localhost:5052/api/user/resend-confirmation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: testEmail })
})
.then(response => response.json())
.then(data => console.log('Reenvio de código:', data));

// 4. FUNÇÃO COMPLETA PARA PREPARAR EMAIL
async function prepararEmailParaTeste(email) {
  // Limpar dados locais
  localStorage.clear();
  
  // Verificar status
  try {
    const loginResponse = await fetch('http://localhost:5052/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'teste' })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginData.message?.includes('User does not exist')) {
      console.log('✅ Email disponível para novo cadastro!');
      return 'disponivel';
    } else if (loginData.message?.includes('User is disabled')) {
      console.log('📧 Reenviando código...');
      
      const resendResponse = await fetch('http://localhost:5052/api/user/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const resendData = await resendResponse.json();
      console.log('Resultado do reenvio:', resendData);
      return 'codigo_reenviado';
    } else {
      console.log('⚠️ Email já está ativo. Use outro email ou faça login.');
      return 'ativo';
    }
  } catch (error) {
    console.error('Erro:', error);
    return 'erro';
  }
}

// EXEMPLO DE USO:
// prepararEmailParaTeste('seu@email.com');
