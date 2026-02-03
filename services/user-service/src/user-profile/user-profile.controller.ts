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
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';

interface RequestWithUser {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  async createProfile(
    @Request() req: RequestWithUser,
    @Body() createProfileDto: CreateUserProfileDto,
  ) {
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

  @UseGuards(AuthGuard('jwt'))
  @Delete('profile')
  async deleteProfile(@Request() req: RequestWithUser) {
    const userId = Number(req.user.userId);
    console.log(`🗑️ Eliminando perfil del usuario ID: ${userId}`);
    return this.userProfileService.remove(userId);
  }


  @UseGuards(AuthGuard('jwt'))
  @Post('saved-searches')
  async saveSearch(
    @Request() req: any,
    @Body() dto: CreateSavedSearchDto
  ) {
    const userId = Number(req.user.userId);
    return this.userProfileService.saveSearch(userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('saved-searches')
  async getSearches(@Request() req: any) {
    const userId = Number(req.user.userId);
    return this.userProfileService.findAllSearches(userId);
  }
}
