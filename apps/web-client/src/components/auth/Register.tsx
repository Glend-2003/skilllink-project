import { useState } from 'react';
import { User, Zap, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { toast } from 'sonner';
import { AuthService } from '../../services/authService';

interface RegisterProps {
  onViewChange: (view: string) => void;
}

export function Register({ onViewChange }: RegisterProps) {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'client' | 'provider'>('client');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!userType) {
        toast.error('Selecciona el tipo de cuenta');
        return;
      }
      setStep(2);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!acceptTerms) {
      toast.error('Debes aceptar los términos y condiciones');
      return;
    }

    try {
      setLoading(true);
      
      const userData = {
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phone, 
        userType: userType,
      };

      const response = await AuthService.register(userData);
      
      if (response.success || response.token) {
        toast.success('¡Cuenta creada exitosamente!');
        
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        
        setTimeout(() => {
          onViewChange('home');
        }, 1000);
      } else {
        toast.error(response.message || 'Error al crear la cuenta');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = (provider: string) => {
    toast.success(`Registrándose con ${provider}...`);
    setTimeout(() => {
      onViewChange('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-green-500 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">SkillLink</h1>
          <p className="text-blue-100">Crea tu cuenta y comienza hoy</p>
        </div>

        {step === 1 ? (
          <>
            {/* Step 1: Account Type */}
            <Card className="shadow-2xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Tipo de cuenta</CardTitle>
                <CardDescription>
                  Selecciona cómo deseas usar SkillLink
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'client' | 'provider')}>
                  <div className="space-y-6">
                    {/* Client Option */}
                    <div
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                        userType === 'client'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                      onClick={() => setUserType('client')}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Cliente</h3>
                          <p className="text-sm text-slate-600">Busco contratar servicios</p>
                        </div>
                      </div>
                      <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Busca proveedores verificados
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Compara precios y reseñas
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Chat directo con profesionales
                        </li>
                      </ul>
                    </div>

                    {/* Separator */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                    </div>

                    {/* Provider Option */}
                    <div
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                        userType === 'provider'
                          ? 'border-green-600 bg-green-50'
                          : 'border-slate-200 hover:border-green-300'
                      }`}
                      onClick={() => setUserType('provider')}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Zap className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Proveedor</h3>
                          <p className="text-sm text-slate-600">Ofrezco mis servicios profesionales</p>
                        </div>
                      </div>
                      <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Consigue nuevos clientes
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Gestiona tu agenda y servicios
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Construye tu reputación online
                        </li>
                      </ul>
                    </div>
                  </div>
                </RadioGroup>

                <Button
                  onClick={handleNextStep}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  disabled={loading}
                >
                  Continuar
                </Button>

                <div className="mt-6 text-center text-sm">
                  <span className="text-slate-600">¿Ya tienes una cuenta? </span>
                  <Button
                    variant="link"
                    className="px-0 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                    onClick={() => onViewChange('login')}
                    disabled={loading}
                  >
                    Inicia sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Step 2: Complete Registration */}
            <Card className="shadow-2xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Completa tu registro</CardTitle>
                <CardDescription>
                  Crea tu cuenta como {userType === 'client' ? 'Cliente' : 'Proveedor'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Nombre completo
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Juan Pérez"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">
                        Teléfono
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="+52 55 1234 5678"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="register-email" className="text-sm font-medium">
                      Correo electrónico
                    </label>
                    <input
                      id="register-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="register-password" className="text-sm font-medium">
                      Contraseña
                    </label>
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirm-password" className="text-sm font-medium">
                      Confirmar contraseña
                    </label>
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repite tu contraseña"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-start space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1"
                      disabled={loading}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm leading-relaxed cursor-pointer"
                    >
                      Acepto los{' '}
                      <a href="#" className="text-blue-600 hover:underline">
                        términos y condiciones
                      </a>{' '}
                      y la{' '}
                      <a href="#" className="text-blue-600 hover:underline">
                        política de privacidad
                      </a>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
                      disabled={loading}
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-md hover:opacity-90 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                          Creando cuenta...
                        </>
                      ) : (
                        'Crear cuenta'
                      )}
                    </button>
                  </div>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">
                      O regístrate con
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialRegister('Google')}
                    className="px-4 py-2 border border-slate-300 rounded-md flex items-center justify-center hover:bg-slate-50 disabled:opacity-50"
                    disabled={loading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialRegister('Facebook')}
                    className="px-4 py-2 border border-slate-300 rounded-md flex items-center justify-center hover:bg-slate-50 disabled:opacity-50"
                    disabled={loading}
                  >
                    <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                </div>

                <div className="mt-6 text-center text-sm">
                  <span className="text-slate-600">¿Ya tienes una cuenta? </span>
                  <button
                    type="button"
                    onClick={() => onViewChange('login')}
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline text-sm"
                    disabled={loading}
                  >
                    Inicia sesión
                  </button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-blue-100">
          <p>© 2026 SkillLink. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}