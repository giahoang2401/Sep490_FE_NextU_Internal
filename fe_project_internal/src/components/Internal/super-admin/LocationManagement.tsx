"use client";

import { useState, useEffect } from "react";
import api from "../../../utils/axiosConfig";
import {
  MapPin,
  Building2,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
} from "lucide-react";
import type {
  City,
  LocationDetail,
  Property,
  CreateCityData,
  CreateLocationData,
  CreatePropertyData,
  UpdateCityData,
  UpdateLocationData,
  UpdatePropertyData,
} from "../types";

export default function LocationManagement() {
  const [activeTab, setActiveTab] = useState<"cities" | "locations" | "properties">("cities");
  const [cities, setCities] = useState<City[]>([]);
  const [locations, setLocations] = useState<LocationDetail[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  
  // Form states
  const [showCityForm, setShowCityForm] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  
  // Edit states
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [editingLocation, setEditingLocation] = useState<LocationDetail | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  
  // Form data
  const [cityFormData, setCityFormData] = useState<CreateCityData>({ name: "", description: "" });
  const [locationFormData, setLocationFormData] = useState<CreateLocationData>({ cityId: "", name: "", description: "" });
  const [propertyFormData, setPropertyFormData] = useState<CreatePropertyData>({ locationId: "", name: "", description: "" });

  // Loading states
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
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // City operations
  const handleCreateCity = async () => {
    try {
      await api.post("/api/basePosition/cities", cityFormData);
      setShowCityForm(false);
      setCityFormData({ name: "", description: "" });
      fetchData();
    } catch (error) {
      console.error("Failed to create city:", error);
    }
  };

  const handleUpdateCity = async () => {
    if (!editingCity) return;
    try {
      await api.put(`/api/basePosition/cities/${editingCity.id}`, cityFormData);
      setEditingCity(null);
      setCityFormData({ name: "", description: "" });
      fetchData();
    } catch (error) {
      console.error("Failed to update city:", error);
    }
  };

  const handleEditCity = (city: City) => {
    setEditingCity(city);
    setCityFormData({ name: city.name, description: city.description });
  };

  // Location operations
  const handleCreateLocation = async () => {
    try {
      await api.post("/api/basePosition/locations", locationFormData);
      setShowLocationForm(false);
      setLocationFormData({ cityId: "", name: "", description: "" });
      fetchData();
    } catch (error) {
      console.error("Failed to create location:", error);
    }
  };

  const handleUpdateLocation = async () => {
    if (!editingLocation) return;
    try {
      await api.put(`/api/basePosition/locations/${editingLocation.id}`, locationFormData);
      setEditingLocation(null);
      setLocationFormData({ cityId: "", name: "", description: "" });
      fetchData();
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  };

  const handleEditLocation = (location: LocationDetail) => {
    setEditingLocation(location);
    setLocationFormData({ cityId: location.cityId, name: location.name, description: location.description || "" });
  };

  // Property operations
  const handleCreateProperty = async () => {
    try {
      await api.post("/api/basePosition/properties", propertyFormData);
      setShowPropertyForm(false);
      setPropertyFormData({ locationId: "", name: "", description: "" });
      fetchData();
    } catch (error) {
      console.error("Failed to create property:", error);
    }
  };

  const handleUpdateProperty = async () => {
    if (!editingProperty) return;
    try {
      await api.put(`/api/basePosition/properties/${editingProperty.id}`, propertyFormData);
      setEditingProperty(null);
      setPropertyFormData({ locationId: "", name: "", description: "" });
      fetchData();
    } catch (error) {
      console.error("Failed to update property:", error);
    }
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setPropertyFormData({ locationId: property.locationId, name: property.name, description: property.description || "" });
  };

  const resetForms = () => {
    setShowCityForm(false);
    setShowLocationForm(false);
    setShowPropertyForm(false);
    setEditingCity(null);
    setEditingLocation(null);
    setEditingProperty(null);
    setCityFormData({ name: "", description: "" });
    setLocationFormData({ cityId: "", name: "", description: "" });
    setPropertyFormData({ locationId: "", name: "", description: "" });
  };

  const getCityName = (cityId: string) => {
    const city = cities.find(c => c.id === cityId);
    return city?.name || "Unknown City";
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    return location?.name || "Unknown Location";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Địa điểm</h1>
          <p className="text-gray-600">Quản lý hệ thống phân cấp địa điểm: Thành phố → Khu vực → Tài sản</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "cities", label: "Thành phố", icon: MapPin, count: cities.length },
            { id: "locations", label: "Khu vực", icon: Building2, count: locations.length },
            { id: "properties", label: "Tài sản", icon: MapPin, count: properties.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
              <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Cities Tab */}
        {activeTab === "cities" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Danh sách Thành phố</h2>
              <button
                onClick={() => setShowCityForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm Thành phố
              </button>
            </div>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {cities.map((city) => (
                  <li key={city.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{city.name}</h3>
                        <p className="text-sm text-gray-500">{city.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCity(city)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Locations Tab */}
        {activeTab === "locations" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Danh sách Khu vực</h2>
              <button
                onClick={() => setShowLocationForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm Khu vực
              </button>
            </div>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {locations.map((location) => (
                  <li key={location.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{location.name}</h3>
                        <p className="text-sm text-gray-500">{location.description || "Không có mô tả"}</p>
                        <p className="text-xs text-gray-400">Thuộc: {location.cityName}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditLocation(location)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Danh sách Tài sản</h2>
              <button
                onClick={() => setShowPropertyForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm Tài sản
              </button>
            </div>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {properties.map((property) => (
                  <li key={property.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{property.name}</h3>
                        <p className="text-sm text-gray-500">{property.description || "Không có mô tả"}</p>
                        <p className="text-xs text-gray-400">
                          Thuộc: {property.locationName} → {property.cityName}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditProperty(property)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* City Form Modal */}
      {(showCityForm || editingCity) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCity ? "Chỉnh sửa Thành phố" : "Thêm Thành phố mới"}
              </h3>
              <button onClick={resetForms} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); editingCity ? handleUpdateCity() : handleCreateCity(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên thành phố</label>
                  <input
                    type="text"
                    value={cityFormData.name}
                    onChange={(e) => setCityFormData({ ...cityFormData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                  <textarea
                    value={cityFormData.description}
                    onChange={(e) => setCityFormData({ ...cityFormData, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForms}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    {editingCity ? "Cập nhật" : "Thêm"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Location Form Modal */}
      {(showLocationForm || editingLocation) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingLocation ? "Chỉnh sửa Khu vực" : "Thêm Khu vực mới"}
              </h3>
              <button onClick={resetForms} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); editingLocation ? handleUpdateLocation() : handleCreateLocation(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Thành phố</label>
                  <select
                    value={locationFormData.cityId}
                    onChange={(e) => setLocationFormData({ ...locationFormData, cityId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Chọn thành phố</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên khu vực</label>
                  <input
                    type="text"
                    value={locationFormData.name}
                    onChange={(e) => setLocationFormData({ ...locationFormData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                  <textarea
                    value={locationFormData.description}
                    onChange={(e) => setLocationFormData({ ...locationFormData, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForms}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    {editingLocation ? "Cập nhật" : "Thêm"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Property Form Modal */}
      {(showPropertyForm || editingProperty) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingProperty ? "Chỉnh sửa Tài sản" : "Thêm Tài sản mới"}
              </h3>
              <button onClick={resetForms} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); editingProperty ? handleUpdateProperty() : handleCreateProperty(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Khu vực</label>
                  <select
                    value={propertyFormData.locationId}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, locationId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Chọn khu vực</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name} ({location.cityName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên tài sản</label>
                  <input
                    type="text"
                    value={propertyFormData.name}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                  <textarea
                    value={propertyFormData.description}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForms}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    {editingProperty ? "Cập nhật" : "Thêm"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
