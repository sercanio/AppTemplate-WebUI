import { useEffect, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowLeft, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription } from "../components/ui/alert"
import { EmailConfirmationProvider } from "./ConfirmEmail/context/emailConfirmationContext"
import { useEmailConfirmation } from "./ConfirmEmail/hooks/useEmailConfirmation"

const EMAIL_PARAM_NAME = "email"
const USER_ID_PARAM_NAME = "userId"
const CODE_PARAM_NAME = "code"

function ConfirmEmailContent() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const processingStartedRef = useRef(false)

  const { state, confirmEmail, resetState } = useEmailConfirmation()

  // Extract parameters from URL
  const userId = searchParams.get(USER_ID_PARAM_NAME)
  const code = searchParams.get(CODE_PARAM_NAME)
  const email = searchParams.get(EMAIL_PARAM_NAME)

  console.log("[ConfirmEmail] URL parameters:", { userId, code, email })

  // Check if we have required parameters
  const hasRequiredParams = userId && code
  const isEmailChange = Boolean(email)

  useEffect(() => {
    // Only proceed if we have required parameters and haven't started processing yet
    if (!hasRequiredParams || processingStartedRef.current) {
      console.log("[ConfirmEmail] Skipping confirmation - missing params or already processing", {
        hasRequiredParams,
        processingStarted: processingStartedRef.current,
      })
      return
    }

    console.log("[ConfirmEmail] Starting email confirmation process")
    processingStartedRef.current = true

    confirmEmail({
      userId: userId!,
      code: code!,
      email: email || undefined,
    })
  }, [hasRequiredParams, userId, code, email, confirmEmail])

  const handleRetry = () => {
    if (!hasRequiredParams) return

    console.log("[ConfirmEmail] Retrying email confirmation")
    resetState()
    processingStartedRef.current = false

    // Small delay to ensure state is reset
    setTimeout(() => {
      confirmEmail({
        userId: userId!,
        code: code!,
        email: email || undefined,
      })
    }, 100)
  }

  const handleGoToLogin = () => {
    navigate("/login")
  }

  const handleGoToProfile = () => {
    navigate("/profile")
  }

  // If missing required parameters
  if (!hasRequiredParams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">Invalid Confirmation Link</CardTitle>
            <CardDescription>
              The email confirmation link appears to be invalid or incomplete.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please check that you've clicked the correct link from your email, or request a new confirmation email.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-2">
              <Button onClick={handleGoToLogin} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If processing
  if (state.isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
            <CardTitle className="text-xl">Confirming Your Email</CardTitle>
            <CardDescription>
              {isEmailChange
                ? "We're confirming your email address change..."
                : "We're confirming your email address..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-sm text-muted-foreground">
              Please wait while we process your request.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If we have a result
  if (state.result) {
    const { success, message } = state.result

    if (success) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl text-green-900 dark:text-green-100">
                Email Confirmed!
              </CardTitle>
              <CardDescription>
                {message || (isEmailChange 
                  ? "Your email address has been successfully updated."
                  : "Your email address has been successfully confirmed.")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  You will be redirected to your profile in a few seconds...
                </AlertDescription>
              </Alert>
              <div className="flex flex-col gap-2">
                <Button onClick={handleGoToProfile} className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Go to Profile
                </Button>
                <Button variant="outline" onClick={handleGoToLogin} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    } else {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Confirmation Failed</CardTitle>
              <CardDescription>
                {isEmailChange 
                  ? "We couldn't confirm your email address change."
                  : "We couldn't confirm your email address."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {message || "The confirmation link may be invalid or expired."}
                </AlertDescription>
              </Alert>
              <div className="flex flex-col gap-2">
                <Button onClick={handleRetry} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={handleGoToLogin} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Mail className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Email Confirmation</CardTitle>
          <CardDescription>
            Preparing to confirm your email address...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default function ConfirmEmail() {
  return (
    <EmailConfirmationProvider>
      <ConfirmEmailContent />
    </EmailConfirmationProvider>
  )
}
