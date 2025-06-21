import { createContext, useState, useRef, useCallback, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { AuthService, type ResetPasswordParams, type ResetPasswordResult } from "../../../auth/services/authService"
import { themedToast } from "../../../lib/toast"

type ResetPasswordState = {
  isProcessing: boolean
  result: ResetPasswordResult | null
}

type ResetPasswordContextType = {
  state: ResetPasswordState
  resetPassword: (params: ResetPasswordParams) => Promise<void>
  resetState: () => void
}

const ResetPasswordContext = createContext<ResetPasswordContextType | undefined>(undefined)

export { ResetPasswordContext }

export function ResetPasswordProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [state, setState] = useState<ResetPasswordState>({
    isProcessing: false,
    result: null,
  })

  // Use useCallback to ensure the function reference remains stable
  const resetPassword = useCallback(
    async (params: ResetPasswordParams) => {
      // If already processing, don't start another request
      if (state.isProcessing) {
        console.log("[ResetPassword] Already processing, skipping request")
        return
      }

      console.log("[ResetPassword] Starting password reset process")

      setState((prev) => ({
        ...prev,
        isProcessing: true,
      }))

      try {
        const result = await AuthService.resetPassword(params)
        
        console.log("[ResetPassword] Reset result:", result)
        
        setState({
          isProcessing: false,
          result,
        })

        // If successful, show toast and redirect to login after 3 seconds
        if (result.success) {
          themedToast.success(result.message)
          
          // Clear any existing timeout
          if (redirectTimeoutRef.current) {
            clearTimeout(redirectTimeoutRef.current)
          }

          redirectTimeoutRef.current = setTimeout(() => {
            navigate("/login")
          }, 3000)
        }
      } catch (error) {
        console.error("[ResetPassword] Unexpected error:", error)
        setState({
          isProcessing: false,
          result: {
            success: false,
            message: "An unexpected error occurred. Please try again.",
          },
        })
      }
    },
    [navigate, state.isProcessing],
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
    <ResetPasswordContext.Provider value={{ state, resetPassword, resetState }}>
      {children}
    </ResetPasswordContext.Provider>
  )
}
