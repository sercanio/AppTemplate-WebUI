import { useEffect, useRef, useState } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2, CheckCircle2, AlertCircle, KeyRound, ArrowLeft, RefreshCw, Eye, EyeOff, Leaf } from "lucide-react"
import { ResetPasswordProvider } from "./ResetPassword/context/resetPasswordContext"
import { useResetPassword } from "./ResetPassword/hooks/useResetPassword"

// Password requirement validators
const hasMinLength = (password: string) => password.length >= 8
const hasUppercase = (password: string) => /[A-Z]/.test(password)
const hasLowercase = (password: string) => /[a-z]/.test(password)
const hasDigit = (password: string) => /\d/.test(password)
const hasSpecialChar = (password: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password)
const passwordsMatch = (password: string, confirmPassword: string) => 
  password === confirmPassword && password !== ""

function ResetPasswordContent() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { state, resetPassword } = useResetPassword()
  const { isProcessing, result } = state
  const [hasMissingParams, setHasMissingParams] = useState<boolean>(false)
  
  // Add a ref to track if reset has been attempted
  const resetAttemptedRef = useRef(false)

  // Add state to store form data and validation
  const [formData, setFormData] = useState({
    code: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [validations, setValidations] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    specialChar: false,
    passwordsMatch: false,
    validEmail: false
  })

  const isValidEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(String(email).toLowerCase())
  }

  // Update password validations when password changes
  useEffect(() => {
    setValidations({
      minLength: hasMinLength(formData.password),
      uppercase: hasUppercase(formData.password),
      lowercase: hasLowercase(formData.password),
      digit: hasDigit(formData.password),
      specialChar: hasSpecialChar(formData.password),
      passwordsMatch: passwordsMatch(formData.password, formData.confirmPassword),
      validEmail: isValidEmail(formData.email)
    })
  }, [formData.password, formData.confirmPassword, formData.email])

  // Check URL parameters
  useEffect(() => {
    const code = searchParams.get("code")
    if (code) {
      setHasMissingParams(false)
      setFormData(prev => ({
        ...prev,
        code
      }))
    } else {
      setHasMissingParams(true)
    }   
  }, [searchParams])

  const isFormValid = () => {
    return (
      validations.minLength &&
      validations.uppercase &&
      validations.lowercase &&
      validations.digit &&
      validations.specialChar &&
      validations.passwordsMatch &&
      validations.validEmail 
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid()) {
      return
    }
    
    resetAttemptedRef.current = true
    resetPassword({
      email: formData.email,
      code: formData.code,
      password: formData.password
    })
  }

  const handleRetry = () => {
    resetAttemptedRef.current = true
    resetPassword({
      email: formData.email,
      code: formData.code,
      password: formData.password
    })
  }

  if (hasMissingParams) {
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
                <KeyRound className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
              <CardDescription>The password reset link appears to be invalid or has expired.</CardDescription>
            </CardHeader>
            
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please request a new password reset link from the forgot password page.
                </AlertDescription>
              </Alert>
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <Button
                onClick={() => navigate("/forgot-password")}
                className="bg-gradient-to-r from-steel-blue to-yellow-green hover:opacity-90 text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Request New Reset Link
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
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
              <KeyRound className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-yellow-green to-steel-blue bg-clip-text text-transparent">
              Reset Your Password
            </CardTitle>
            <CardDescription>Enter your email and new password to reset your account.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isProcessing && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-steel-blue mb-4" />
                <p className="text-center text-muted-foreground">
                  Resetting your password...
                </p>
              </div>
            )}

            {result && result.success && (
              <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  {result.message}
                  <br />
                  <span className="text-sm">You will be redirected to the login page in a few seconds...</span>
                </AlertDescription>
              </Alert>
            )}

            {result && !result.success && (
              <>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>

                <div className="flex justify-center mt-4">
                  <Button onClick={handleRetry} variant="outline" className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              </>
            )}

            {!isProcessing && !result && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-border focus:border-yellow-green focus:ring-yellow-green"
                    required
                  />
                  {formData.email && !validations.validEmail && (
                    <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => setPasswordFocused(true)}
                      className="pr-10 border-border focus:border-yellow-green focus:ring-yellow-green"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pr-10 border-border focus:border-yellow-green focus:ring-yellow-green"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {(passwordFocused || formData.password) && (
                  <div className="space-y-2 p-3 bg-muted/50 rounded-md">
                    <p className="text-sm font-medium">Password Requirements:</p>
                    <ul className="space-y-1 text-sm">
                      <li className={`flex items-center ${validations.minLength ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                        {validations.minLength ? <CheckCircle2 className="h-3 w-3 mr-2" /> : <AlertCircle className="h-3 w-3 mr-2" />}
                        At least 8 characters
                      </li>
                      <li className={`flex items-center ${validations.uppercase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                        {validations.uppercase ? <CheckCircle2 className="h-3 w-3 mr-2" /> : <AlertCircle className="h-3 w-3 mr-2" />}
                        One uppercase letter
                      </li>
                      <li className={`flex items-center ${validations.lowercase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                        {validations.lowercase ? <CheckCircle2 className="h-3 w-3 mr-2" /> : <AlertCircle className="h-3 w-3 mr-2" />}
                        One lowercase letter
                      </li>
                      <li className={`flex items-center ${validations.digit ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                        {validations.digit ? <CheckCircle2 className="h-3 w-3 mr-2" /> : <AlertCircle className="h-3 w-3 mr-2" />}
                        One number
                      </li>
                      <li className={`flex items-center ${validations.specialChar ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                        {validations.specialChar ? <CheckCircle2 className="h-3 w-3 mr-2" /> : <AlertCircle className="h-3 w-3 mr-2" />}
                        One special character
                      </li>
                    </ul>
                  </div>
                )}

                {formData.confirmPassword && (
                  <div className={`flex items-center ${validations.passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'} text-sm`}>
                    {validations.passwordsMatch ? 
                      <CheckCircle2 className="h-4 w-4 mr-2" /> : 
                      <AlertCircle className="h-4 w-4 mr-2" />
                    }
                    {validations.passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-steel-blue to-yellow-green hover:opacity-90 text-white shadow-steel-blue hover:shadow-lg transition-all duration-200"
                  disabled={!isFormValid()}
                >
                  Reset Password
                </Button>
              </form>
            )}
          </CardContent>

          {!result && (
            <CardFooter className="flex justify-center border-t p-4">
              <div className="text-sm text-center">
                <p className="text-muted-foreground mb-2">Remember your password?</p>
                <Link 
                  to="/login"
                  className="text-steel-blue hover:text-steel-blue/80 font-medium underline"
                >
                  Return to Login
                </Link>
              </div>
            </CardFooter>
          )}

          {result && result.success && (
            <CardFooter className="flex justify-center border-t p-4">
              <Button
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-steel-blue to-yellow-green hover:opacity-90 text-white"
              >
                Go to Login
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}

export default function ResetPassword() {
  return (
    <ResetPasswordProvider>
      <ResetPasswordContent />
    </ResetPasswordProvider>
  )
}
