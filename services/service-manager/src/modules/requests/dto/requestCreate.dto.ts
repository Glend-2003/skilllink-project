import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  MaxLength,
  IsLatitude,
  IsLongitude,
  Matches,
} from 'class-validator';

export class CreateRequestDto {
  @IsNotEmpty()
  @IsInt()
  serviceId: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  requestTitle: string;

  @IsNotEmpty()
  @IsString()
  requestDescription: string;

  // Obligatory address
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  serviceAddress: string;

  @IsOptional()
  @IsString()
  addressDetails?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;

  // Geolocation obligatory
  @IsNotEmpty()
  @IsNumber()
  @IsLatitude()
  serviceLatitude: number;

  @IsNotEmpty()
  @IsNumber()
  @IsLongitude()
  serviceLongitude: number;

  @IsOptional()
  @IsNumber()
  distanceKm?: number;

  @IsNotEmpty()
  @IsDateString()
  preferredDate: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'preferredTime debe ser un formato de hora válido (HH:MM)',
  })
  preferredTime: string;
}
