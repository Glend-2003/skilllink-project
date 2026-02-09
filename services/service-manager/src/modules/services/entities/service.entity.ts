import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { ProviderProfile } from '../../providers/entities/provider.entity';
import { Category } from '../../categories/entities/category.entity';
import { Gallery } from '../../gallery/entities/gallery.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn({ name: 'service_id' })
  serviceId: number;

  @Column({ name: 'provider_id' })
  providerId: number;

  @Column({ name: 'category_id' })
  categoryId: number;

  @Column({ name: 'service_title', length: 200 })
  serviceTitle: string;

  @Column({ name: 'service_description', type: 'text' })
  serviceDescription: string;

  @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({
    type: 'enum',
    enum: ['fixed', 'hourly', 'negotiable'],
    default: 'fixed',
    name: 'price_type',
  })
  priceType: string;

  @Column({ name: 'estimated_duration_minutes', nullable: true })
  estimatedDurationMinutes: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Administrative fields
  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    name: 'approval_status',
  })
  approvalStatus: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'verification_date', type: 'timestamp', nullable: true })
  verificationDate: Date | null;

  // Foreign Key Relations

  @ManyToOne(() => ProviderProfile, (provider) => provider.providerId, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @ManyToOne(() => Category, (category) => category.categoryId, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Gallery, (gallery) => gallery.service)
  gallery: Gallery[];

  // System Date Columns

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
