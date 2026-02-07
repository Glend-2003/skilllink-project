import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';

// 1. We define an interface for the Request object
interface RequestWithUser {
  user: {
    userId: string; // .NET sends it as a string in the claim
    email: string;
  };
}

@Controller('')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  // Public endpoint for auth-service to create profiles during registration
  @Post('user-profile')
  async createUserProfile(@Body() createProfileDto: CreateUserProfileDto & { user_id: number }) {
    return this.userProfileService.createOrUpdate(createProfileDto.user_id, createProfileDto);
  }

  // Authenticated endpoint for mobile app to create/update profile
  @UseGuards(AuthGuard('jwt'))
  @Post('user-profile/me')
  async createOrUpdateMyProfile(
    @Request() req: RequestWithUser,
    @Body() createProfileDto: CreateUserProfileDto,
  ) {
    const userId = Number(req.user.userId);
    return this.userProfileService.createOrUpdate(userId, createProfileDto);
  }

  // Alias for mobile app (with auth guard)
  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  // 2. We use the interface in the @Request() parameter
  async createProfile(
    @Request() req: RequestWithUser,
    @Body() createProfileDto: CreateUserProfileDto,
  ) {
    const userId = Number(req.user.userId);

    return this.userProfileService.createOrUpdate(userId, createProfileDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user-profile/me')
  async getMyProfile(@Request() req: RequestWithUser) {
    const userId = Number(req.user.userId);
    return this.userProfileService.findOne(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('user-profile')
  async updateMyProfile(
    @Request() req: RequestWithUser,
    @Body() updateDto: CreateUserProfileDto,
  ) {
    const userId = Number(req.user.userId);
    return this.userProfileService.update(userId, updateDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req: RequestWithUser) {
    const userId = Number(req.user.userId);
    return this.userProfileService.findOne(userId);
  }

  @Get(':userId')
  async findOne(@Param('userId') userId: string) {

    return this.userProfileService.findOne(+userId);
  }

  @Get('profiles')
  async findAll() {
    return this.userProfileService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body() updateDto: CreateUserProfileDto,
  ) {
    const userId = Number(req.user.userId);
    return this.userProfileService.update(userId, updateDto);
  }

  // DELETE PROFILE
  @UseGuards(AuthGuard('jwt'))
  @Delete('profile')
  async deleteProfile(@Request() req: RequestWithUser) {
    const userId = Number(req.user.userId);
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
