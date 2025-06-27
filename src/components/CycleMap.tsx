import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, AlertCircle } from 'lucide-react';
import type { Cycle } from '../types/supabase';

interface CycleMapProps {
  cycles: Cycle[];
  selectedCycle?: string;
  onCycleSelect?: (cycleId: string) => void;
}

const CycleMap: React.FC<CycleMapProps> = ({ cycles, selectedCycle, onCycleSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Record<string, google.maps.Marker>>({});
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        setMapError(null);

        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: "weekly",
        });

        const google = await loader.load();
        
        if (!mapRef.current || mapInstanceRef.current) return;

        // Default to a central location if no cycles are available
        const defaultLocation = { lat: 28.7041, lng: 77.1025 }; // New Delhi
        
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: defaultLocation,
          zoom: 12,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        // Create markers for each cycle
        cycles.forEach((cycle) => {
          if (!cycle.last_location) return;
          
          const location = {
            lat: parseFloat(cycle.last_location.coordinates[1]),
            lng: parseFloat(cycle.last_location.coordinates[0]),
          };

          const marker = new google.maps.Marker({
            position: location,
            map: mapInstanceRef.current,
            title: cycle.model,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: cycle.is_locked ? "#EF4444" : "#10B981",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
            },
          });

          marker.addListener("click", () => {
            onCycleSelect?.(cycle.id);
          });

          markersRef.current[cycle.id] = marker;
        });

        // If there are cycles, center the map on the first one
        if (cycles.length > 0 && cycles[0].last_location) {
          const firstCycle = cycles[0];
          mapInstanceRef.current.setCenter({
            lat: parseFloat(firstCycle.last_location.coordinates[1]),
            lng: parseFloat(firstCycle.last_location.coordinates[0]),
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setIsLoading(false);
        
        // Check if it's a billing error
        if (error instanceof Error && error.message.includes('BillingNotEnabledMapError')) {
          setMapError('Google Maps billing is not enabled. Please enable billing in your Google Cloud Console.');
        } else {
          setMapError('Failed to load Google Maps. Please check your API key configuration.');
        }
      }
    };

    initMap();
  }, [cycles]);

  // Update marker states when cycles update
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    cycles.forEach((cycle) => {
      const marker = markersRef.current[cycle.id];
      if (marker && cycle.last_location) {
        marker.setPosition({
          lat: parseFloat(cycle.last_location.coordinates[1]),
          lng: parseFloat(cycle.last_location.coordinates[0]),
        });
        
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: cycle.is_locked ? "#EF4444" : "#10B981",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        });
      }
    });
  }, [cycles]);

  // Handle selected cycle changes
  useEffect(() => {
    if (!selectedCycle || !mapInstanceRef.current) return;

    const selectedCycleData = cycles.find(c => c.id === selectedCycle);
    if (!selectedCycleData?.last_location) return;

    mapInstanceRef.current.panTo({
      lat: parseFloat(selectedCycleData.last_location.coordinates[1]),
      lng: parseFloat(selectedCycleData.last_location.coordinates[0]),
    });
  }, [selectedCycle, cycles]);

  // Fallback UI when map fails to load
  if (mapError) {
    return (
      <div className="w-full h-[400px] rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Unavailable</h3>
        <p className="text-sm text-gray-600 text-center mb-4">{mapError}</p>
        
        {cycles.length > 0 && (
          <div className="w-full max-w-md">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Cycle Locations:</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cycles.map((cycle) => (
                <div
                  key={cycle.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCycle === cycle.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => onCycleSelect?.(cycle.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">{cycle.model}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          cycle.is_locked ? 'bg-red-500' : 'bg-green-500'
                        }`}
                      />
                      <span className="text-xs text-gray-500">
                        {cycle.is_locked ? 'Locked' : 'Unlocked'}
                      </span>
                    </div>
                  </div>
                  {cycle.last_location && (
                    <div className="mt-1 text-xs text-gray-500">
                      Lat: {parseFloat(cycle.last_location.coordinates[1]).toFixed(6)}, 
                      Lng: {parseFloat(cycle.last_location.coordinates[0]).toFixed(6)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-[400px] rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[400px] rounded-lg overflow-hidden"
      style={{ border: '1px solid #E5E7EB' }}
    />
  );
};

export default CycleMap;