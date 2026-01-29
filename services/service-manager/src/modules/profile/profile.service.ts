import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProfileService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadProfileImage(
    file: Express.Multer.File,
    userId: number,
  ): Promise<{ imageUrl: string }> {
    try {
      // Upload to Cloudinary in profiles folder
      const result = await this.cloudinaryService.uploadImage(
        file,
        'skilllink/profiles',
      );

      return {
        imageUrl: result.secure_url,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to upload profile image to Cloudinary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteProfileImage(imageUrl: string): Promise<void> {
    try {
      await this.cloudinaryService.deleteImage(imageUrl);
    } catch (error) {
      throw new HttpException(
        'Failed to delete profile image from Cloudinary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
