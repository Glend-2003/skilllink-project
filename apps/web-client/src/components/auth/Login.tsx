import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onViewChange: (view: string) => void;
}

export function Login({ onViewChange }: LoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      const userRole = await login(email, password);
      toast.success('¡Bienvenido de nuevo!');

      switch (userRole.toLowerCase()) {
        case 'admin':
          onViewChange('admin-dashboard');
          break;
        case 'provider':
          onViewChange('provider-dashboard');
          break;
        case 'client':
        default:
          onViewChange('home');
          break;
      }
    } catch (error: any) {
      console.error("Error en login:", error);
      const message = error.response?.data?.message || 'Correo o contraseña incorrectos';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.success(`Iniciando sesión con ${provider}...`);
    setTimeout(() => {
      onViewChange('home');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-green-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SkillLink</h1>
          <p className="text-blue-100">Conecta con los mejores profesionales</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-slate-900">Iniciar sesión</CardTitle>
            <CardDescription className="text-slate-600">
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 pr-10 h-11 border-slate-200 focus:border-gray-100 focus:ring-1 focus:ring-gray-200 rounded-lg text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2 ">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">Contraseña</Label>
                <div className="relative ">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 border-slate-200 focus:border-gray-100 focus:ring-1 focus:ring-gray-200 rounded-lg text-slate-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 !bg-transparent !border-none p-0 flex items-center justify-center !outline-none shadow-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-900"
                  >
                    Recordarme
                  </label>
                </div>
                <Button
                  variant="link"
                  className="px-0 text-blue-600 hover:text-blue-700 hover:underline !bg-transparent !border-none shadow-none"
                  type="button"
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r text-white from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
            </form>

            <div className="relative my-6">
              <Separator className="!bg-slate-300"/>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-slate-500">
                O continúa con
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => handleSocialLogin('Google')}
              >
                <svg className="w-5 h-5 mr-2 " viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => handleSocialLogin('Facebook')}
              >
                <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-slate-600">¿No tienes una cuenta? </span>
              <Button
                variant="link"
                className="px-0 text-blue-600 hover:text-blue-700 hover:underline font-semibold !bg-transparent !border-none shadow-none"
                onClick={() => onViewChange('register')}
              >
                Regístrate gratis
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-blue-100">
          <p>© 2026 SkillLink. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}