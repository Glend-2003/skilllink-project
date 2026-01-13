import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './categoryCreate.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
