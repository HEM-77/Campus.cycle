import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bike, Lock, Unlock, MapPin, Bell, Settings, History, Battery, Signal, Wifi, Plus } from 'lucide-react';
import { getUserCycles, toggleCycleLock, getCycleStats, isAdmin } from '../lib/supabase';
import type { Cycle, CycleStats } from '../types/supabase';
import toast from 'react-hot-toast';
import RegisterCycleModal from '../components/RegisterCycleModal';
import CycleMap from '../components/CycleMap';

function Dashboard() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [cycleStats, setCycleStats] = useState<Record<string, CycleStats>>({});
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<string>();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const adminStatus = await isAdmin();
        setIsAdminUser(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        // Silently fail and default to non-admin
        setIsAdminUser(false);
      }
    };

    checkAdminStatus();
  }, []);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const cyclesData = await getUserCycles();
        setCycles(cyclesData);
        
        // Fetch stats for each cycle
        const stats: Record<string, CycleStats> = {};
        await Promise.all(
          cyclesData.map(async (cycle) => {
            const cycleStats = await getCycleStats(cycle.id);
            stats[cycle.id] = cycleStats;
          })
        );
        setCycleStats(stats);
      } catch (error) {
        console.error('Error fetching cycles:', error);
        toast.error('Failed to fetch cycles');
      } finally {
        setLoading(false);
      }
    };

    fetchCycles();
  }, []);

  const handleLockToggle = async (cycleId: string, currentLockState: boolean) => {
    try {
      await toggleCycleLock(cycleId, !currentLockState);
      setCycles(cycles.map(cycle => 
        cycle.id === cycleId 
          ? { ...cycle, is_locked: !currentLockState }
          : cycle
      ));
      toast.success(`Cycle ${currentLockState ? 'unlocked' : 'locked'} successfully`);
    } catch (error) {
      console.error('Error toggling lock:', error);
      toast.error('Failed to toggle lock');
    }
  };

  const stats = [
    { 
      label: 'Total Cycles', 
      value: cycles.length.toString(), 
      icon: Bike 
    },
    { 
      label: 'Locked Cycles', 
      value: cycles.filter(c => c.is_locked).length.toString(), 
      icon: Lock 
    },
    { 
      label: 'Total Distance', 
      value: Object.values(cycleStats)
        .reduce((acc, stat) => acc + (stat?.total_distance || 0), 0)
        .toFixed(1) + ' km', 
      icon: MapPin 
    },
    { 
      label: 'Total Rides', 
      value: Object.values(cycleStats)
        .reduce((acc, stat) => acc + (stat?.total_rides || 0), 0)
        .toString(), 
      icon: History 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.user_metadata?.name || 'Rider'}!
            </h1>
            <p className="text-gray-600 mt-1">
              {isAdminUser ? 'Admin Dashboard' : 'Here\'s what\'s happening with your cycles'}
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Register Cycle
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
              <Bell className="h-6 w-6" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
              <Settings className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <stat.icon className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Map View */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Live Tracking</h2>
          <CycleMap
            cycles={cycles}
            selectedCycle={selectedCycle}
            onCycleSelect={setSelectedCycle}
          />
        </div>

        {/* Cycles Grid */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Your Cycles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cycles.map((cycle) => (
              <div 
                key={cycle.id} 
                className={`bg-gray-50 rounded-lg p-6 ${
                  selectedCycle === cycle.id ? 'ring-2 ring-indigo-500' : ''
                }`}
                onClick={() => setSelectedCycle(cycle.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{cycle.model}</h3>
                    <p className="text-gray-600">{cycle.device_id}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLockToggle(cycle.id, cycle.is_locked);
                      }}
                      className={`p-2 rounded-lg ${
                        cycle.is_locked
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {cycle.is_locked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                    </button>
                    <button
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCycle(cycle.id);
                      }}
                    >
                      <MapPin className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <Battery className="h-5 w-5 mx-auto text-gray-600" />
                    <p className="text-sm mt-1">{cycle.battery_level || 'N/A'}%</p>
                  </div>
                  <div className="text-center">
                    <Signal className="h-5 w-5 mx-auto text-gray-600" />
                    <p className="text-sm mt-1">{cycle.signal_strength || 'N/A'}%</p>
                  </div>
                  <div className="text-center">
                    <Wifi className="h-5 w-5 mx-auto text-gray-600" />
                    <p className="text-sm mt-1">
                      {new Date(cycle.last_sync).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Distance</p>
                      <p className="font-semibold">
                        {(cycleStats[cycle.id]?.total_distance || 0).toFixed(1)} km
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Rides</p>
                      <p className="font-semibold">
                        {cycleStats[cycle.id]?.total_rides || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <RegisterCycleModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={() => {
          setShowRegisterModal(false);
          window.location.reload();
        }}
      />
    </div>
  );
}

export default Dashboard;