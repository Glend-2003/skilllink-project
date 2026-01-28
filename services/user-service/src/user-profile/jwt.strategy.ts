import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// 1. Definimos una interfaz para el Payload.
// El [key: string]: any permite que existan las claves largas de .NET sin dar error.
interface JwtPayload {
  sub?: string;
  email?: string;
  nameid?: string;
  UserId?: string;
  [key: string]: any; // Comodín para propiedades extrañas como las de Microsoft
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SkillLink_Super_Secret_Key_2025_Unica',
      algorithms: ['HS256'],
    });
  }

  validate(payload: JwtPayload) {
    // LOG DE DEPURACIÓN
    console.log(
      'Token recibido en NestJS. Payload:',
      JSON.stringify(payload),
    );

    // 2. Extracción segura usando la interfaz
    // TypeScript ahora sabe que estas claves pueden existir gracias a la interfaz
    const userId =
      (payload[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ] as string) ||
      payload.nameid ||
      payload.sub ||
      payload.UserId;

    const email =
      (payload[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
      ] as string) || payload.email;

    if (!userId) {
      console.error('Error: Token válido pero sin ID.');
      throw new UnauthorizedException('Token inválido: Falta User ID');
    }

    console.log(`Usuario validado: ID ${userId}`);

    // Retornamos el objeto limpio
    return { userId: userId, email: email };
  }
}
