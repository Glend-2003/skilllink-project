import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/reviewCreate.dto';
import { UpdateReviewDto } from './dto/reviewUpdate.dto';

// Interface for authenticated requests now including user info and userId
interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Create review
  // Only authenticated users can create reviews
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createReviewDto: CreateReviewDto, @Req() req: AuthenticatedRequest) {
    // The userId is now available in req.user.userId
    return this.reviewsService.create(createReviewDto, req.user.userId);
  }

  // get all reviews by admin
  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  // Get one review by ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  // My reviews for provider side
  @Get('provider/:providerId')
  findByProvider(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.reviewsService.findByProvider(providerId);
  }

  // My reviews on client side
  @Get('my-reviews')
  @UseGuards(AuthGuard('jwt'))
  getMyReviews(@Req() req: AuthenticatedRequest) {
    return this.reviewsService.findByReviewer(req.user.userId);
  }

  // Edit review
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  // Delete review
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.remove(id);
  }
}