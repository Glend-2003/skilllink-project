import {
  IsString,
  IsInt,
  IsNotEmpty,
  Min,
  MaxLength,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class CreateProviderDto {
  @IsNotEmpty({ message: 'El ID de usuario es obligatorio' })
  @IsInt()
  userId!: number;

  @IsNotEmpty({ message: 'El nombre del negocio es obligatorio' })
  @IsString()
  @MaxLength(200, { message: 'El nombre es muy largo (máx 200 caracteres)' })
  businessName!: string;

  @IsNotEmpty({
    message: 'Debes describir tu negocio para que los clientes confíen',
  })
  @IsString()
  businessDescription!: string;

  @IsNotEmpty({ message: 'La latitud es obligatoria' })
  @IsNumber()
  @IsLatitude()
  latitude!: number;

  @IsNotEmpty({ message: 'La longitud es obligatoria' })
  @IsNumber()
  @IsLongitude()
  longitude!: number;

  @IsNotEmpty({ message: 'Indica tus años de experiencia' })
  @IsInt()
  @Min(0)
  yearsExperience!: number;

  @IsNotEmpty({ message: 'Define tu radio de cobertura en Kilómetros' })
  @IsInt()
  @Min(1)
  serviceRadiusKm!: number;

  @IsOptional()
  @IsBoolean()
  availableForWork?: boolean;

  // 'isVerified', 'trustBadge' y 'verificationDate' managed internally.
}
