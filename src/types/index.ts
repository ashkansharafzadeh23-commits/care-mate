export type Language = 'en' | 'fa';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Parent {
  id: string;
  name: string;
  age: number;
  careNeeds: string[];
  photoUrl?: string;
}

export interface Provider {
  id: string;
  name: string;
  title: string;
  matchScore: number;
  matchReasonEN: string;
  matchReasonFA: string;
  yearsExperience: number;
  rate: number;
  distance: string;
  specialtiesEN: string[];
  specialtiesFA: string[];
  isIdentityVerified: boolean;
  isBackgroundChecked: boolean;
  isLicenseVerified: boolean;
  avatarUrl: string;
  aboutEN: string;
  aboutFA: string;
  reviewsCount: number;
  rating: number;
}
