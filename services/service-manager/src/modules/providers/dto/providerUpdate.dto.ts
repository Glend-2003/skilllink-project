import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderDto } from './providerCreate.dto';

export class UpdateProviderDto extends PartialType(CreateProviderDto) {}
