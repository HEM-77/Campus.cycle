import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bike, Shield, MapPin, Battery, Wifi } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
              <div className="w-48 h-48 bg-indigo-100 rounded-full blur-3xl"></div>
            </div>
            <Bike className="w-24 h-24 mx-auto text-indigo-600 animate-bounce" />
          </div>
          
          <h1 className="mt-8 text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl md:text-7xl">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              CycleSync
            </span>
            <span className="block text-3xl mt-3 text-gray-600">
              Smart Cycling for a Connected Campus
            </span>
          </h1>
          
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            Track, secure, and manage your bicycle with cutting-edge IoT technology. Experience the future of campus mobility.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/register"
              className="transform hover:scale-105 transition-all px-8 py-3 rounded-full text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg"
            >
              Get Started
              <ArrowRight className="inline-block ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 rounded-full text-indigo-600 bg-white border-2 border-indigo-100 hover:border-indigo-200 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-6 bg-white ring-1 ring-gray-900/5 rounded-lg leading-none flex items-top justify-start space-x-6">
              <Shield className="w-8 h-8 text-indigo-600" />
              <div className="space-y-2">
                <p className="text-slate-800 font-semibold">Smart Security</p>
                <p className="text-slate-600">Advanced locking system with real-time alerts and tamper detection</p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-6 bg-white ring-1 ring-gray-900/5 rounded-lg leading-none flex items-top justify-start space-x-6">
              <MapPin className="w-8 h-8 text-indigo-600" />
              <div className="space-y-2">
                <p className="text-slate-800 font-semibold">Live Tracking</p>
                <p className="text-slate-600">Real-time location tracking with detailed ride history and analytics</p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-6 bg-white ring-1 ring-gray-900/5 rounded-lg leading-none flex items-top justify-start space-x-6">
              <Battery className="w-8 h-8 text-indigo-600" />
              <div className="space-y-2">
                <p className="text-slate-800 font-semibold">Smart Monitoring</p>
                <p className="text-slate-600">Monitor battery levels, signal strength, and device health in real-time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative rounded-2xl overflow-hidden group transition-all hover:scale-105">
            <img 
              src="https://images.unsplash.com/photo-1571333250630-f0230c320b6d?auto=format&fit=crop&w=800&q=80"
              alt="Smart Bike"
              className="w-full h-[300px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h3 className="text-xl font-semibold">Smart IoT Integration</h3>
                <p className="mt-2">Advanced sensors and real-time connectivity</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden group transition-all hover:scale-105">
            <img 
              src="https://images.unsplash.com/photo-1468436385273-8abca6dfd8d3?auto=format&fit=crop&w=800&q=80"
              alt="Campus View"
              className="w-full h-[300px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h3 className="text-xl font-semibold">Campus-wide Coverage</h3>
                <p className="mt-2">Seamless tracking across your entire campus</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-32 bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600">99.9%</div>
              <div className="mt-2 text-gray-600">Uptime Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600">24/7</div>
              <div className="mt-2 text-gray-600">Real-time Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600">100m</div>
              <div className="mt-2 text-gray-600">Location Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Animation Elements */}
      <div className="fixed top-20 left-10 animate-bounce delay-100">
        <Wifi className="w-6 h-6 text-indigo-300" />
      </div>
      <div className="fixed top-40 right-10 animate-bounce delay-300">
        <MapPin className="w-6 h-6 text-indigo-300" />
      </div>
      <div className="fixed bottom-20 left-20 animate-bounce delay-500">
        <Shield className="w-6 h-6 text-indigo-300" />
      </div>
    </div>
  );
}