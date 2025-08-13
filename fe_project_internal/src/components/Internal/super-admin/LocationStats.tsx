"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../utils/axiosConfig";
import { MapPin, Building2, Plus } from "lucide-react";
import type { City, LocationDetail, Property } from "../types";

export default function LocationStats() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [locations, setLocations] = useState<LocationDetail[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [citiesRes, locationsRes, propertiesRes] = await Promise.all([
        api.get("/api/basePosition/cities"),
        api.get("/api/basePosition/locations"),
        api.get("/api/basePosition/properties"),
      ]);
      
      setCities(citiesRes.data.data || []);
      setLocations(locationsRes.data.data || []);
      setProperties(propertiesRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch location data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Location Overview</h3>
        <button
          onClick={() => router.push('/super-admin/locations')}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
        >
          <Plus className="h-4 w-4 mr-1" />
          Manage
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{cities.length}</div>
          <div className="text-sm text-gray-500">Cities</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full">
            <Building2 className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{locations.length}</div>
          <div className="text-sm text-gray-500">Locations</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-full">
            <MapPin className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{properties.length}</div>
          <div className="text-sm text-gray-500">Properties</div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between items-center mb-1">
            <span>Recent Activity:</span>
          </div>
          {cities.length > 0 && (
            <div className="text-xs text-gray-500">
              Latest: {cities[cities.length - 1]?.name} city added
            </div>
          )}
          {locations.length > 0 && (
            <div className="text-xs text-gray-500">
              Latest: {locations[locations.length - 1]?.name} location added
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
