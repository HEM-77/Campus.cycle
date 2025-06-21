import React, { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
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

  useEffect(() => {
    const initMap = async () => {
      try {
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
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();
  }, [cycles]);

  // Update marker states when cycles update
  useEffect(() => {
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

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[400px] rounded-lg overflow-hidden"
      style={{ border: '1px solid #E5E7EB' }}
    />
  );
};

export default CycleMap;