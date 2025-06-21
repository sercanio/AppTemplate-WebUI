import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2, CheckCircle2, AlertCircle, Mail, Leaf } from "lucide-react"
import { AuthService, type ForgotPasswordParams } from "../auth/services/authService"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setResult(null)

    try {
      const params: ForgotPasswordParams = { email }
      const response = await AuthService.forgotPassword(params)

      setResult(response)
    } catch (error) {
      console.error('Forgot password error:', error)
      setResult({
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/50">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-yellow-green to-steel-blue p-3 rounded-full shadow-steel-blue">
            <Leaf className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <Card className="border shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-gradient-to-r from-steel-blue to-yellow-green w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-green to-steel-blue bg-clip-text text-transparent">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-center">
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {result && (
              <Alert className={result.success ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800" : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800"}>
                {result.success ? <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" /> : <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />}
                <AlertDescription className={result.success ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}>
                  {result.message}
                </AlertDescription>
              </Alert>
            )}

            {!result && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isProcessing}
                    required
                    className="border-border focus:border-yellow-green focus:ring-yellow-green"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-steel-blue to-yellow-green hover:opacity-90 text-white shadow-steel-blue hover:shadow-lg transition-all duration-200"
                  disabled={isProcessing || !email.trim()}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex justify-center border-t p-6">
            <div className="text-sm text-center space-y-2">
              <p className="text-muted-foreground">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-steel-blue hover:text-steel-blue/80 font-medium transition-colors underline"
                >
                  Sign In
                </Link>
              </p>
              {result && result.success && (
                <p className="text-muted-foreground">
                  Didn't receive the email?{" "}
                  <button
                    onClick={() => setResult(null)}
                    className="text-steel-blue hover:text-steel-blue/80 font-medium transition-colors underline"
                  >
                    Try Again
                  </button>
                </p>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
