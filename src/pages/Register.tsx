import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../auth/store/authStore'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Leaf, AlertCircle, CheckCircle } from 'lucide-react'
import { themedToast } from '../lib/toast'

export default function Register() {
    const navigate = useNavigate()
    const { register, isLoading, error } = useAuthStore()
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    })

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
    const [registrationSuccess, setRegistrationSuccess] = useState(false)

    const validateForm = () => {
        const errors: Record<string, string> = {}

        // Username validation
        if (!formData.username) {
            errors.username = 'Username is required'
        } else if (formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters long'
        }

        // Email validation
        if (!formData.email) {
            errors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address'
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters long'
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password'
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match'
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form before submission
        if (!validateForm()) {
            return
        }

        try {
            const response = await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            })

            // Registration successful
            setRegistrationSuccess(true)
            themedToast.success('Registration successful! Please check your email to confirm your account.')
            
            // Reset form
            setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
            })
            setValidationErrors({})

            console.log('Registration response:', response)
        } catch (error: unknown) {
            // Error is handled by the auth store
            console.error('Registration error:', error)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value })
        
        // Clear validation error for this field when user starts typing
        if (validationErrors[field]) {
            setValidationErrors({ ...validationErrors, [field]: '' })
        }
    }

    // If registration was successful, show success message
    if (registrationSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/50">
                <div className="max-w-md w-full">
                    <div className="flex justify-center mb-6">
                        <div className="bg-gradient-to-r from-yellow-green to-steel-blue p-3 rounded-full shadow-steel-blue">
                            <Leaf className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    
                    <Card className="border shadow-lg">
                        <CardHeader className="space-y-1 text-center">
                            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-green-900 dark:text-green-100">
                                Registration Successful!
                            </CardTitle>
                            <CardDescription>
                                We've sent you a confirmation email. Please check your inbox and click the confirmation link to activate your account.
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                            <Alert className="border-green-200 dark:border-green-800">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <AlertDescription className="text-green-700 dark:text-green-300">
                                    A confirmation email has been sent to your email address.
                                    <br />
                                    If you don't see it, please check your spam folder or try resending the confirmation email.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                          <CardFooter className="flex justify-center border-t p-6">
                            <Button 
                                onClick={() => navigate('/login')}
                                className="w-full bg-gradient-to-r from-steel-blue to-yellow-green hover:opacity-90 text-white shadow-steel-blue hover:shadow-lg transition-all duration-200"
                            >
                                Go to Login
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
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-yellow-green to-steel-blue bg-clip-text text-transparent">
                            Create your account
                        </CardTitle>
                        <CardDescription className="text-center">
                            Sign up to get started with your account
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input 
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={formData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    disabled={isLoading}
                                    required
                                    className="focus:ring-yellow-green focus:border-yellow-green"
                                />
                                {validationErrors.username && (
                                    <p className="text-sm text-destructive">{validationErrors.username}</p>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    disabled={isLoading}
                                    required
                                    className="focus:ring-yellow-green focus:border-yellow-green"
                                />
                                {validationErrors.email && (
                                    <p className="text-sm text-destructive">{validationErrors.email}</p>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input 
                                    id="password"
                                    type="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    disabled={isLoading}
                                    required
                                    className="focus:ring-yellow-green focus:border-yellow-green"
                                />
                                {validationErrors.password && (
                                    <p className="text-sm text-destructive">{validationErrors.password}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Password must be at least 6 characters long
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input 
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    disabled={isLoading}
                                    required
                                    className="focus:ring-yellow-green focus:border-yellow-green"
                                />
                                {validationErrors.confirmPassword && (
                                    <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
                                )}
                            </div>
                            
                            <Button 
                                type="submit" 
                                className="w-full bg-gradient-to-r from-steel-blue to-yellow-green hover:opacity-90 text-white shadow-steel-blue hover:shadow-lg transition-all duration-200"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating account...' : 'Create account'}
                            </Button>
                        </form>
                    </CardContent>
                    
                    <CardFooter className="flex justify-center border-t p-6">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link 
                                to="/login" 
                                className="text-steel-blue hover:text-steel-blue/80 font-medium transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
