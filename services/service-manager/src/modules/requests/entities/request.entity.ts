import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Service } from '../../services/entities/service.entity';
import { ProviderProfile } from '../../providers/entities/provider.entity';

@Entity('service_requests')
export class ServiceRequest {
  @PrimaryGeneratedColumn({ name: 'request_id' })
  requestId: number;

  @Column({ name: 'client_user_id' })
  clientUserId: number;

  @Column({ name: 'contact_phone', length: 20, nullable: true })
  contactPhone: string;

  @Column({ name: 'provider_id', nullable: false })
  providerId: number;

  @Column({ name: 'service_id', nullable: false })
  serviceId: number;

  @Column({ name: 'request_title', length: 200 })
  requestTitle: string;

  @Column({ name: 'request_description', type: 'text' })
  requestDescription: string;

  @Column({ name: 'service_address', length: 500 })
  serviceAddress: string;

  // Visual details about the address
  @Column({ name: 'address_details', type: 'text', nullable: true })
  addressDetails: string;

  @Column({
    name: 'service_latitude',
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  serviceLatitude: number;

  @Column({
    name: 'service_longitude',
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  serviceLongitude: number;

  // IA vital to calculate distance
  @Column({
    name: 'distance_km',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  distanceKm: number;

  @Column({ name: 'preferred_date', type: 'date' })
  preferredDate: string;

  @Column({ name: 'preferred_time', type: 'time' })
  preferredTime: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Column({ name: 'estimated_cost', type: 'decimal', precision: 10, scale: 2 })
  estimatedCost: number;

  @Column({
    name: 'final_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  finalCost: number;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // FKs relations
  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => ProviderProfile)
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;
}
