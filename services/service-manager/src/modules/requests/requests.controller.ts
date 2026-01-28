import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/requestCreate.dto';
import { UpdateRequestDto } from './dto/requestUpdate.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createRequestDto: CreateRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.requestsService.create(createRequestDto, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mine')
  findMyRequests(
    @Request() req: AuthenticatedRequest,
    @Query('categoryId') categoryId?: string,
  ) {
    const catId = categoryId ? parseInt(categoryId, 10) : undefined;
    return this.requestsService.findAllByClient(req.user.userId, catId);
  }

  @Get()
  findAll() {
    return this.requestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requestsService.findOne(id);
  }

  @Get('provider/:id')
  findByProvider(@Param('id', ParseIntPipe) providerId: number) {
    return this.requestsService.findAllByProvider(providerId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRequestDto: UpdateRequestDto,
  ) {
    return this.requestsService.update(id, updateRequestDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.requestsService.remove(id);
  }
}
