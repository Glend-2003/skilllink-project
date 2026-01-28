import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('provider_profiles')
export class ProviderProfile {
  @PrimaryGeneratedColumn({ name: 'provider_id' })
  providerId: number;

  // user_id one to one relationship assumed
  @Column({ name: 'user_id', unique: true })
  userId: number;

  @Column({ name: 'business_name', length: 200 })
  businessName: string;

  @Column({ name: 'business_description', type: 'text', nullable: true })
  businessDescription: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ name: 'years_experience', nullable: true })
  yearsExperience: number;

  @Column({ name: 'service_radius_km', nullable: true })
  serviceRadiusKm: number;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'verification_date', type: 'timestamp', nullable: true })
  verificationDate: Date | null;

  @Column({ name: 'trust_badge', default: false })
  trustBadge: boolean;

  @Column({ name: 'available_for_work', default: true })
  availableForWork: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
