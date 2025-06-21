import { useContext } from "react"
import { ResetPasswordContext } from "../context/resetPasswordContext"

export const useResetPassword = () => {
  const context = useContext(ResetPasswordContext)
  if (context === undefined) {
    throw new Error("useResetPassword must be used within a ResetPasswordProvider")
  }
  return context
}
