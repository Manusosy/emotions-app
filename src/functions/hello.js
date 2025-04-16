// Sample Netlify function
exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from Netlify Functions!",
      environment: process.env.NODE_ENV
    })
  };
}; 