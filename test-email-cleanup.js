// Script para testar limpeza de emails não ativos
// Execute este script no console do navegador ou como arquivo Node.js

const API_BASE_URL = 'http://localhost:5052/api';

// 1. Reenviar código de confirmação para um email
async function resendConfirmationCode(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/user/resend-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    console.log('Reenvio de código:', data);
    return data;
  } catch (error) {
    console.error('Erro ao reenviar código:', error);
  }
}

// 2. Tentar fazer login para verificar se usuário existe e está ativo
async function checkUserStatus(email, password = 'senha123') {
  try {
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    console.log('Status do usuário:', data);
    
    if (response.status === 401 && data.message?.includes('User is disabled')) {
      console.log('✅ Usuário existe mas não está ativo - pode reenviar código');
      return 'inactive';
    } else if (response.status === 404) {
      console.log('✅ Usuário não existe - pode cadastrar novamente');
      return 'not_exists';
    } else if (response.status === 200) {
      console.log('⚠️ Usuário já está ativo');
      return 'active';
    }
    
    return 'unknown';
  } catch (error) {
    console.error('Erro ao verificar status:', error);
  }
}

// 3. Função para limpar dados locais do navegador
function clearLocalData() {
  localStorage.removeItem('user');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('authToken');
  console.log('✅ Dados locais limpos');
}

// 4. Função principal para preparar email para novos testes
async function prepareEmailForTesting(email) {
  console.log(`🧪 Preparando email ${email} para testes...`);
  
  // Limpar dados locais primeiro
  clearLocalData();
  
  // Verificar status do usuário
  const status = await checkUserStatus(email);
  
  switch (status) {
    case 'inactive':
      console.log('📧 Reenviando código de confirmação...');
      await resendConfirmationCode(email);
      console.log('✅ Código reenviado! Verifique o email.');
      break;
      
    case 'not_exists':
      console.log('✅ Email disponível para novo cadastro!');
      break;
      
    case 'active':
      console.log('⚠️ Usuário já está ativo. Opções:');
      console.log('   1. Use outro email');
      console.log('   2. Faça login normalmente');
      console.log('   3. Use "Esqueci minha senha" para resetar');
      break;
      
    default:
      console.log('❓ Status desconhecido. Tente cadastrar novamente.');
  }
}

// 5. Exemplos de uso:
console.log('🛠️ Funções disponíveis:');
console.log('- prepareEmailForTesting("seu@email.com")');
console.log('- resendConfirmationCode("seu@email.com")');
console.log('- checkUserStatus("seu@email.com")');
console.log('- clearLocalData()');

// Exportar funções para uso
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    prepareEmailForTesting,
    resendConfirmationCode,
    checkUserStatus,
    clearLocalData
  };
}
