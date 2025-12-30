// src/user-profile/dto/create-user-profile.dto.ts
export class CreateUserProfileDto {
  first_name: string;
  last_name: string;
  bio?: string;
  date_of_birth?: string;
  gender?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
}
