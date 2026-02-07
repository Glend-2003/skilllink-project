import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn({ name: 'report_id' })
  id: number;

  @Column({ name: 'reporter_user_id' })
  reporterUserId: number;

  @Column({ name: 'reported_user_id', nullable: true })
  reportedUserId: number;

  @Column({ name: 'reported_service_id', nullable: true })
  reportedServiceId: number;

  @Column({ name: 'reported_review_id', nullable: true })
  reportedReviewId: number;

  @Column({ name: 'report_type', length: 50 })
  type: string;

  @Column({ name: 'report_reason', type: 'text' })
  reason: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'investigating', 'resolved', 'dismissed'],
    default: 'pending',
  })
  status: string;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date;
}