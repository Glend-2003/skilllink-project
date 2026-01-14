import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserProfileDto } from './user-profile/dto/create-user-profile.dto';
import { UserProfile } from './user-profile/user-profile.entity'; // Asegura la ruta correcta

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userRepository: Repository<UserProfile>,
  ) {}

  async createUser(createUserDto: CreateUserProfileDto) {
    console.log('Guardando en base de datos:', createUserDto);

    // 1. Crea la instancia de la entidad (prepara el objeto)
    const newUser = this.userRepository.create(createUserDto);

    // 2. Guarda en la base de datos (INSERT INTO...)
    return await this.userRepository.save(newUser);
  }
}
