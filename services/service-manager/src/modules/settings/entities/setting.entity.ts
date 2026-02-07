import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('system_settings')
export class SystemSetting {
  @PrimaryGeneratedColumn({ name: 'setting_id' })
  id: number;

  @Column({ name: 'setting_key', length: 100, unique: true })
  key: string;

  @Column({ name: 'setting_value', type: 'text', nullable: true })
  value: string;

  @Column({ name: 'setting_type', length: 50, nullable: true })
  type: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}