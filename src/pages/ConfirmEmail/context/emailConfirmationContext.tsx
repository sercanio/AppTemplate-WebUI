import { createContext, useState, useRef, useCallback, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { AuthService, type EmailConfirmationParams, type EmailConfirmationResult } from "../../../auth/services/authService"
import { useAuthStore } from "../../../auth/store/authStore"
import { themedToast } from "../../../lib/toast"

type EmailConfirmationState = {
  isProcessing: boolean
  result: EmailConfirmationResult | null
}

type EmailConfirmationContextType = {
  state: EmailConfirmationState
  confirmEmail: (params: EmailConfirmationParams) => Promise<void>
  resetState: () => void
}

const EmailConfirmationContext = createContext<EmailConfirmationContextType | undefined>(undefined)

export { EmailConfirmationContext }

export function EmailConfirmationProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { updateUser } = useAuthStore()

  const [state, setState] = useState<EmailConfirmationState>({
    isProcessing: false,
    result: null,
  })

  // Use useCallback to ensure the function reference remains stable
  const confirmEmail = useCallback(
    async (params: EmailConfirmationParams) => {
      // If already processing, don't start another request
      if (state.isProcessing) {
        console.log("[EmailConfirmation] Already processing, skipping request")
        return
      }

      console.log("[EmailConfirmation] Starting confirmation process", params)

      setState((prev) => ({
        ...prev,
        isProcessing: true,
      }))

      try {
        const result = await AuthService.confirmEmail(params)
        
        console.log("[EmailConfirmation] Confirmation result:", result)
        
        setState({
          isProcessing: false,
          result,
        })

        // If successful, show toast, refetch user data, and redirect to profile after 3 seconds
        if (result.success) {
          themedToast.success(result.message)
          
          // Refetch current user info to update emailConfirmed status
          try {
            console.log("[EmailConfirmation] Refetching user data after successful confirmation")
            const updatedUser = await AuthService.getCurrentUser()
            if (updatedUser) {
              updateUser(updatedUser)
              console.log("[EmailConfirmation] User data updated in store")
            }
          } catch (error) {
            console.warn("[EmailConfirmation] Failed to refetch user data:", error)
            // Don't fail the whole confirmation if user data fetch fails
          }
          
          // Clear any existing timeout
          if (redirectTimeoutRef.current) {
            clearTimeout(redirectTimeoutRef.current)
          }

          redirectTimeoutRef.current = setTimeout(() => {
            navigate("/profile")
          }, 3000)
        }
      } catch (error) {
        console.error("[EmailConfirmation] Unexpected error:", error)
        setState({
          isProcessing: false,
          result: {
            success: false,
            message: "An unexpected error occurred. Please try again.",
          },
        })
      }    },
    [navigate, state.isProcessing, updateUser],
  )

  const resetState = useCallback(() => {
    // Clear any existing timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
      redirectTimeoutRef.current = null
    }

    setState({
      isProcessing: false,
      result: null,
    })
  }, [])
  return (
    <EmailConfirmationContext.Provider value={{ state, confirmEmail, resetState }}>
      {children}
    </EmailConfirmationContext.Provider>
  )
}
