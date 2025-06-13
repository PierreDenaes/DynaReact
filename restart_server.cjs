// Script to restart the server with new rate limiting configuration
const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Restarting server with updated rate limiting...\n');

// Kill any existing server process on port 5001
console.log('1. Stopping existing server...');
exec('lsof -ti:5001 | xargs kill -9', (error) => {
  if (error && !error.message.includes('No such process')) {
    console.log('   ⚠️  No existing server found on port 5001');
  } else {
    console.log('   ✅ Existing server stopped');
  }
  
  // Wait a moment then start the new server
  setTimeout(() => {
    console.log('\n2. Starting server with new configuration...');
    
    const serverProcess = exec('cd server && npm start', (error, stdout, stderr) => {
      if (error) {
        console.error('   ❌ Server start error:', error);
        return;
      }
    });
    
    serverProcess.stdout.on('data', (data) => {
      console.log('   📡', data.toString().trim());
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error('   ⚠️ ', data.toString().trim());
    });
    
    console.log('   ✅ Server starting...');
    console.log('\n🎯 Rate limiting updated:');
    console.log('   • Window: 1 minute (was 15 minutes)');
    console.log('   • Max requests: 1000 in development (was 100)');
    console.log('   • Better error messages for rate limiting');
    console.log('\n📋 Next steps:');
    console.log('   1. Wait for server to fully start');
    console.log('   2. Try the onboarding form again');
    console.log('   3. Navigation should work without refresh!');
    
  }, 2000);
});
