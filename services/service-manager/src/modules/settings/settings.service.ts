import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './entities/setting.entity';
import { SettingUpdateDto } from './dto/settingUpdate.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingsRepository: Repository<SystemSetting>,
  ) {}

  findAll() {
    return this.settingsRepository.find();
  }

  async findByKey(key: string) {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting ${key} not found`);
    return setting;
  }

  async update(key: string, dto: SettingUpdateDto) {
    const setting = await this.findByKey(key);
    setting.value = dto.value;
    if (dto.description) setting.description = dto.description;
    return this.settingsRepository.save(setting);
  }
}