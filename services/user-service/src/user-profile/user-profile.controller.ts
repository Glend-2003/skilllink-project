import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';

// 1. Definimos qué forma tiene el objeto "user" que viene del Token
interface RequestWithUser {
  user: {
    userId: string; // .NET lo envía como string en el claim
    email: string;
  };
}

@Controller('')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  // 2. Usamos la interfaz en el parámetro @Request()
  async createProfile(
    @Request() req: RequestWithUser,
    @Body() createProfileDto: CreateUserProfileDto,
  ) {
    // 3. Convertimos el ID de String a Number para que la base de datos no se queje
    const userId = Number(req.user.userId);

    console.log(`📝 Creando perfil para usuario ID: ${userId}`);

    return this.userProfileService.createOrUpdate(userId, createProfileDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req: RequestWithUser) {
    const userId = Number(req.user.userId);
    return this.userProfileService.findOne(userId);
  }

  @Get(':userId')
  async findOne(@Param('userId') userId: string) {
    // <--- SACA EL ID DE LA URL
    return this.userProfileService.findOne(+userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body() updateDto: CreateUserProfileDto,
  ) {
    const userId = Number(req.user.userId);
    console.log(`🔄 Actualizando perfil del usuario ID: ${userId}`);
    return this.userProfileService.update(userId, updateDto);
  }

  // ELIMINAR (DELETE)
  @UseGuards(AuthGuard('jwt'))
  @Delete('profile')
  async deleteProfile(@Request() req: RequestWithUser) {
    const userId = Number(req.user.userId);
    console.log(`🗑️ Eliminando perfil del usuario ID: ${userId}`);
    return this.userProfileService.remove(userId);
  }
}
