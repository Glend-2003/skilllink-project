import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingUpdateDto } from './dto/settingUpdate.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getAll() {
    return this.settingsService.findAll();
  }

  @Get(':key')
  getOne(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  @Patch(':key')
  update(@Param('key') key: string, @Body() dto: SettingUpdateDto) {
    return this.settingsService.update(key, dto);
  }
}