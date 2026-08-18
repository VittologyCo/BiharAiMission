import React, { createContext, useContext } from 'react';
import { ToastContainer, toast as reactToastify } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const toast = {
    show: (msg, type = 'info') => reactToastify(msg, { type }),
    success: (msg) => reactToastify.success(msg),
    error: (msg) => reactToastify.error(msg),
    warning: (msg) => reactToastify.warning(msg),
    info: (msg) => reactToastify.info(msg),
    dismiss: () => reactToastify.dismiss(),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 999999 }}
      />
      <style>{`
        .Toastify__toast-container {
          width: 340px !important;
          padding: 0 !important;
        }
        .Toastify__toast {
          border-radius: 8px !important;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12) !important;
          border: 1px solid var(--color-line, #E2D7C3) !important;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #111827 !important;
          padding: 10px 32px 10px 14px !important;
          min-height: 44px !important;
          margin-bottom: 8px !important;
          position: relative !important;
        }
        .Toastify__toast--success {
          border-left: 4px solid #10B981 !important;
          background: #EFEAE5 !important;
        }
        .Toastify__toast--error {
          border-left: 4px solid #EF4444 !important;
          background: #EFEAE5 !important;
        }
        .Toastify__toast--warning {
          border-left: 4px solid #F59E0B !important;
          background: #EFEAE5 !important;
        }
        .Toastify__toast--info {
          border-left: 4px solid var(--color-terracotta-500, #C1552C) !important;
          background: #EFEAE5 !important;
        }
        .Toastify__close-button {
          position: absolute !important;
          top: 6px !important;
          right: 6px !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
          padding: 0 !important;
          margin: 0 !important;
          width: 20px !important;
          height: 20px !important;
          min-width: 20px !important;
          min-height: 20px !important;
          border-radius: 50% !important;
          color: #9CA3AF !important;
          opacity: 0.7 !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s ease !important;
        }
        .Toastify__close-button:hover {
          background: rgba(24, 21, 18, 0.1) !important;
          color: #111827 !important;
          opacity: 1 !important;
        }
        .Toastify__close-button > svg {
          width: 12px !important;
          height: 12px !important;
          fill: currentColor !important;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      show: (msg) => reactToastify(msg),
      success: (msg) => reactToastify.success(msg),
      error: (msg) => reactToastify.error(msg),
      warning: (msg) => reactToastify.warning(msg),
      info: (msg) => reactToastify.info(msg),
      dismiss: () => reactToastify.dismiss(),
    };
  }
  return context;
};

export { reactToastify as toast };
