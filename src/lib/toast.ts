import { toast } from "sonner"

export const themedToast = {
  success: (message: string, options?: Record<string, unknown>) => {
    return toast.success(message, {
      ...options,
      style: {
        border: '1px solid var(--color-yellow-green)',
        borderLeft: '4px solid var(--color-yellow-green)',
        ...((options?.style as object) ?? {}),
      }
    })
  },
  
  error: (message: string, options?: Record<string, unknown>) => {
    return toast.error(message, {
      ...options,
      style: {
        border: '1px solid var(--color-bittersweet)',
        borderLeft: '4px solid var(--color-bittersweet)',
        ...((options?.style as object) ?? {}),
      }
    })
  },
  
  warning: (message: string, options?: Record<string, unknown>) => {
    return toast.warning(message, {
      ...options,
      style: {
        border: '1px solid var(--color-sunglow)',
        borderLeft: '4px solid var(--color-sunglow)',
        ...((options?.style as object) ?? {}),
      }
    })
  },
  
  info: (message: string, options?: Record<string, unknown>) => {
    return toast.info(message, {
      ...options,
      style: {
        border: '1px solid var(--color-steel-blue)',
        borderLeft: '4px solid var(--color-steel-blue)',
        ...((options?.style as object) ?? {}),
      }
    })
  },

  // Utility method for showing registration success with email confirmation reminder
  registrationSuccess: (message: string = "Registration successful") => {
    return toast.success(message, {
      description: "Please check your email to confirm your account",
      duration: 6000,
      style: {
        border: '1px solid var(--color-yellow-green)',
        borderLeft: '4px solid var(--color-yellow-green)',
      },
      action: {
        label: "Resend Email",
        onClick: () => {
          // This could trigger a resend email confirmation function
          toast.info("Feature coming soon", {
            description: "Email resend functionality will be available soon"
          });
        }
      }
    })
  }
}
