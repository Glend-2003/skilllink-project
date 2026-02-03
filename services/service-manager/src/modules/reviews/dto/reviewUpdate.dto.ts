import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './reviewCreate.dto'; 

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}