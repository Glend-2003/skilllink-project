export type UserMode = 'client' | 'provider';

export type ServiceCategory = 
  | 'plumber' 
  | 'electrician' 
  | 'technician' 
  | 'barber' 
  | 'mechanic' 
  | 'designer'
  | 'cleaner'
  | 'painter'
  | 'carpenter';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  isProvider: boolean;
  mode: UserMode;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: ServiceCategory;
}

export interface Provider {
  id: string;
  name: string;
  avatar: string;
  category: ServiceCategory;
  rating: number;
  reviewCount: number;
  distance: number;
  location: Location;
  services: Service[];
  reviews: Review[];
  gallery: string[];
  description: string;
  experience: string;
  isAvailable: boolean;
  responseTime: string;
  plan: 'free' | 'pro';
  verified: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export interface ServiceRequest {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  date: string;
  price: number;
  category: ServiceCategory;
}

export interface ProviderStats {
  totalRequests: number;
  completedRequests: number;
  totalEarnings: number;
  averageRating: number;
  viewsThisMonth: number;
}
