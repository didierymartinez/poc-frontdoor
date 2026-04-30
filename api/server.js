const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Configurar CORS básico por si prueban desde navegador
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Solo respondemos a la ruta /api/data
  if (req.url === '/api/data') {
    console.log(`\n[MICROSERVICIO] 📥 Petición recibida en: ${req.url}`);
    
    // Aquí el microservicio real leería X-Cosmos-UserId
    const cosmosUserId = req.headers['x-cosmos-userid'];
    console.log(`[MICROSERVICIO] 🔐 Trusted Header detectado: X-Cosmos-UserId = ${cosmosUserId}`);
    
    res.writeHead(200);
    res.end(JSON.stringify({
      message: 'Petición procesada exitosamente por el Microservicio',
      trusted_user_id_received: cosmosUserId || 'Ninguno (Fallo de seguridad)',
      all_headers: req.headers
    }, null, 2));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Mock API escuchando en el puerto ${PORT}`);
});
