import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

interface DotNetJwtPayload {
  [key: string]: any;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SkillLink_Super_Secret_Key_2025_Unica',
    });
  }

  validate(payload: DotNetJwtPayload) {
    const userIdRaw =
      payload[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ];
    const emailRaw =
      payload[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
      ];

    if (!userIdRaw) {
      throw new UnauthorizedException(
        'Token inválido: No contiene ID de usuario',
      );
    }

    return {
      userId: parseInt(userIdRaw, 10),
      email: emailRaw,
    };
  }
}
