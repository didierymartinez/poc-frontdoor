const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Configuración de CORS para permitir llamadas desde el navegador (Cloudflare Pages)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Cosmos-UserId, X-Cosmos-Tenant');

  // Manejo de Preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'application/json');

  // Solo respondemos a la ruta /api/data
  if (req.url === '/api/data') {
    console.log(`\n[MICROSERVICIO] 📥 Petición recibida en: ${req.url}`);
    
    // Aquí el microservicio real leería X-Cosmos-UserId inyectado por el Gateway
    const cosmosUserId = req.headers['x-cosmos-userid'];
    const cosmosTenant = req.headers['x-cosmos-tenant'];
    
    console.log(`[MICROSERVICIO] 🔐 Trusted Header detectado: X-Cosmos-UserId = ${cosmosUserId}`);
    
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'success',
      timestamp: new Date().toISOString(),
      message: 'Respuesta desde el Microservicio Cosmos',
      auth_context: {
        received_user_id: cosmosUserId || 'ERROR: No se recibió UserID',
        received_tenant: cosmosTenant || 'ERROR: No se recibió Tenant'
      },
      debug_info: {
        method: req.method,
        path: req.url,
        all_headers: req.headers
      }
    }, null, 2));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Ruta no encontrada en la PoC' }));
  }
});

server.listen(PORT, () => {
  console.log(`Mock API escuchando en el puerto ${PORT}`);
});
