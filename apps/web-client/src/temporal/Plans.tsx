import { Check, Zap, Crown, Star } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

interface PlansProps {
  onViewChange: (view: string) => void;
}

export function Plans({ onViewChange }: PlansProps) {
  const handleSelectPlan = (plan: string) => {
    toast.success(
      `Plan ${plan} seleccionado. Redirigiendo a pago...`,
    );
  };

  const plans = [
    {
      id: "free",
      name: "Gratuito",
      price: 0,
      period: "siempre",
      icon: Zap,
      color: "from-slate-500 to-slate-600",
      popular: false,
      features: [
        "Perfil básico",
        "Hasta 3 servicios",
        "Hasta 5 fotos en galería",
        "Reseñas de clientes",
        "Chat con clientes",
      ],
      limitations: [
        "No aparece en búsquedas destacadas",
        "Sin badge de verificación",
        "Soporte por email",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: 25,
      period: "mes",
      icon: Crown,
      color: "from-blue-600 to-green-600",
      popular: true,
      features: [
        "Servicios ilimitados",
        "Galería ilimitada",
        "Destacado en búsquedas",
        "Estadísticas avanzadas",
        "Respuestas automatizadas",
        "Prioridad en soporte",
      ],
      limitations: [],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-600">
            Planes y precios
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Lleva tu negocio al
            <br />
            siguiente nivel
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades
            y crece con SkillLink
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? "border-2 border-blue-600 shadow-xl scale-105"
                    : "hover:shadow-lg transition-shadow"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-green-600 px-4 py-1">
                      Más popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="mb-4">
                    <span className="text-5xl font-bold">
                      ${plan.price}
                    </span>
                    <span className="text-slate-600">
                      /{plan.period}
                    </span>
                  </div>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                        : ""
                    }`}
                    variant={
                      plan.popular ? "default" : "outline"
                    }
                    onClick={() => handleSelectPlan(plan.name)}
                  >
                    {plan.id === "free"
                      ? "Plan actual"
                      : "Seleccionar plan"}
                  </Button>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 text-sm uppercase text-slate-600">
                      Características incluidas
                    </h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3"
                        >
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  ¿Puedo cambiar de plan en cualquier momento?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Sí, puedes actualizar o cambiar tu plan en
                  cualquier momento. Los cambios se aplicarán
                  inmediatamente.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  ¿Cómo se calculan las comisiones?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Las comisiones se aplican sobre el monto total
                  de cada servicio completado. Se descuentan
                  automáticamente al momento del pago.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  ¿Ofrecen período de prueba?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Sí, ofrecemos 14 días de prueba gratuita del
                  plan Pro para nuevos proveedores. No se
                  requiere tarjeta de crédito.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}