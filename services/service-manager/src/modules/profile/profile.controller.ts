import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
  ) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    if (!userId) {
      throw new HttpException('UserId is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.profileService.uploadProfileImage(
        file,
        parseInt(userId),
      );

      return {
        message: 'Profile image uploaded successfully',
        imageUrl: result.imageUrl,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to upload profile image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('delete-image')
  async deleteProfileImage(@Body('imageUrl') imageUrl: string) {
    if (!imageUrl) {
      throw new HttpException('ImageUrl is required', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.profileService.deleteProfileImage(imageUrl);
      return {
        message: 'Profile image deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete profile image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
