import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../auth/store/authStore'
import { TwoFactorLogin } from '../components/TwoFactorLogin'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Checkbox } from "../components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Leaf, AlertCircle } from 'lucide-react'

export default function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login, requiresTwoFactor, isLoading, error } = useAuthStore()
    
    const [formData, setFormData] = useState({
        loginIdentifier: '',
        password: '',
        rememberMe: false,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await login(
                formData.loginIdentifier,
                formData.password,
                formData.rememberMe
            )
            
            // If 2FA is not required, redirect immediately
            if (!requiresTwoFactor) {
                const from = location.state?.from?.pathname || '/'
                navigate(from, { replace: true })
            }
        } catch (err: any) {
            // Error is handled by the auth store
            console.error('Login error:', err)
        }
    }

    const handleBackToLogin = () => {
        useAuthStore.setState({ requiresTwoFactor: false, error: null });
        setFormData({ loginIdentifier: '', password: '', rememberMe: false });
    };

    // If 2FA is required, show the 2FA component
    if (requiresTwoFactor) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/50">
                <div className="max-w-md w-full">
                    <div className="flex justify-center mb-6">
                        <div className="bg-gradient-to-r from-yellow-green to-steel-blue p-3 rounded-full shadow-steel-blue">
                            <Leaf className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    
                    <TwoFactorLogin onBack={handleBackToLogin} />
                </div>
            </div>
        );
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
                            Sign in to your account
                        </CardTitle>
                        <CardDescription className="text-center">
                            Enter your credentials to access your account
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
                                <Label htmlFor="loginIdentifier">Username or Email</Label>
                                <Input 
                                    id="loginIdentifier"
                                    type="text"
                                    placeholder="Enter your username or email"
                                    value={formData.loginIdentifier}
                                    onChange={(e) => setFormData({ ...formData, loginIdentifier: e.target.value })}
                                    disabled={isLoading}
                                    required
                                    className="focus:ring-yellow-green focus:border-yellow-green"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link 
                                        to="/auth/forgot-password" 
                                        className="text-sm text-steel-blue hover:text-steel-blue/80 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input 
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    disabled={isLoading}
                                    required
                                    className="focus:ring-yellow-green focus:border-yellow-green"
                                />
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="remember-me" 
                                    checked={formData.rememberMe}
                                    onCheckedChange={(checked) => 
                                        setFormData({ ...formData, rememberMe: checked as boolean })
                                    }
                                    disabled={isLoading}
                                />
                                <Label 
                                    htmlFor="remember-me" 
                                    className="text-sm text-muted-foreground cursor-pointer"
                                >
                                    Remember me
                                </Label>
                            </div>
                            
                            <Button 
                                type="submit" 
                                className="w-full bg-gradient-to-r from-steel-blue to-yellow-green hover:opacity-90 text-white shadow-steel-blue hover:shadow-lg transition-all duration-200"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>
                    </CardContent>
                    
                    <CardFooter className="flex justify-center border-t p-6">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link 
                                to="/auth/register" 
                                className="text-steel-blue hover:text-steel-blue/80 font-medium transition-colors"
                            >
                                Create account
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
