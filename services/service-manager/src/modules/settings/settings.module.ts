import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { SystemSetting } from './entities/setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemSetting])],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}