import { useState } from 'react'
import './App.css'

function App() {
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)

  const callApi = async () => {
    setLoading(true);
    setResponse(null);

    try {
      // LLAMADA TRANSPARENTE: No hay URL de túnel, el navegador cree que el API está en el mismo dominio
      const res = await fetch('/api/data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP Error: ${res.status}`);
      }
      
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ 
        error: 'Fallo en la comunicación transparente',
        details: err.message,
        tip: 'Asegúrate de haber configurado TUNNEL_URL en el Dashboard de Cloudflare Pages y que tu túnel local esté corriendo.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Cosmos Cloudflare PoC</h1>
      <div className="status-badge" style={{ background: '#0052cc', padding: '5px 15px', borderRadius: '20px', display: 'inline-block', marginBottom: '20px' }}>
        🚀 Arquitectura Cosmos: Single Domain (Transparente)
      </div>

      <div className="card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h3>Prueba de Integración Real</h3>
        <p>Al presionar el botón, la app llamará a <code>/api/data</code>. Cloudflare interceptará la petición y la mandará a tu túnel de forma invisible.</p>
        
        <button 
          onClick={callApi} 
          disabled={loading}
          style={{ width: '100%', padding: '15px', background: loading ? '#ccc' : '#f6821f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1em' }}
        >
          {loading ? 'Procesando en el Edge...' : '📡 Llamar Microservicio (Modo Transparente)'}
        </button>
      </div>

      {response && (
        <div style={{ marginTop: '30px', textAlign: 'left', maxWidth: '800px', margin: '30px auto 0' }}>
          <h4>Respuesta del Microservicio:</h4>
          <div style={{ background: '#1e1e1e', color: '#32cd32', padding: '20px', borderRadius: '8px', overflowX: 'auto', border: '1px solid #333' }}>
            <pre style={{ margin: 0, fontSize: '14px' }}>{JSON.stringify(response, null, 2)}</pre>
          </div>
          
          {response.auth_context && (
            <div style={{ marginTop: '15px', background: '#d4edda', color: '#155724', padding: '15px', borderRadius: '6px' }}>
              ✅ <strong>¡Éxito Total!</strong> Tráfico enrutado transparentemente. UserID recibido: <strong>{response.auth_context.received_user_id}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
