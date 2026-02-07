import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsInt()
  requestId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  title: string;
}