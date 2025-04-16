// Install Rollup dependencies for Netlify builds
const { execSync } = require('child_process');

exports.handler = async function() {
  console.log('🔄 Installing Rollup dependencies for Netlify build...');
  
  try {
    // Install both GNU and musl builds to cover different Linux variants
    execSync('npm install --no-save @rollup/rollup-linux-x64-gnu@4.9.1 @rollup/rollup-linux-x64-musl@4.9.1', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NPM_CONFIG_ENGINE_STRICT: "false"
      }
    });
    
    console.log('✅ Successfully installed Rollup dependencies!');
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Successfully installed Rollup dependencies' })
    };
  } catch (error) {
    console.error('❌ Error installing Rollup dependencies:', error);
    // Don't fail the build
    return {
      statusCode: 200, // Still return 200 to not fail build
      body: JSON.stringify({ 
        message: 'Error installing dependencies, but continuing build',
        error: error.message
      })
    };
  }
}; 