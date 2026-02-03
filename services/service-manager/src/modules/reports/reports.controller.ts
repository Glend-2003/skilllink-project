import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportCreateDto } from './dto/reportCreate.dto';
import { ReportUpdateDto } from './dto/reportUpdate.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req: any, @Body() dto: ReportCreateDto) {
    return this.reportsService.create(req.user.userId, dto);
  }

  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: ReportUpdateDto) {
    return this.reportsService.update(+id, dto);
  }
}