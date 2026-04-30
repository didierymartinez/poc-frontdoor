export async function onRequest(context) {
  // 1. Obtenemos la URL del túnel desde las variables de entorno de Cloudflare
  // Debes configurar 'TUNNEL_URL' en el Dashboard de Cloudflare Pages (Settings -> Environment Variables)
  const tunnelUrl = context.env.TUNNEL_URL;

  if (!tunnelUrl) {
    return new Response(JSON.stringify({ 
      error: "Variable TUNNEL_URL no configurada en Cloudflare",
      step: "Debes ir a Settings -> Environment Variables en tu proyecto de Cloudflare Pages y añadir TUNNEL_URL con la URL de tu cloudflared"
    }), { status: 500 });
  }

  // 2. Construimos la URL de destino (hacia tu máquina local vía túnel)
  const url = new URL(context.request.url);
  const targetUrl = `${tunnelUrl.endsWith('/') ? tunnelUrl.slice(0, -1) : tunnelUrl}${url.pathname}${url.search}`;

  // 3. Reenviamos la petición al túnel
  try {
    const response = await fetch(targetUrl, {
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.body
    });

    // 4. Devolvemos la respuesta del microservicio al navegador
    return response;
  } catch (err) {
    return new Response(JSON.stringify({ 
      error: "Error conectando con el túnel", 
      details: err.message 
    }), { status: 502 });
  }
}
