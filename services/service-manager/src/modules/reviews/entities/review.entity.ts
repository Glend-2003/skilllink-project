import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ProviderProfile } from '../../providers/entities/provider.entity';
import { ServiceRequest } from '../../requests/entities/request.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn({ name: 'review_id' })
  reviewId: number;

  @Column({ name: 'request_id', unique: true })
  requestId: number;

  // The one who writes the review
  @Column({ name: 'reviewer_user_id' }) 
  reviewerId: number;

  // The one being reviewed (Provider)
  @Column({ name: 'reviewed_user_id' }) 
  reviewedId: number;

  @Column({ type: 'int' })
  rating: number; // 1-5

  @Column({ name: 'review_title', nullable: true })
  title: string;

  @Column({ name: 'review_text', nullable: true })
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations to ProviderProfile and ServiceRequest
  @ManyToOne(() => ProviderProfile, (provider) => provider.providerId, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reviewed_user_id' }) 
  provider: ProviderProfile;

  @OneToOne(() => ServiceRequest)
  @JoinColumn({ name: 'request_id' })
  request: ServiceRequest;
}