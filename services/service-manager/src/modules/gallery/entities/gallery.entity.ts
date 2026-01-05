import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Service } from '../../services/entities/service.entity';
import { ProviderProfile } from '../../providers/entities/provider.entity';

@Entity('service_gallery')
export class Gallery {
  @PrimaryGeneratedColumn({ name: 'gallery_id' })
  galleryId: number;

  @Column({ name: 'service_id', nullable: true })
  serviceId: number;

  @Column({ name: 'provider_id' })
  providerId: number;

  @Column({ name: 'image_url', length: 500 })
  imageUrl: string;

  @Column({ name: 'image_title', length: 200, nullable: true })
  imageTitle: string;

  @Column({ name: 'image_description', type: 'text', nullable: true })
  imageDescription: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_approved', default: true })
  isApproved: boolean;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  @Column({ name: 'approval_date', type: 'timestamp', nullable: true })
  approvalDate: Date | null;

  // Relations
  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;
}
