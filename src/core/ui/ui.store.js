import { create } from 'zustand';

export const useUiStore = create((set, get) => ({
  sidebarCollapsed: false,
  language: 'EN',
  toasts: [],
  toggleSidebar: () =>
    set((state) => ({
      sidebarCollapsed: !state.sidebarCollapsed
    })),
  setSidebarCollapsed: (sidebarCollapsed) =>
    set({
      sidebarCollapsed: Boolean(sidebarCollapsed)
    }),
  setLanguage: (language) =>
    set({
      language
    }),
  addToast: ({ id, type = 'info', title = '', message = '', duration = 4000 } = {}) => {
    const toastId = id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9));
    const newToast = { id: toastId, type, title, message, duration };

    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(toastId);
      }, duration);
    }

    return toastId;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }))
}));

export default useUiStore;
