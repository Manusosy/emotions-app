// Netlify plugin to install platform-specific Rollup dependencies
module.exports = {
  onPreBuild: async ({ utils }) => {
    try {
      console.log('🔍 Installing platform-specific Rollup dependencies for Linux...');
      await utils.run.command('npm install --no-save @rollup/rollup-linux-x64-gnu@4.9.1 @rollup/rollup-linux-x64-musl@4.9.1');
      console.log('✅ Successfully installed Rollup dependencies for Linux!');
    } catch (error) {
      console.error('❌ Error installing Rollup dependencies:', error);
      // Don't fail the build - some environments might not need these dependencies
      console.log('⚠️ Continuing build despite installation error...');
    }
  }
}; 