import { useState } from 'react';
import { ChevronRight, Zap, Search, Star, MessageCircle, Shield, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface OnboardingProps {
  onViewChange: (view: string) => void;
}

export function Onboarding({ onViewChange }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Search,
      title: 'Encuentra profesionales cerca de ti',
      description: 'Busca entre cientos de proveedores verificados en tu área. Desde plomeros hasta diseñadores.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: Star,
      title: 'Compara y elige el mejor',
      description: 'Lee reseñas reales, compara precios y servicios. Toma la mejor decisión informada.',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      icon: MessageCircle,
      title: 'Conecta directamente',
      description: 'Chatea en tiempo real con los proveedores. Coordina horarios y detalles sin intermediarios.',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      icon: TrendingUp,
      title: '¿Eres proveedor? Crece tu negocio',
      description: 'Consigue nuevos clientes, gestiona tus servicios y construye tu reputación online.',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onViewChange('register');
    }
  };

  const handleSkip = () => {
    onViewChange('login');
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentSlideData.color} flex items-center justify-center p-4 transition-colors duration-500`}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4 animate-bounce">
            <Zap className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SkillLink</h1>
          <p className="text-white/90">Tu conexión con profesionales locales</p>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl overflow-hidden">
          <div className="p-8 text-center">
            {/* Icon */}
            <div className={`w-24 h-24 ${currentSlideData.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <Icon className={`w-12 h-12 ${currentSlideData.iconColor}`} />
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold mb-4">{currentSlideData.title}</h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              {currentSlideData.description}
            </p>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'w-8 bg-gradient-to-r ' + currentSlideData.color
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleNext}
                className={`w-full bg-gradient-to-r ${currentSlideData.color} hover:opacity-90`}
              >
                {currentSlide < slides.length - 1 ? (
                  <>
                    Siguiente
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  'Comenzar'
                )}
              </Button>
              
              {currentSlide < slides.length - 1 && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="w-full text-slate-600"
                >
                  Saltar introducción
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Button
            variant="link"
            onClick={() => onViewChange('login')}
            className="text-white hover:text-white/80"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="text-white/90">
            <Shield className="w-6 h-6 mx-auto mb-2" />
            <p className="text-xs">Verificados</p>
          </div>
          <div className="text-white/90">
            <Star className="w-6 h-6 mx-auto mb-2" />
            <p className="text-xs">Calificados</p>
          </div>
          <div className="text-white/90">
            <MessageCircle className="w-6 h-6 mx-auto mb-2" />
            <p className="text-xs">Chat directo</p>
          </div>
        </div>
      </div>
    </div>
  );
}