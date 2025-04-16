// Basic Netlify function to verify setup
exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Netlify Functions!" })
  };
}; 