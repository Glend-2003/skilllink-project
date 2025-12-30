import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('service_categories')
export class Category {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  categoryId: number;

  @Column({ name: 'parent_category_id', nullable: true })
  parentCategoryId: number;

  @Column({ name: 'category_name', length: 100 })
  categoryName: string;

  @Column({ name: 'category_description', type: 'text', nullable: true })
  categoryDescription: string;

  @Column({ name: 'icon_url', length: 500, nullable: true })
  iconUrl: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
