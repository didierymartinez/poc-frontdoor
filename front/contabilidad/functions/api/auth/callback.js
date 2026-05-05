export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('No code provided', { status: 400 });
  }

  // 1. Intercambiar el código por el perfil del usuario en el lado del servidor (Cloudflare)
  // Usamos fetch directo para no depender de librerías en la PoC
  const workosResponse = await fetch('https://api.workos.com/user_management/authenticate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.WORKOS_CLIENT_ID || 'client_01KFH6W3J1RM7X9566904X2CZ3',
      client_secret: env.WORKOS_API_KEY, // DEBES CONFIGURAR ESTO EN CLOUDFLARE
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!workosResponse.ok) {
    const error = await workosResponse.text();
    return new Response(`WorkOS Auth Failed: ${error}`, { status: 500 });
  }

  const { user, access_token } = await workosResponse.json();

  // 2. Crear la sesión. El SDK de AuthKit espera una cookie o una redirección con el token.
  // En una PoC simple, podemos redirigir al home y que el frontend maneje el estado,
  // pero el SDK oficial prefiere manejar cookies. 
  
  // Por ahora, para desbloquear la PoC, redirigimos al home pasando el token
  // o configurando una cookie básica.
  
  const response = new Response(null, {
    status: 302,
    headers: {
      'Location': '/',
      'Set-Cookie': `wos_session=${access_token}; Path=/; HttpOnly; Secure; SameSite=Lax`,
    },
  });

  return response;
}
