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
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  @MaxLength(100, { message: 'El nombre es muy largo' })
  first_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  last_name?: string;

  @IsOptional() // Puede ser nulo o indefinido
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  date_of_birth?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Masculino', 'Femenino', 'Otro'])
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
  @IsString()
  latitude?: string;

  @IsOptional()
  @IsString()
  longitude?: string;
}
