import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('saved_searches')
export class SavedSearch {
  @PrimaryGeneratedColumn({ name: 'search_id' })
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number;

  @Column({ name: 'search_query', length: 255, nullable: true })
  searchQuery: string;

  @Column('decimal', { name: 'location_latitude', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column('decimal', { name: 'location_longitude', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ name: 'search_radius_km', nullable: true })
  radius: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}