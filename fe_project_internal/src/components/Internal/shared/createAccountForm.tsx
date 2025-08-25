"use client";

import React from "react";

import { useState } from "react";
import type { CreateAccountFormProps, CreateAccountData } from "../types";
import { X, AlertCircle, User, Mail, Shield, MapPin, Phone, Calendar, Building, Award } from "lucide-react";

export default function CreateAccountForm({
  userType,
  availableRoles,
  availableLocations,
  onSubmit,
  onCancel,
  isLoading = false,
}: CreateAccountFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    location: "",
    phone: "",
    gender: "",
    dob: "",
    note: "",
    department: "",
    level: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminLocationInfo, setAdminLocationInfo] = useState<{ id: string; name: string }>({ id: "", name: "" });

  const isAdmin = userType === "admin";
  const isStaff = userType === "staff";

  // Lấy thông tin location từ localStorage của admin
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("nextu_internal_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const locationId = user.location;
        const propertyName = user.property_name || "Unknown Location";
        
        setAdminLocationInfo({ id: locationId, name: propertyName });
        setForm(prev => ({ ...prev, location: locationId }));
      }
    }
  }, []);

  // Nếu là staff, tự động gán location từ availableLocations (nếu có)
  React.useEffect(() => {
    if (isStaff && Array.isArray(availableLocations) && availableLocations.length > 0) {
      setForm((prev) => ({ ...prev, location: availableLocations[0].id }));
    }
  }, [isStaff, availableLocations]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Required field validation
    if (!form.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.role) {
      newErrors.role = "Role is required";
    }

    if (!form.location) {
      newErrors.location = "Location is required";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!form.gender.trim()) {
      newErrors.gender = "Gender is required";
    }

    if (!form.dob) {
      newErrors.dob = "Date of birth is required";
    }

    if (!form.department.trim()) {
      newErrors.department = "Department is required";
    }

    if (!form.level.trim()) {
      newErrors.level = "Level is required";
    }

    if (isAdmin && !form.password.trim()) {
      newErrors.password = "Password is required for admin accounts";
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
      const submitData: any = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        location: form.location,
        profileInfo: {
          phone: form.phone.trim(),
          gender: form.gender.trim(),
          dob: form.dob,
          locationId: form.location,
          note: form.note.trim(),
          department: form.department.trim(),
          level: form.level.trim(),
        }
      };
      
      if (isAdmin) submitData.password = form.password;
      
      await onSubmit(submitData);
      
      // Reset form on success
      setForm({
        name: "",
        email: "",
        password: "",
        role: "",
        location: "",
        phone: "",
        gender: "",
        dob: "",
        note: "",
        department: "",
        level: "",
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
    options?: { value: string; label: string }[],
    required: boolean = true
  ) => (
    <div className="space-y-1.5">
      <label className="flex items-center text-sm font-medium text-gray-700">
        {icon && <span className="mr-1.5 text-gray-500">{icon}</span>}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {type === "select" ? (
        <select
          required={required}
          disabled={isFormDisabled}
          value={form[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors[field] ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
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
      )}
      
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
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white bg-opacity-20 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Create {userType.charAt(0).toUpperCase() + userType.slice(1)} Account
                </h3>
                <p className="text-blue-100 text-xs">Fill in the information below to create a new account</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              disabled={isFormDisabled}
              className="text-white hover:text-blue-100 disabled:opacity-50 transition-colors p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg"
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
                <User className="h-4 w-4 mr-2 text-blue-600" />
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {renderField("name", "Full Name", "text", "Enter full name", <User className="h-4 w-4" />)}
                {renderField("email", "Email Address", "email", "Enter email address", <Mail className="h-4 w-4" />)}
                {isAdmin && renderField("password", "Password", "password", "Enter password", <Shield className="h-4 w-4" />)}
              </div>
            </div>

            {/* Role & Location Section */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-blue-600" />
                Role & Location
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Shield className="h-4 w-4 mr-1.5 text-gray-500" />
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    disabled={isFormDisabled}
                    value={form.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.role ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <option value="">Select role</option>
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <div className="flex items-center text-xs text-red-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.role}
                    </div>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <MapPin className="h-4 w-4 mr-1.5 text-gray-500" />
                    Location
                  </label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700">
                    {adminLocationInfo.name || "Loading location..."}
                  </div>
                  
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <User className="h-4 w-4 mr-2 text-blue-600" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {renderField("phone", "Phone Number", "tel", "Enter phone number", <Phone className="h-4 w-4" />)}
                {renderField("gender", "Gender", "select", "", <User className="h-4 w-4" />, [
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" }
                ])}
                {renderField("dob", "Date of Birth", "date", "", <Calendar className="h-4 w-4" />)}
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <Building className="h-4 w-4 mr-2 text-blue-600" />
                Professional Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {renderField("department", "Department", "text", "Enter department", <Building className="h-4 w-4" />)}
                {renderField("level", "Level", "select", "", <Award className="h-4 w-4" />, [
                  { value: "Junior", label: "Junior" },
                  { value: "Senior", label: "Senior" },
                  { value: "Lead", label: "Lead" },
                  { value: "Manager", label: "Manager" }
                ])}
                {renderField("note", "Note", "text", "Enter note (optional)", <User className="h-4 w-4" />, undefined, false)}
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
                className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                {isFormDisabled ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4" />
                    <span>Create Account</span>
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

