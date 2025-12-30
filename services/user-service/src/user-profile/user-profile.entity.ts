import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn()
  profile_id: number;

  @Column()
  user_id: number;

  @Column({ length: 100 })
  first_name: string;

  @Column({ length: 100 })
  last_name: string;

  // Quitamos 'unique: true' porque muchas personas nacen el mismo día
  @Column({ type: 'date', nullable: true })
  date_of_birth: string;

  // Quitamos 'unique: true'
  @Column({ length: 20, nullable: true })
  gender: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  // Dirección desglosada (Quitamos 'unique')
  @Column({ length: 255, nullable: true })
  address_line1: string;

  @Column({ length: 255, nullable: true })
  address_line2: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state_province: string;

  @Column({ length: 20, nullable: true })
  postal_code: string;

  @Column({ length: 100, nullable: true })
  country: string;

  // Latitud/Longitud suelen ser decimales, pero string funciona por ahora
  @Column({ length: 50, nullable: true })
  latitude: string;

  @Column({ length: 50, nullable: true })
  longitude: string;
  // Recuerda: Eliminamos profile_picture_url porque está en la tabla 'users'
}
