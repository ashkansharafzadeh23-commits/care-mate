/**
 * DEVELOPMENT ONLY — Mock / Fixture Data
 * =====================================
 * These fixtures are strictly for local prototyping and testing.
 * In a production deployment, all data will be served by backend repositories
 * (Firebase / Supabase / PostgreSQL).
 * 
 * Mock accounts must NEVER be treated as real production accounts.
 */

import { User } from '../../types';

export interface DevUserFixture extends User {
  // Passwords in dev fixtures are strictly dummy hashes for prototyping
  // Never store real passwords or tokens in frontend code
  mockPasswordHash: string;
}

export const DEVELOPMENT_USERS: DevUserFixture[] = [
  {
    id: 'u_family_sample',
    firstName: 'Sarah',
    lastName: 'Miller',
    name: 'Sarah Miller',
    email: 'sarah.family@example.com',
    phone: '+1 (555) 234-5678',
    role: 'family',
    preferredLanguage: 'en',
    createdAt: '2026-01-10T10:00:00Z',
    activeFamilyCircleId: 'fc_1',
    mockPasswordHash: 'dev_password_123'
  },
  {
    id: 'u_provider_sample',
    firstName: 'David',
    lastName: 'Chen',
    name: 'David Chen',
    email: 'david.chen@example.com',
    phone: '+1 (555) 456-7890',
    role: 'provider',
    preferredLanguage: 'en',
    createdAt: '2026-01-12T14:30:00Z',
    mockPasswordHash: 'dev_password_123'
  },
  {
    id: 'u_admin_sample',
    firstName: 'Alex',
    lastName: 'Vance',
    name: 'Alex Vance',
    email: 'admin@caremate.app',
    phone: '+1 (555) 000-1122',
    role: 'admin',
    preferredLanguage: 'en',
    createdAt: '2025-11-01T08:00:00Z',
    mockPasswordHash: 'dev_admin_secure'
  }
];
