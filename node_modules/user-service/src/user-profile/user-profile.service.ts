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

  // 1. Crear o Actualizar Perfil
  async createOrUpdate(
    userId: number,
    createProfileDto: CreateUserProfileDto,
  ): Promise<UserProfile> {
    // Buscamos si ya existe un perfil para este usuario
    const existingProfile = await this.profileRepository.findOne({
      where: { user_id: userId },
    });

    if (existingProfile) {
      // Si existe, actualizamos los campos
      this.profileRepository.merge(existingProfile, createProfileDto);
      return this.profileRepository.save(existingProfile);
    } else {
      // Si no existe, creamos uno nuevo vinculado al userId
      const newProfile = this.profileRepository.create({
        ...createProfileDto,
        user_id: userId, // Aquí vinculamos con el ID que viene del Token
      });
      return this.profileRepository.save(newProfile);
    }
  }

  // 2. Obtener Perfil por ID de usuario
  async findOne(userId: number): Promise<UserProfile | null> {
    return this.profileRepository.findOne({
      where: { user_id: userId },
    });
  }
}
