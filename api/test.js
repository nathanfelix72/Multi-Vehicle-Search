module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/html');

  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Multi-Vehicle Search API Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .container { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 10px 0; }
        button { background: #0070f3; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0051cc; }
        pre { background: #f0f0f0; padding: 15px; border-radius: 4px; overflow-x: auto; }
        .error { color: red; }
        .success { color: green; }
    </style>
</head>
<body>
    <h1>Multi-Vehicle Search API Test</h1>
    
    <div class="container">
        <h2>Test the API</h2>
        <p>Click the button below to test the API with the example from the README:</p>
        <button onclick="testAPI()">Test API</button>
        <div id="result"></div>
    </div>

    <div class="container">
        <h2>Manual Testing</h2>
        <p>You can also test using curl:</p>
        <pre>curl -X POST "https://multi-vehicle-search.vercel.app/" \\
  -H "Content-Type: application/json" \\
  -d '[
    {
      "length": 10,
      "quantity": 1
    }
  ]'</pre>
    </div>

    <script>
        async function testAPI() {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<p>Testing...</p>';
            
            try {
                const response = await fetch('/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify([
                        {
                            "length": 10,
                            "quantity": 1
                        }
                    ])
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    resultDiv.innerHTML = \`
                        <h3 class="success">✅ API Test Successful!</h3>
                        <p>Found \${data.length} results</p>
                        <pre>\${JSON.stringify(data.slice(0, 3), null, 2)}</pre>
                        \${data.length > 3 ? '<p>... and ' + (data.length - 3) + ' more results</p>' : ''}
                    \`;
                } else {
                    resultDiv.innerHTML = \`
                        <h3 class="error">❌ API Test Failed</h3>
                        <p>Status: \${response.status}</p>
                        <pre>\${JSON.stringify(data, null, 2)}</pre>
                    \`;
                }
            } catch (error) {
                resultDiv.innerHTML = \`
                    <h3 class="error">❌ Network Error</h3>
                    <p>\${error.message}</p>
                \`;
            }
        }
    </script>
</body>
</html>
  `;

  res.status(200).send(html);
};