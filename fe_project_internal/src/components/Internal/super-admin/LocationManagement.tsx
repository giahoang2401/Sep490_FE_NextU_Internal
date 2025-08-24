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
  Upload,
  Image as ImageIcon,
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
  const [propertyFormData, setPropertyFormData] = useState<CreatePropertyData>({ locationId: "", name: "", description: "", coverImage: "" });

  // Image upload states for property
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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

  // Image upload function for property
  const uploadImage = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('File', file);
      
      const response = await api.post('/api/Files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update form data with image URL and blob name
      setPropertyFormData(prev => ({
        ...prev,
        coverImage: response.data.url
      }));
      
      return response.data;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle image selection for property
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload image immediately
      uploadImage(file);
    }
  };

  // Remove image for property
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setPropertyFormData(prev => ({
      ...prev,
      coverImage: ""
    }));
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
      setPropertyFormData({ locationId: "", name: "", description: "", coverImage: "" });
      setSelectedImage(null);
      setImagePreview("");
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
      setPropertyFormData({ locationId: "", name: "", description: "", coverImage: "" });
      setSelectedImage(null);
      setImagePreview("");
      fetchData();
    } catch (error) {
      console.error("Failed to update property:", error);
    }
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setPropertyFormData({ 
      locationId: property.locationId, 
      name: property.name, 
      description: property.description || "",
      coverImage: property.coverImage || ""
    });
    if (property.coverImage) {
      setImagePreview(property.coverImage);
    }
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
    setPropertyFormData({ locationId: "", name: "", description: "", coverImage: "" });
    setSelectedImage(null);
    setImagePreview("");
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
          <h1 className="text-2xl font-bold text-gray-900">Location Management</h1>
          <p className="text-gray-600">Manage location hierarchy system: City → Area → Property</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "cities", label: "Cities", icon: MapPin, count: cities.length },
            { id: "locations", label: "Areas", icon: Building2, count: locations.length },
            { id: "properties", label: "Properties", icon: MapPin, count: properties.length },
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
              <h2 className="text-lg font-medium text-gray-900">Cities List</h2>
              <button
                onClick={() => setShowCityForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add City
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
              <h2 className="text-lg font-medium text-gray-900">Areas List</h2>
              <button
                onClick={() => setShowLocationForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Area
              </button>
            </div>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {locations.map((location) => (
                  <li key={location.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{location.name}</h3>
                        <p className="text-sm text-gray-500">{location.description || "No description"}</p>
                        <p className="text-xs text-gray-400">Belongs to: {location.cityName}</p>
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
              <h2 className="text-lg font-medium text-gray-900">Properties List</h2>
              <button
                onClick={() => setShowPropertyForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </button>
            </div>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {properties.map((property) => (
                  <li key={property.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{property.name}</h3>
                        <p className="text-sm text-gray-500">{property.description || "No description"}</p>
                        <p className="text-xs text-gray-400">
                          Belongs to: {property.locationName} → {property.cityName}
                        </p>
                        {property.coverImage && (
                          <div className="mt-2">
                            <img 
                              src={property.coverImage} 
                              alt={property.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          </div>
                        )}
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
                {editingCity ? "Edit City" : "Add New City"}
              </h3>
              <button onClick={resetForms} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); editingCity ? handleUpdateCity() : handleCreateCity(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City Name</label>
                  <input
                    type="text"
                    value={cityFormData.name}
                    onChange={(e) => setCityFormData({ ...cityFormData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    {editingCity ? "Update" : "Add"}
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
                {editingLocation ? "Edit Area" : "Add New Area"}
              </h3>
              <button onClick={resetForms} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); editingLocation ? handleUpdateLocation() : handleCreateLocation(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <select
                    value={locationFormData.cityId}
                    onChange={(e) => setLocationFormData({ ...locationFormData, cityId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select city</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Area Name</label>
                  <input
                    type="text"
                    value={locationFormData.name}
                    onChange={(e) => setLocationFormData({ ...locationFormData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    {editingLocation ? "Update" : "Add"}
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
                {editingProperty ? "Edit Property" : "Add New Property"}
              </h3>
              <button onClick={resetForms} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); editingProperty ? handleUpdateProperty() : handleCreateProperty(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Area</label>
                  <select
                    value={propertyFormData.locationId}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, locationId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select area</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name} ({location.cityName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Name</label>
                  <input
                    type="text"
                    value={propertyFormData.name}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={propertyFormData.description}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                
                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mb-3 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  {!imagePreview && (
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageSelect}
                          disabled={isUploadingImage}
                        />
                      </label>
                    </div>
                  )}
                  
                  {/* Upload Progress */}
                  {isUploadingImage && (
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Uploading image...
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForms}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    {editingProperty ? "Update" : "Add"}
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
