import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={8000}
      hideProgressBar
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="light"
      toastStyle={{
        background: '#fff',
        color: '#101840',
        fontFamily: '"IBM Plex Sans", sans-serif',
        fontSize: '0.875rem',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    />
  );
}
