import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceDto } from './serviceCreate.dto';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
