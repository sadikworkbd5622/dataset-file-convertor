import { useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, hiding: false }]);
    
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, hiding: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 4000);
  };

  return { toasts, showToast };
}

export default function ToastContainer({ toasts }) {
  const icons = { success: "✅", error: "❌", info: "ℹ️" };

  return (
    <div className="toast-container" id="toastContainer">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.type} ${toast.hiding ? "hiding" : ""}`}>
          <span className="toast__icon">{icons[toast.type]}</span>
          <span className="toast__message">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
