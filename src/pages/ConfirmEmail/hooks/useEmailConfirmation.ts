import { useContext } from "react"
import { EmailConfirmationContext } from "../context/emailConfirmationContext"

export const useEmailConfirmation = () => {
  const context = useContext(EmailConfirmationContext)
  if (context === undefined) {
    throw new Error("useEmailConfirmation must be used within an EmailConfirmationProvider")
  }
  return context
}
