"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "./Icon";

type ToastTone = "success" | "error" | "info";
type ToastAction = { label: string; onClick: () => void };
type ToastItem = { id: number; message: string; tone: ToastTone; action?: ToastAction };

type ToastApi = {
  success: (message: string, action?: ToastAction) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const TONE_CLASSES: Record<ToastTone, string> = {
  success: "text-success",
  error: "text-danger",
  info: "text-primary",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (tone: ToastTone, message: string, action?: ToastAction) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-2), { id, tone, message, action }]);
      window.setTimeout(() => dismiss(id), action ? 6000 : 3500);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message, action) => show("success", message, action),
      error: (message) => show("error", message),
      info: (message) => show("info", message),
    }),
    [show],
  );

  return (
    <ToastContext value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 px-gutter"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className="pointer-events-auto flex w-full max-w-content items-center gap-3 rounded-card bg-surface px-4 py-3 shadow-floating"
          >
            <Icon
              name={toast.tone === "error" ? "alert" : "check"}
              size={20}
              className={`shrink-0 ${TONE_CLASSES[toast.tone]}`}
            />
            <p className="flex-1 text-callout text-ink">{toast.message}</p>
            {toast.action ? (
              <button
                type="button"
                className="shrink-0 text-callout font-semibold text-primary"
                onClick={() => {
                  toast.action?.onClick();
                  dismiss(toast.id);
                }}
              >
                {toast.action.label}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast doit être utilisé dans <ToastProvider>.");
  return api;
}
