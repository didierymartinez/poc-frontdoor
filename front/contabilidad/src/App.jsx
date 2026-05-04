import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('cosmos_token') || '')

  // Configuración de WorkOS
  const WORKOS_CLIENT_ID = 'client_01KFH6W3J1RM7X9566904X2CZ3'
  const LOGIN_URL = `https://api.workos.com/sso/authorize?client_id=${WORKOS_CLIENT_ID}&response_type=code&redirect_uri=${window.location.origin}/callback`

  useEffect(() => {
    // Si no hay token, podríamos redirigir automáticamente
    // Para la PoC, dejaremos el botón para que el usuario pueda "simular" pegando un token
    // Pero si quieres que sea automático, descomenta la línea de abajo:
    // if (!token) window.location.href = LOGIN_URL;
  }, [token]);

  const handleLogin = () => {
    // En una app real, esto redirigiría a WorkOS
    // Para esta PoC, permitiremos al usuario pegar su token para probar el Gateway
    const manualToken = prompt('Introduce tu JWT de WorkOS (o cualquier string para probar el rechazo del Gateway):');
    if (manualToken) {
      setToken(manualToken);
      localStorage.setItem('cosmos_token', manualToken);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('cosmos_token');
    setResponse(null);
  };

  const callApi = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        throw new Error('No autorizado. El Gateway rechazó la petición porque el Token es inválido o no existe.');
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP Error: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({
        error: 'Error de Seguridad / Comunicación',
        details: err.message,
        tip: token ? 'El Gateway de .NET probablemente rechazó tu token por ser inválido.' : 'No has iniciado sesión.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Cosmos Cloudflare PoC v2.1 (🚀)</h1>
      <div className="status-badge" style={{ background: token ? '#28a745' : '#dc3545', padding: '5px 15px', borderRadius: '20px', display: 'inline-block', marginBottom: '20px', color: 'white' }}>
        {token ? '🟢 Sesión Activa' : '🔴 Sin Sesión'}
      </div>

      <div className="card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h3>Integración End-to-End Cosmos</h3>
        <p style={{ fontSize: '0.9em', color: '#666' }}>
          Flujo: <strong>React</strong> → <strong>Cloudflare</strong> → <strong>Túnel</strong> → <strong>.NET Gateway (YARP)</strong> → <strong>API</strong>
        </p>

        {!token ? (
          <button
            onClick={handleLogin}
            style={{ width: '100%', padding: '15px', background: '#0052cc', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🔐 Iniciar Sesión con WorkOS
          </button>
        ) : (
          <>
            <button
              onClick={callApi}
              disabled={loading}
              style={{ width: '100%', padding: '15px', background: loading ? '#ccc' : '#f6821f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1em', marginBottom: '10px' }}
            >
              {loading ? 'Validando en Gateway...' : '📡 Llamar API Segura'}
            </button>
            <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}>
              Cerrar sesión
            </button>
          </>
        )}
      </div>

      {response && (
        <div style={{ marginTop: '30px', textAlign: 'left', maxWidth: '800px', margin: '30px auto 0' }}>
          <h4>Respuesta del Ecosistema:</h4>
          <div style={{ background: '#1e1e1e', color: response.error ? '#ff6b6b' : '#32cd32', padding: '20px', borderRadius: '8px', overflowX: 'auto', border: '1px solid #333' }}>
            <pre style={{ margin: 0, fontSize: '14px' }}>{JSON.stringify(response, null, 2)}</pre>
          </div>
          
          {!response.error && (
            <div style={{ marginTop: '15px', background: '#d4edda', color: '#155724', padding: '15px', borderRadius: '6px' }}>
              ✅ <strong>Validación Exitosa:</strong> El Gateway de .NET validó tu JWT e inyectó tu identidad de forma segura.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
