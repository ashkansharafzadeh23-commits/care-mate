import { Provider, TrustRecord } from '../types';

/**
 * Provider Service
 * Encapsulates provider retrieval, search, filtering, and trust verification.
 * Follows Rule 14: Never display "Verified", "Background Checked", "Licensed"
 * unless the underlying verification record confirms it.
 */

export const INITIAL_PROVIDERS: Provider[] = [
  {
    id: 'prov_1',
    name: 'Sarah Jenkins',
    title: 'Certified Nursing Assistant',
    matchScore: 94,
    matchReasonEN: 'Excellent match for mobility assistance & Tuesday/Thursday schedule.',
    matchReasonFA: 'تطابق عالی برای کمک به تحرک و برنامه سه‌شنبه/پنجشنبه.',
    yearsExperience: 8,
    rate: 28,
    distance: '3.2 mi',
    specialtiesEN: ['Mobility Support', 'Dementia Care', 'Medication Mgmt'],
    specialtiesFA: ['پشتیبانی تحرک', 'مراقبت از زوال عقل', 'مدیریت دارو'],
    isIdentityVerified: true,
    isBackgroundChecked: true,
    isLicenseVerified: true,
    avatarUrl: 'https://i.pravatar.cc/150?u=sarah',
    aboutEN: 'I have been a CNA for 8 years, specializing in elder care and mobility support. I believe in compassionate, patient-centered care.',
    aboutFA: 'من به مدت ۸ سال کمک پرستار بوده‌ام و در مراقبت از سالمندان و پشتیبانی تحرک تخصص دارم.',
    reviewsCount: 42,
    rating: 4.9,
    lat: 37.7749,
    lng: -122.4194,
    availability: 'today',
    trustRecord: {
      isIdentityVerified: true,
      identityVerifiedAt: '2026-01-15',
      isBackgroundChecked: true,
      backgroundCheckedAt: '2026-02-10',
      isLicenseVerified: true,
      licenseType: 'Certified Nursing Assistant (CNA)',
      licenseNumber: 'CNA-784920',
      isInsured: true,
      verificationNotes: 'State board credential active and clear'
    },
    reviews: [
      {
        id: 'rev_1',
        authorName: 'Emily R.',
        rating: 5,
        date: '2 weeks ago',
        text: 'Absolutely wonderful! She was so patient with my mother and always arrived on time. Highly recommended.',
        verifiedVisit: true
      },
      {
        id: 'rev_2',
        authorName: 'David M.',
        rating: 5,
        date: '1 month ago',
        text: 'Very professional and knowledgeable. My father felt very comfortable right away.',
        verifiedVisit: true
      }
    ]
  },
  {
    id: 'prov_2',
    name: 'David Chen',
    title: 'Registered Nurse',
    matchScore: 88,
    matchReasonEN: 'Strong medical background, matches your schedule requirements.',
    matchReasonFA: 'پیشینه قوی پزشکی، مطابق با نیازهای زمانی شما.',
    yearsExperience: 12,
    rate: 45,
    distance: '5.1 mi',
    specialtiesEN: ['Wound Care', 'Post-Op Recovery', 'Vitals Monitoring'],
    specialtiesFA: ['مراقبت از زخم', 'ریکاوری بعد از عمل', 'نظارت بر علائم حیاتی'],
    isIdentityVerified: true,
    isBackgroundChecked: true,
    isLicenseVerified: true,
    avatarUrl: 'https://i.pravatar.cc/150?u=david',
    aboutEN: 'Experienced RN with a background in ICU and home health. Detail-oriented and highly communicative with families.',
    aboutFA: 'پرستار با تجربه با سابقه کار در بخش مراقبت‌های ویژه و بهداشت خانگی.',
    reviewsCount: 128,
    rating: 4.8,
    lat: 37.7849,
    lng: -122.4094,
    availability: 'this_week',
    trustRecord: {
      isIdentityVerified: true,
      identityVerifiedAt: '2025-11-20',
      isBackgroundChecked: true,
      backgroundCheckedAt: '2026-01-08',
      isLicenseVerified: true,
      licenseType: 'Registered Nurse (RN)',
      licenseNumber: 'RN-992144',
      isInsured: true
    },
    reviews: [
      {
        id: 'rev_3',
        authorName: 'Karen T.',
        rating: 5,
        date: '3 weeks ago',
        text: 'David has been a lifesaver for post-op wound care and medication coordination.',
        verifiedVisit: true
      }
    ]
  },
  {
    id: 'prov_3',
    name: 'Elena Rostova',
    title: 'Home Health Aide',
    matchScore: 82,
    matchReasonEN: 'Compassionate companion with great experience in physical therapy support.',
    matchReasonFA: 'همراه دلسوز با تجربه عالی در پشتیبانی فیزیوتراپی.',
    yearsExperience: 5,
    rate: 24,
    distance: '1.8 mi',
    specialtiesEN: ['Companionship', 'Meal Preparation', 'Light Housekeeping'],
    specialtiesFA: ['مصاحبت', 'آماده سازی غذا', 'کارهای سبک منزل'],
    isIdentityVerified: true,
    isBackgroundChecked: true,
    isLicenseVerified: false,
    avatarUrl: 'https://i.pravatar.cc/150?u=elena',
    aboutEN: 'Dedicated caregiver focused on dignity and comfort. Experienced with meal preparation and active daily living support.',
    aboutFA: 'مراقب متعهد با تمرکز بر حفظ کرامت و آسایش سالمندان.',
    reviewsCount: 35,
    rating: 4.7,
    lat: 37.7649,
    lng: -122.4294,
    availability: 'today',
    trustRecord: {
      isIdentityVerified: true,
      identityVerifiedAt: '2026-02-01',
      isBackgroundChecked: true,
      backgroundCheckedAt: '2026-02-05',
      isLicenseVerified: false,
      isInsured: true
    },
    reviews: [
      {
        id: 'rev_4',
        authorName: 'Marcus L.',
        rating: 5,
        date: '2 months ago',
        text: 'Elena brings so much joy and warmth to our home. She is wonderful.',
        verifiedVisit: true
      }
    ]
  }
];

class ProviderService {
  private providers: Provider[] = [...INITIAL_PROVIDERS];

  public async getMatchedProviders(recipientId?: string): Promise<Provider[]> {
    // In production, this will invoke the match scoring algorithm or backend API
    return [...this.providers];
  }

  public async getMapCaregivers(): Promise<Provider[]> {
    return [...this.providers];
  }

  public async getProviderById(id: string): Promise<Provider | null> {
    const provider = this.providers.find(p => p.id === id);
    return provider || null;
  }

  /**
   * Rule 14 Verification Checker:
   * Validates claims against the underlying TrustRecord
   */
  public verifyTrustClaims(provider: Provider): {
    isIdentityVerified: boolean;
    isBackgroundChecked: boolean;
    isLicenseVerified: boolean;
  } {
    if (provider.trustRecord) {
      return {
        isIdentityVerified: Boolean(provider.trustRecord.isIdentityVerified),
        isBackgroundChecked: Boolean(provider.trustRecord.isBackgroundChecked),
        isLicenseVerified: Boolean(provider.trustRecord.isLicenseVerified)
      };
    }
    return {
      isIdentityVerified: Boolean(provider.isIdentityVerified),
      isBackgroundChecked: Boolean(provider.isBackgroundChecked),
      isLicenseVerified: Boolean(provider.isLicenseVerified)
    };
  }
}

export const providerService = new ProviderService();
