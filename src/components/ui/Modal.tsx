"use client";

import { useEffect, useId, useState, useTransition, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button, type ButtonSize, type ButtonVariant } from "./Button";
import { Icon } from "./Icon";

/** Modale en feuille (bas d'écran sur mobile, centrée sur grand écran). */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-overlay"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[90dvh] w-full max-w-content overflow-y-auto rounded-t-sheet bg-surface p-5 pb-safe shadow-floating sm:rounded-sheet"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-headline text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex size-8 items-center justify-center rounded-full bg-surface-muted text-ink-muted"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="pb-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/** Bouton qui demande confirmation avant une action irréversible (suppression…). */
export function ConfirmButton({
  children,
  title,
  description,
  confirmLabel = "Confirmer",
  onConfirm,
  variant = "ghost",
  size = "sm",
  ariaLabel,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)} aria-label={ariaLabel}>
        {children}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        {description ? <p className="mb-5 text-callout text-ink-muted">{description}</p> : null}
        <div className="flex flex-col gap-2">
          <Button
            variant="danger"
            size="lg"
            fullWidth
            pending={pending}
            onClick={() =>
              startTransition(async () => {
                await onConfirm();
                setOpen(false);
              })
            }
          >
            {confirmLabel}
          </Button>
          <Button variant="ghost" size="lg" fullWidth onClick={() => setOpen(false)}>
            Annuler
          </Button>
        </div>
      </Modal>
    </>
  );
}
