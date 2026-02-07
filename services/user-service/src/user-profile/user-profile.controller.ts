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

  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  // 2. We use the interface in the @Request() parameter
  async createProfile(
    @Request() req: RequestWithUser,
    @Body() createProfileDto: CreateUserProfileDto,
  ) {
    // 3. We convert the ID from String to Number so the database doesn't complain
    const userId = Number(req.user.userId);

    console.log(`Creating profile for user ID: ${userId}`);

    return this.userProfileService.createOrUpdate(userId, createProfileDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req: RequestWithUser) {
    const userId = Number(req.user.userId);
    return this.userProfileService.findOne(userId);
  }

  @Get('allUsers')
  async findAll() {
    return this.userProfileService.findAll();
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
    console.log(`Updating profile for user ID: ${userId}`);
    return this.userProfileService.update(userId, updateDto);
  }

  // DELETE PROFILE
  @UseGuards(AuthGuard('jwt'))
  @Delete('profile')
  async deleteProfile(@Request() req: RequestWithUser) {
    const userId = Number(req.user.userId);
    console.log(`Deleting profile for user ID: ${userId}`);
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
