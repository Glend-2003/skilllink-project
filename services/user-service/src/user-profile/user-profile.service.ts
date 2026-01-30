import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
  ) {}

  // 1. Create or Update Profile
  async createOrUpdate(
    userId: number,
    createProfileDto: CreateUserProfileDto,
  ): Promise<UserProfile> {
    // Check if a profile already exists for this user
    const existingProfile = await this.profileRepository.findOne({
      where: { user_id: userId },
    });

    if (existingProfile) {
      // If it exists, update the fields
      this.profileRepository.merge(existingProfile, createProfileDto);
      return this.profileRepository.save(existingProfile);
    } else {
      // If it doesn't exist, create a new one linked to the userId
      const newProfile = this.profileRepository.create({
        ...createProfileDto,
        user_id: userId, // Here we link with the ID that comes from the Token
      });
      return this.profileRepository.save(newProfile);
    }
  }

  // 2. Get Profile by User ID
  async findOne(userId: number): Promise<UserProfile | null> {
    return this.profileRepository.findOne({
      where: { user_id: userId },
    });
  }
  // 3. Update Profile (PATCH)
  async update(
    userId: number,
    updateDto: CreateUserProfileDto,
  ): Promise<UserProfile> {
    // TypeORM's .update() is very efficient, it looks for the ID and changes only what you send
    await this.profileRepository.update({ user_id: userId }, updateDto);

    // Devolvemos el perfil ya actualizado para que el usuario vea los cambios
    const updatedProfile = await this.findOne(userId);
    if (!updatedProfile) {
      throw new Error('Profile not found after update');
    }
    return updatedProfile;
  }

  // 4. Delete Profile (DELETE)
  async remove(userId: number): Promise<{ message: string }> {
    const result = await this.profileRepository.delete({ user_id: userId });

    if (result.affected === 0) {
      throw new Error('Profile not found for deletion');
    }

    return { message: 'Profile deleted successfully' };
  }
}
