import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/reviewCreate.dto';
import { UpdateReviewDto } from './dto/reviewUpdate.dto';
import { ServiceRequest } from '../requests/entities/request.entity';
import { ProviderProfile } from '../providers/entities/provider.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ServiceRequest)
    private readonly requestRepository: Repository<ServiceRequest>,
    @InjectRepository(ProviderProfile)
    private readonly providerRepository: Repository<ProviderProfile>,
  ) {}

  // --- CREATE ---
  async create(createReviewDto: CreateReviewDto, clientUserId: number) {
    // 1. Find the Service Request
    const request = await this.requestRepository.findOne({
      where: { requestId: createReviewDto.requestId },
    });

    if (!request) {
      throw new NotFoundException(`Service Request ID ${createReviewDto.requestId} not found.`);
    }

    // 2. Security Check: Verify user ownership
    if (Number(request.clientUserId) !== Number(clientUserId)) {
      throw new ForbiddenException('You are not authorized to review this service request.');
    }

    // 3. Status Check: Only completed services allow reviews
    const currentStatus = request.status.trim().toLowerCase();
    if (currentStatus !== 'completed') {
      throw new BadRequestException('Reviews are only allowed for completed services.');
    }

    // 4. Duplicate Check
    const existingReview = await this.reviewRepository.findOne({
      where: { requestId: createReviewDto.requestId },
    });
    if (existingReview) {
      throw new ConflictException('A review for this service request already exists.');
    }

    // 5. Retrieve Provider's User ID (CRITICAL FIX)
    // We need the User ID associated with the Provider Profile to satisfy the foreign key
    const providerProfile = await this.providerRepository.findOne({
      where: { providerId: request.providerId }
    });

    if (!providerProfile) {
      throw new NotFoundException(`Provider Profile associated with request not found.`);
    }

    // 6. Save Review
    const review = this.reviewRepository.create({
      requestId: createReviewDto.requestId,
      rating: createReviewDto.rating,
      title: createReviewDto.title,     // Added title support
      comment: createReviewDto.comment,
      reviewerId: clientUserId,         // The Client (User ID)
      reviewedId: providerProfile.userId // The Provider (User ID) - Fixed
    });

    return await this.reviewRepository.save(review);
  }

  // --- FIND ALL ---
  async findAll() {
    return this.reviewRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['provider'],
    });
  }

  // --- FIND ONE ---
  async findOne(id: number) {
    const review = await this.reviewRepository.findOne({
      where: { reviewId: id },
      relations: ['provider'],
    });
    if (!review) throw new NotFoundException(`Review ID ${id} not found.`);
    return review;
  }

  // --- FIND BY PROVIDER ---
  // Updated logic: Accepts ProviderProfile ID -> Finds User ID -> Gets Reviews
  async findByProvider(providerId: number) {
    // First, find the user behind this profile
    const provider = await this.providerRepository.findOne({ where: { providerId } });
    
    if (!provider) {
       throw new NotFoundException('Provider profile not found');
    }

    return this.reviewRepository.find({
      where: { reviewedId: provider.userId }, // Search by User ID
      order: { createdAt: 'DESC' },
    });
  }

  // --- FIND MY REVIEWS (Client side) ---
  async findByReviewer(userId: number) {
    return this.reviewRepository.find({
      where: { reviewerId: userId },
      relations: ['provider'],
      order: { createdAt: 'DESC' },
    });
  }

  // --- UPDATE ---
  async update(id: number, updateReviewDto: UpdateReviewDto) {
    const review = await this.reviewRepository.preload({
      reviewId: id,
      ...updateReviewDto,
    });
    if (!review) throw new NotFoundException(`Review ID ${id} not found.`);
    return await this.reviewRepository.save(review);
  }

  // --- DELETE ---
  async remove(id: number) {
    const review = await this.findOne(id);
    return await this.reviewRepository.remove(review);
  }
}