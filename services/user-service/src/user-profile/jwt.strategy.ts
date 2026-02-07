import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// 1. whe define a TypeScript interface for the JWT payload
interface JwtPayload {
  sub?: string;
  email?: string;
  nameid?: string;
  UserId?: string;
  [key: string]: any; // Wildcard for strange properties like those from Microsoft
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SkillLink_Super_Secret_Key_2025_Unica',
      algorithms: ['HS256'],
      // issuer: 'SkillLink',
      // audience: 'SkillLinkApp',
    });
  }

  validate(payload: JwtPayload) {
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
      throw new UnauthorizedException('Invalid token: Missing User ID');
    }

    return { userId: userId, email: email };
  }
}
