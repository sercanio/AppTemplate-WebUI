import { toast } from "sonner"

export const themedToast = {
  success: (message: string, options?: any) => {
    return toast.success(message, {
      ...options,
      style: {
        border: '1px solid var(--color-yellow-green)',
        borderLeft: '4px solid var(--color-yellow-green)',
      }
    })
  },
  
  error: (message: string, options?: any) => {
    return toast.error(message, {
      ...options,
      style: {
        border: '1px solid var(--color-bittersweet)',
        borderLeft: '4px solid var(--color-bittersweet)',
      }
    })
  },
  
  warning: (message: string, options?: any) => {
    return toast.warning(message, {
      ...options,
      style: {
        border: '1px solid var(--color-sunglow)',
        borderLeft: '4px solid var(--color-sunglow)',
      }
    })
  },
  
  info: (message: string, options?: any) => {
    return toast.info(message, {
      ...options,
      style: {
        border: '1px solid var(--color-steel-blue)',
        borderLeft: '4px solid var(--color-steel-blue)',
      }
    })
  }
}
