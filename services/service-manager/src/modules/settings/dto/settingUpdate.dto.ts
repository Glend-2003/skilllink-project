import { IsString, IsOptional } from 'class-validator';

export class SettingUpdateDto {
  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  description?: string;
}