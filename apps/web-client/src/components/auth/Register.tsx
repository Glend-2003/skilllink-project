import { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Phone, Zap, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import { UserService } from '../../services/userService';
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
    console.log("1. Click en el botón de registro detectado");
    
    if (!formData.name || !formData.email || !formData.password) {
      console.log("Error: Campos incompletos");
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      console.log("Error: Términos no aceptados");
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
      const authResponse = await AuthService.register({
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phone,
        userType: userType 
      });

      console.log("Registro en Auth exitoso:", authResponse.data);
      const token = authResponse.data?.token;
      
      if (token) {
        localStorage.setItem('token', token);
      }

      await UserService.createProfile({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        role: userType
      });

      toast.success('¡Usuario y Perfil creados!');
      onViewChange('login');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error en el sistema');
    }
  };

  const handleSocialRegister = (provider: string) => {
    toast.success(`Registrándose con ${provider}...`);
    setTimeout(() => {
      onViewChange('home');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-green-500 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SkillLink</h1>
          <p className="text-blue-100">Crea tu cuenta y comienza hoy</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-white text-blue-600' : 'bg-blue-400 text-white'
            } font-bold`}>
              {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-white' : 'bg-blue-400'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-white text-blue-600' : 'bg-blue-400 text-white'
            } font-bold`}>
              2
            </div>
          </div>
        </div>

        {/* Register Card */}
        <Card className="shadow-2xl">
          {step === 1 ? (
            <>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-slate-900 font-bold">Tipo de cuenta</CardTitle>
                <CardDescription className="text-slate-700">
                  Selecciona cómo deseas usar SkillLink
                </CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="space-y-3">
                    <div
                      className={`flex items-start space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        userType === 'client'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                      onClick={() => setUserType('client')}
                    >
                      <div className="flex-1">
                        <Label htmlFor="client" className="cursor-pointer">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-slate-900">Cliente</h3>
                              <p className="text-sm text-slate-600">Busco contratar servicios</p>
                            </div>
                          </div>
                        </Label>
                        <ul className="text-sm text-slate-600 space-y-1 ml-1">
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
                    </div>

                    <div
                      className={`flex items-start space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        userType === 'provider'
                          ? 'border-green-600 bg-green-50'
                          : 'border-slate-200 hover:border-green-300'
                      }`}
                      onClick={() => setUserType('provider')}
                    >
                      <div className="flex-1">
                        <Label htmlFor="provider" className="cursor-pointer">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Zap className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-slate-900">Proveedor</h3>
                              <p className="text-sm text-slate-600">Ofrezco mis servicios profesionales</p>
                            </div>
                          </div>
                        </Label>
                        <ul className="text-sm text-slate-600 space-y-1 ml-1">
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
                  </div>

                <Button
                  onClick={handleNextStep}
                  className="w-full mt-6 text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  Continuar
                </Button>

                <div className="mt-6 text-center text-sm">
                  <span className="text-slate-600">¿Ya tienes una cuenta? </span>
                  <Button
                    variant="link"
                    className="px-0 text-blue-600 hover:text-blue-700 font-semibold !bg-transparent hover:underline !border-none shadow-none"
                    onClick={() => onViewChange('login')}
                  >
                    Inicia sesión
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-slate-900 font-bold">Completa tu registro</CardTitle>
                <CardDescription className="text-slate-700">
                  Crea tu cuenta como {userType === 'client' ? 'Cliente' : 'Proveedor'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-slate-700">Nombre completo *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Juan Pérez"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="pl-10 pr-10 h-11 border-slate-200 focus:border-gray-100 focus:ring-1 focus:ring-gray-200 rounded-lg text-slate-900 bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+506 1234 5678"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="pl-10 pr-10 h-11 border-slate-200 focus:border-gray-100 focus:ring-1 focus:ring-gray-200 rounded-lg text-slate-900 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm font-medium text-slate-700">Correo electrónico *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10 pr-10 h-11 border-slate-200 focus:border-gray-100 focus:ring-1 focus:ring-gray-200 rounded-lg text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm font-medium text-slate-700">Contraseña *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
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

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium text-slate-700">Confirmar contraseña *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repite tu contraseña"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="pl-10 pr-10 h-11 border-slate-200 focus:border-gray-100 focus:ring-1 focus:ring-gray-200 rounded-lg text-slate-900 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 !bg-transparent !border-none p-0 flex items-center justify-center !outline-none shadow-none"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      className="mt-1"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm leading-relaxed cursor-pointer text-slate-700"
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

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Atrás
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    >
                      Crear cuenta
                    </Button>
                  </div>
                </form>

                <div className="relative my-6">
                  <Separator className="!bg-slate-300"/>
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-slate-500">
                    O regístrate con
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => handleSocialRegister('Google')}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                    onClick={() => handleSocialRegister('Facebook')}
                  >
                    <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                </div>

                <div className="mt-6 text-center text-sm">
                  <span className="text-slate-600">¿Ya tienes una cuenta? </span>
                  <Button
                    variant="link"
                    className="px-0 text-blue-600 hover:text-blue-700 font-semibold !bg-transparent hover:underline !border-none shadow-none"
                    onClick={() => onViewChange('login')}
                  >
                    Inicia sesión
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-blue-100">
          <p>© 2026 SkillLink. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}