import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Simulated device data
const deviceId = 'CC-001-XYZ'; // Replace with your actual device ID
const baseLocation = {
  latitude: 28.7041,
  longitude: 77.1025
};

// Function to generate random movement
function randomMovement() {
  return (Math.random() - 0.5) * 0.001; // Small random movement
}

// Function to simulate device updates
async function simulateDeviceUpdate() {
  try {
    const data = {
      device_id: deviceId,
      rfid_tag: `RFID-${Math.floor(Math.random() * 1000)}`,
      latitude: baseLocation.latitude + randomMovement(),
      longitude: baseLocation.longitude + randomMovement(),
      battery_level: Math.floor(Math.random() * 20) + 80, // 80-100%
      signal_strength: Math.floor(Math.random() * 30) + 70 // 70-100%
    };

    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/device-update`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log('Update sent:', data);
    console.log('Response:', result);
  } catch (error) {
    console.error('Error sending update:', error);
  }
}

// Run simulation every 5 seconds
console.log('Starting device simulator...');
setInterval(simulateDeviceUpdate, 5000);
simulateDeviceUpdate(); // Run once immediately