import { toast } from 'sonner';

type ConfirmToastOptions = {
  confirmLabel?: string;
  cancelLabel?: string;
};

export const confirmToast = (
  message: string,
  options: ConfirmToastOptions = {}
): Promise<boolean> => {
  return new Promise((resolve) => {
    let resolved = false;
    const confirmLabel = options.confirmLabel || 'Confirmar';
    const cancelLabel = options.cancelLabel || 'Cancelar';

    const toastId = toast(message, {
      duration: Infinity,
      action: {
        label: confirmLabel,
        onClick: () => {
          if (resolved) return;
          resolved = true;
          resolve(true);
          toast.dismiss(toastId);
        },
      },
      cancel: {
        label: cancelLabel,
        onClick: () => {
          if (resolved) return;
          resolved = true;
          resolve(false);
          toast.dismiss(toastId);
        },
      },
      onDismiss: () => {
        if (resolved) return;
        resolved = true;
        resolve(false);
      },
    });
  });
};
