import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { SavedSearch } from './entities/saved-search.entity';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
    @InjectRepository(SavedSearch)
    private savedSearchRepository: Repository<SavedSearch>,
  ) {}

  async createOrUpdate(
    userId: number,
    createProfileDto: CreateUserProfileDto,
  ): Promise<UserProfile> {
    const existingProfile = await this.profileRepository.findOne({
      where: { user_id: userId },
    });

    if (existingProfile) {
      this.profileRepository.merge(existingProfile, createProfileDto);
      return this.profileRepository.save(existingProfile);
    } else {
      const newProfile = this.profileRepository.create({
        ...createProfileDto,
        user_id: userId,
      });
      return this.profileRepository.save(newProfile);
    }
  }

  async findOne(userId: number): Promise<UserProfile | null> {
    return this.profileRepository.findOne({
      where: { user_id: userId },
    });
  }

  async update(
    userId: number,
    updateDto: CreateUserProfileDto,
  ): Promise<UserProfile> {
    await this.profileRepository.update({ user_id: userId }, updateDto);

    const updatedProfile = await this.findOne(userId);
    if (!updatedProfile) {
      throw new Error('No se encontró el perfil después de actualizar');
    }
    return updatedProfile;
  }

  async remove(userId: number): Promise<{ message: string }> {
    const result = await this.profileRepository.delete({ user_id: userId });

    if (result.affected === 0) {
      throw new Error('No se encontró un perfil para eliminar');
    }

    return { message: 'Perfil eliminado correctamente' };
  }


  

  async saveSearch(userId: number, dto: CreateSavedSearchDto) {
    const newSearch = this.savedSearchRepository.create({
      ...dto,
      userId: userId,
    });
    return this.savedSearchRepository.save(newSearch);
  }
  
  async findAllSearches(userId: number) {
    return this.savedSearchRepository.find({ where: { userId } });
  }
}
