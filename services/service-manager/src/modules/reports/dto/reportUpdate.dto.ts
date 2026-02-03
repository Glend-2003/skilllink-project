import { IsString, IsOptional, IsEnum } from 'class-validator';

export class ReportUpdateDto {
  @IsOptional()
  @IsEnum(['pending', 'investigating', 'resolved', 'dismissed'])
  status?: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;
}