import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserProfileDto } from './user-profile/dto/create-user-profile.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserProfileDto) {
    return this.userService.createUser(createUserDto);
  }
}
