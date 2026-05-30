import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);

  const icons = { success: '✅', error: '❌', info: 'ℹ️', cart: '🛒', heart: '❤️' };
  const grads = {
    success: 'linear-gradient(135deg, #10b981, #059669)',
    error: 'linear-gradient(135deg, #ef4444, #dc2626)',
    info: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    cart: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    heart: 'linear-gradient(135deg, #ec4899, #db2777)',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <style>{`@keyframes toastIn { from { opacity:0; transform: translateX(120%);} to {opacity:1; transform: translateX(0);} }`}</style>
      <div style={{ position: 'fixed', top: 80, right: 16, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 'calc(100vw - 32px)' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ background: grads[t.type] || grads.success, color: '#fff', padding: '13px 18px', borderRadius: 14, fontWeight: 700, fontSize: 14, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 10, animation: 'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)', minWidth: 200 }}>
            <span style={{ fontSize: 18 }}>{icons[t.type] || '✅'}</span>{t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
