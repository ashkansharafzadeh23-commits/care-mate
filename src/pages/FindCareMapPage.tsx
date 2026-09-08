import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Star, ShieldCheck, Car, Layers, Navigation } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary, MapControl, ControlPosition } from '@vis.gl/react-google-maps';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/Button';

// Mock caregivers
const CAREGIVERS = [
  {
    id: '1',
    name: 'Sarah Johnson',
    lat: 37.7749,
    lng: -122.4194,
    rating: 4.9,
    reviews: 124,
    rate: 28,
    avatarUrl: 'https://i.pravatar.cc/150?u=sarah',
    verified: true,
    specialties: ['dementia', 'mobility'],
    availability: 'today',
  },
  {
    id: '2',
    name: 'Michael Chen',
    lat: 37.7849,
    lng: -122.4094,
    rating: 4.8,
    reviews: 98,
    rate: 25,
    avatarUrl: 'https://i.pravatar.cc/150?u=michael',
    verified: true,
    specialties: ['mobility'],
    availability: 'this_week',
  },
  {
    id: '3',
    name: 'Emily Davis',
    lat: 37.7649,
    lng: -122.4294,
    rating: 4.9,
    reviews: 156,
    rate: 30,
    avatarUrl: 'https://i.pravatar.cc/150?u=emily',
    verified: true,
    specialties: ['dementia'],
    availability: 'today',
  }
];

function MapUpdater({ selectedLat, selectedLng }: { selectedLat?: number; selectedLng?: number }) {
  const map = useMap('DEMO_MAP_ID');
  useEffect(() => {
    if (map && selectedLat && selectedLng) {
      map.panTo({ lat: selectedLat, lng: selectedLng });
    }
  }, [map, selectedLat, selectedLng]);
  return null;
}

function DistanceCalculator({
  selectedProvider,
  onTimeFetched
}: {
  selectedProvider: any;
  onTimeFetched: (time: string | null) => void;
}) {
  const routesLib = useMapsLibrary('routes');
  
  useEffect(() => {
    if (!routesLib || !selectedProvider) {
      onTimeFetched(null);
      return;
    }
    
    // Clear previous time before fetching
    onTimeFetched(null);

    const service = new routesLib.DistanceMatrixService();
    service.getDistanceMatrix({
      origins: [{ lat: 37.7749, lng: -122.4194 }], // User's mock location
      destinations: [{ lat: selectedProvider.lat, lng: selectedProvider.lng }],
      travelMode: google.maps.TravelMode.DRIVING,
    }, (response, status) => {
      if (status === 'OK' && response) {
        const element = response.rows?.[0]?.elements?.[0];
        if (element?.status === 'OK') {
          onTimeFetched(element.duration.text);
        }
      }
    });
  }, [routesLib, selectedProvider, onTimeFetched]);

  return null;
}

function CustomMapControls({ 
  mapTypeId, 
  onToggleMapType 
}: { 
  mapTypeId: string; 
  onToggleMapType: () => void; 
}) {
  const { t } = useTranslation();
  const map = useMap('DEMO_MAP_ID');

  const handleCurrentLocation = () => {
    if (map) {
      // Mocking current location to center of SF
      map.panTo({ lat: 37.7749, lng: -122.4194 });
      map.setZoom(13);
    }
  };

  return (
    <MapControl position={ControlPosition.RIGHT_TOP}>
      <div className="flex flex-col gap-2 mt-4 me-4">
        <button 
          onClick={onToggleMapType}
          className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-text-700 hover:text-primary-600 transition-colors"
          title={t(mapTypeId === 'roadmap' ? 'map_controls.map_type_satellite' : 'map_controls.map_type_roadmap')}
        >
          <Layers className="w-5 h-5" />
        </button>
        <button 
          onClick={handleCurrentLocation}
          className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-text-700 hover:text-primary-600 transition-colors"
          title={t('map_controls.current_location')}
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>
    </MapControl>
  );
}

export default function FindCareMapPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useAppContext();
  
  // Use env var for key, fallback to empty string for safety (will trigger Demo Key prompt from API)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [travelTime, setTravelTime] = useState<string | null>(null);
  const [mapTypeId, setMapTypeId] = useState<string>('roadmap');
  
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');

  const filteredCaregivers = CAREGIVERS.filter(c => {
    if (filterRating === '4.5' && c.rating < 4.5) return false;
    if (filterAvailability !== 'all' && c.availability !== filterAvailability) return false;
    if (filterSpecialty !== 'all' && !c.specialties.includes(filterSpecialty)) return false;
    return true;
  });

  const selectedProvider = CAREGIVERS.find(c => c.id === selectedId);
  const listRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (selectedId && listRefs.current[selectedId]) {
      listRefs.current[selectedId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedId]);

  return (
    <div className="flex flex-col h-screen bg-surface-50 relative">
      <header className="flex flex-col bg-white border-b border-surface-200 shrink-0 z-10 pt-safe absolute top-0 left-0 right-0 shadow-sm">
        <div className="flex items-center p-4">
          <button onClick={() => navigate(-1)} className="p-2 -ms-2 text-text-700 hover:text-text-900 rounded-full hover:bg-surface-50 rtl:rotate-180">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-text-900 mx-auto text-center pointer-events-none -ms-4">
            {t('find_care_map.title')}
          </h1>
        </div>
        
        {/* Filter Bar */}
        <div className="flex items-center gap-2 px-4 pb-4 overflow-x-auto no-scrollbar">
          <select 
            value={filterRating} 
            onChange={(e) => setFilterRating(e.target.value)}
            className="bg-surface-50 border border-surface-200 text-text-700 text-sm rounded-full px-3 py-1.5 outline-none focus:border-primary-500 shrink-0 cursor-pointer"
          >
            <option value="all">{t('find_care_map.all_ratings')}</option>
            <option value="4.5">{t('find_care_map.rating_4_5')}</option>
          </select>

          <select 
            value={filterAvailability} 
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="bg-surface-50 border border-surface-200 text-text-700 text-sm rounded-full px-3 py-1.5 outline-none focus:border-primary-500 shrink-0 cursor-pointer"
          >
            <option value="all">{t('find_care_map.all_availability')}</option>
            <option value="today">{t('find_care_map.avail_today')}</option>
            <option value="this_week">{t('find_care_map.avail_this_week')}</option>
          </select>

          <select 
            value={filterSpecialty} 
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="bg-surface-50 border border-surface-200 text-text-700 text-sm rounded-full px-3 py-1.5 outline-none focus:border-primary-500 shrink-0 cursor-pointer"
          >
            <option value="all">{t('find_care_map.all_specialties')}</option>
            <option value="dementia">{t('find_care_map.spec_dementia')}</option>
            <option value="mobility">{t('find_care_map.spec_mobility')}</option>
          </select>
        </div>
      </header>

      {/* Map Section */}
      <div className="flex-1 min-h-[40vh] w-full pt-[124px]">
        {apiKey ? (
          <APIProvider apiKey={apiKey}>
            <Map
              mapId="DEMO_MAP_ID"
              defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
              defaultZoom={13}
              mapTypeId={mapTypeId}
              disableDefaultUI={true}
              gestureHandling="greedy"
              internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
            >
              <CustomMapControls 
                mapTypeId={mapTypeId} 
                onToggleMapType={() => setMapTypeId(prev => prev === 'roadmap' ? 'satellite' : 'roadmap')} 
              />
              <MapUpdater selectedLat={selectedProvider?.lat} selectedLng={selectedProvider?.lng} />
              <DistanceCalculator selectedProvider={selectedProvider} onTimeFetched={setTravelTime} />
              {filteredCaregivers.map((caregiver) => (
                <AdvancedMarker
                  key={caregiver.id}
                  position={{ lat: caregiver.lat, lng: caregiver.lng }}
                  onClick={() => setSelectedId(caregiver.id)}
                >
                  <Pin 
                    background={selectedId === caregiver.id ? '#FF7A59' : '#ffffff'} 
                    borderColor={selectedId === caregiver.id ? '#FF7A59' : '#e5e7eb'} 
                    glyphColor={selectedId === caregiver.id ? '#ffffff' : '#FF7A59'}
                    scale={selectedId === caregiver.id ? 1.2 : 1}
                  />
                </AdvancedMarker>
              ))}
            </Map>
          </APIProvider>
        ) : (
          <div className="w-full h-full bg-surface-100 flex flex-col items-center justify-center p-6 text-center text-text-500">
            <MapPin className="w-8 h-8 mb-2 text-primary-300" />
            <p>Please configure VITE_GOOGLE_MAPS_API_KEY in .env to view the interactive map.</p>
          </div>
        )}
      </div>

      {/* List Section */}
      <div className="h-[45vh] bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex flex-col shrink-0 relative z-20 pb-safe">
        <div className="w-12 h-1.5 bg-surface-200 rounded-full mx-auto mt-3 mb-2 shrink-0"></div>
        <h2 className="px-6 py-3 font-bold text-lg text-text-900 border-b border-surface-100 shrink-0">
          {t('find_care_map.nearby_caregivers')}
        </h2>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredCaregivers.map((provider) => (
            <div
              key={provider.id}
              ref={(el) => {
                if (el) listRefs.current[provider.id] = el;
              }}
              onClick={() => setSelectedId(provider.id)}
              className={`w-full bg-white border cursor-pointer ${selectedId === provider.id ? 'border-primary-500 shadow-md ring-1 ring-primary-500' : 'border-surface-200 shadow-sm hover:border-primary-200'} rounded-2xl p-4 text-start flex flex-col transition-all`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={provider.avatarUrl} alt={provider.name} className="w-14 h-14 rounded-full object-cover border border-surface-100" />
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <h3 className="font-bold text-text-900">{provider.name}</h3>
                      {provider.verified && (
                        <ShieldCheck className="w-4 h-4 text-primary-600 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center text-sm text-text-700 font-medium">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 me-1" />
                      <span dir="ltr">{provider.rating}</span> 
                      <span className="text-text-400 font-normal ms-1">({provider.reviews})</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm font-bold text-text-900 flex items-center">
                    <span dir="ltr">${provider.rate}</span><span className="text-text-500 text-xs ms-1 font-normal">/ hr</span>
                  </div>
                </div>
              </div>
              {selectedId === provider.id && (
                <div className="mt-4 pt-4 border-t border-surface-100 flex flex-col gap-3">
                  {travelTime && (
                    <div className="text-sm text-text-600 flex items-center gap-1.5 font-medium">
                      <Car className="w-4 h-4 text-primary-500 shrink-0" />
                      <span>{t('find_care_map.travel_time', { time: travelTime })}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/chat?provider=${provider.id}`);
                      }}
                    >
                      {t('find_care_map.message')}
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/book/${provider.id}`);
                      }}
                    >
                      {t('results.view_profile')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
