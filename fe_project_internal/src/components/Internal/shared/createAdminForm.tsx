"use client";

import React, { useState } from "react";
import { X, AlertCircle, User, Mail, Shield, MapPin } from "lucide-react";

interface CreateAdminFormProps {
  availableLocations: Array<{
    id: string;
    name: string;
    description: string;
    locationId: string;
    locationName: string;
    cityId: string;
    cityName: string;
  }>;
  onSubmit: (data: {
    userName: string;
    email: string;
    password: string;
    locationId: string;
    skipEmailVerification: boolean;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CreateAdminForm({
  availableLocations,
  onSubmit,
  onCancel,
  isLoading = false,
}: CreateAdminFormProps) {
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    locationId: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!form.userName.trim()) {
      newErrors.userName = "Username is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!form.locationId) {
      newErrors.locationId = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        userName: form.userName.trim(),
        email: form.email.trim(),
        password: form.password,
        locationId: form.locationId,
        skipEmailVerification: true,
      };
      
      await onSubmit(submitData);
      
      // Reset form on success
      setForm({
        userName: "",
        email: "",
        password: "",
        locationId: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const isFormDisabled = isLoading || isSubmitting;

  const renderField = (
    field: keyof typeof form,
    label: string,
    type: string = "text",
    placeholder: string = "",
    icon: React.ReactNode = null,
    required: boolean = true
  ) => (
    <div className="space-y-1.5">
      <label className="flex items-center text-sm font-medium text-gray-700">
        {icon && <span className="mr-1.5 text-gray-500">{icon}</span>}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <input
        type={type}
        required={required}
        disabled={isFormDisabled}
        value={form[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          errors[field] ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
        }`}
        placeholder={placeholder}
      />
      
      {errors[field] && (
        <div className="flex items-center text-xs text-red-600">
          <AlertCircle className="h-3 w-3 mr-1" />
          {errors[field]}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white bg-opacity-20 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Create Admin Account
                </h3>
                <p className="text-purple-100 text-xs">Add new regional administrator</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              disabled={isFormDisabled}
              className="text-white hover:text-purple-100 disabled:opacity-50 transition-colors p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information Section */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <User className="h-4 w-4 mr-2 text-purple-600" />
                Admin Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {renderField("userName", "Username", "text", "Enter username", <User className="h-4 w-4" />)}
                {renderField("email", "Email Address", "email", "Enter email address", <Mail className="h-4 w-4" />)}
              </div>
              <div className="mt-3">
                {renderField("password", "Password", "password", "Enter password", <Shield className="h-4 w-4" />)}
              </div>
            </div>

            {/* Location Selection Section */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                Location Assignment
              </h4>
              <div className="space-y-1.5">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <MapPin className="h-4 w-4 mr-1.5 text-gray-500" />
                  Select Location <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  disabled={isFormDisabled}
                  value={form.locationId}
                  onChange={(e) => handleChange("locationId", e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.locationId ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <option value="">Select a location</option>
                  {availableLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.locationName}, {location.cityName})
                    </option>
                  ))}
                </select>
                {errors.locationId && (
                  <div className="flex items-center text-xs text-red-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.locationId}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  The admin will be assigned to manage this specific location
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                disabled={isFormDisabled}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isFormDisabled}
                className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                {isFormDisabled ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    <span>Create Admin</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
