import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
    private dataSource: DataSource,
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

  // 2. Get Profile by User ID (includes email from users table)
  async findOne(userId: number): Promise<any | null> {
    const profile = await this.profileRepository
      .createQueryBuilder('profile')
      .leftJoin('users', 'user', 'user.user_id = profile.user_id')
      .select([
        'profile.profile_id AS profile_id',
        'profile.user_id AS user_id',
        'profile.first_name AS first_name',
        'profile.last_name AS last_name',
        'profile.date_of_birth AS date_of_birth',
        'profile.gender AS gender',
        'profile.bio AS bio',
        'profile.address_line1 AS address_line1',
        'profile.address_line2 AS address_line2',
        'profile.city AS city',
        'profile.state_province AS state_province',
        'profile.postal_code AS postal_code',
        'profile.country AS country',
        'profile.latitude AS latitude',
        'profile.longitude AS longitude',
        'user.email AS email',
        'user.profile_image_url AS profile_image_url',
      ])
      .where('profile.user_id = :userId', { userId })
      .getRawOne();

    return profile;
  }

  // Get basic user info from users table (for users without complete profile)
  async findBasicUserInfo(userId: number): Promise<any | null> {
    const user = await this.dataSource.query(
      `SELECT 
        user_id, 
        email, 
        profile_image_url,
        user_type,
        created_at
      FROM users 
      WHERE user_id = ?`,
      [userId]
    );

    return user && user.length > 0 ? user[0] : null;
  }

  async findAll(): Promise<UserProfile[]> {
    return this.profileRepository.find();
  }


  // 3. Update Profile (PATCH)
  async update(
    userId: number,
    updateDto: CreateUserProfileDto,
  ): Promise<UserProfile> {
    // TypeORM's .update() is very efficient, it looks for the ID and changes only what you send
    await this.profileRepository.update({ user_id: userId }, updateDto);

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
