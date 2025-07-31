import { toast } from "sonner";

export const showToast = {
  error: (message: string, options?: { duration?: number }) => {
    toast.error(message, {
      duration: options?.duration || 5000,
    });
  },

  success: (message: string, options?: { duration?: number }) => {
    toast.success(message, {
      duration: options?.duration || 3000,
    });
  },

  info: (message: string, options?: { duration?: number }) => {
    toast.info(message, {
      duration: options?.duration || 4000,
    });
  },

  warning: (message: string, options?: { duration?: number }) => {
    toast.warning(message, {
      duration: options?.duration || 4000,
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },

  // Convenience method for API errors
  apiError: (error: unknown, fallbackMessage = "An error occurred") => {
    const message = error instanceof Error ? error.message : fallbackMessage;
    toast.error(message, {
      duration: 5000,
    });
  },
};

// Re-export the toast function for direct access if needed
export { toast };
