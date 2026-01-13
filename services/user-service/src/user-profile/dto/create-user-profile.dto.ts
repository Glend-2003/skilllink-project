import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  MaxLength,
  IsIn,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class CreateUserProfileDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MaxLength(100, { message: 'El nombre es muy largo' })
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  last_name: string;

  @IsOptional() // Puede ser nulo o indefinido
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  date_of_birth?: string;

  @IsOptional()
  @IsString()
  // Validamos que solo aceptemos estos géneros específicos (Evita basura)
  @IsIn(['Masculino', 'Femenino', 'No Binario', 'Otro', 'Prefiero no decir'])
  gender?: string;

  @IsOptional()
  @IsString()
  address_line1?: string;

  @IsOptional()
  @IsString()
  address_line2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state_province?: string;

  @IsOptional()
  @IsString()
  postal_code?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsLatitude({ message: 'La latitud no es válida' }) // Valida que sea una coordenada real
  latitude?: string;

  @IsOptional()
  @IsLongitude({ message: 'La longitud no es válida' })
  longitude?: string;
}
