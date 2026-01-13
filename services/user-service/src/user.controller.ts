import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserProfileDto } from './user-profile/dto/create-user-profile.dto';

@Controller('users') // Esto define la ruta base: http://localhost:3004/users
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserProfileDto) {
    // Si llega a esta línea, significa que NestJS ya validó los datos
    // y no hubo errores. ¡El DTO hizo su trabajo!
    return this.userService.createUser(createUserDto);
  }
}
