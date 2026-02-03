import { IsString, IsInt, IsOptional, IsEnum } from 'class-validator';

export class ReportCreateDto {
  @IsInt()
  reportedUserId?: number;

  @IsInt()
  @IsOptional()
  reportedServiceId?: number;

  @IsInt()
  @IsOptional()
  reportedReviewId?: number;

  @IsString()
  type: string;

  @IsString()
  reason: string;
}