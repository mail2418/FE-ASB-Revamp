'use client';

import React, { useState, useEffect } from 'react';
import { AdminUser, ROLE_LABELS, ROLE_COLORS } from '@/types/admin';
import AvatarUpload from './AvatarUpload';
import { Edit2, Save, X, User, Briefcase, Mail, Shield, CheckCircle } from 'lucide-react';

interface ProfilePageProps {
  userId: string;
  currentUserId?: string;
  isAdmin?: boolean;
}

export default function ProfilePage({ userId, currentUserId, isAdmin = false }: ProfilePageProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    jobPosition: '',
    avatar: '',
  });

  // Check if current user can edit this profile
  const canEdit = userId === currentUserId || isAdmin;

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/profile/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        method: 'GET',
      });
      
      if (!response.ok) {
        setError('Failed to load profile');
        setLoading(false);
        return;
      }
      
      const profile = await response.json();
      
      if (profile) {
        setUser(profile);
        setFormData({
          name: profile.name || '',
          displayName: profile.displayName || '',
          jobPosition: profile.jobPosition || '',
          avatar: profile.avatar || '',
        });
      } else {
        setError('Failed to load profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
    }
    
    setLoading(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSuccessMessage(null);
  };

  const handleCancel = () => {
    // Reset form to original data
    if (user) {
      setFormData({
        name: user.name || '',
        displayName: user.displayName || '',
        jobPosition: user.jobPosition || '',
        avatar: user.avatar || '',
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          displayName: formData.displayName,
          jobPosition: formData.jobPosition,
          avatar: formData.avatar,
        }),
      });

      const result = await response.json();

      setSaving(false);

      if (response.ok && result.success && result.user) {
        setUser(result.user);
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);

        // Reload page to update header if current user updated their own profile
        if (userId === currentUserId) {
          window.location.reload();
        }
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // IF NO USER 
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Failed to load profile</p>
          {error && <p className="mt-2 text-gray-600">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with gradient */}
        <div className="h-32 bg-gradient-to-r from-orange-500 to-orange-600"></div>
        
        {/* Profile Content */}
        <div className="px-8 pb-8">
          {/* Avatar - positioned to overlap header */}
          <div className="-mt-16 mb-6">
            <AvatarUpload
              currentAvatar={isEditing ? formData.avatar : user.avatar}
              userName={user.name}
              onAvatarChange={(dataUrl) => handleInputChange('avatar', dataUrl)}
              disabled={!isEditing}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mb-6">
            {!isEditing && canEdit && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
            
            {isEditing && (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={saving}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={saving}
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {/* Profile Fields */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-lg text-gray-900">{user.name}</p>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                Display Name
                <span className="text-xs text-gray-500 font-normal">(Optional)</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter display name"
                />
              ) : (
                <p className="text-lg text-gray-900">
                  {user.displayName || <span className="text-gray-400 italic">Not set</span>}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4" />
                Username
              </label>
              <p className="text-lg text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                {user.username}
              </p>
              <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
            </div>

            {/* Job Position */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4" />
                Job Position
                <span className="text-xs text-gray-500 font-normal">(Optional)</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.jobPosition}
                  onChange={(e) => handleInputChange('jobPosition', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your job position"
                />
              ) : (
                <p className="text-lg text-gray-900">
                  {user.jobPosition || <span className="text-gray-400 italic">Not set</span>}
                </p>
              )}
            </div>

            {/* Role - Read Only */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Shield className="w-4 h-4" />
                Role in System
              </label>
              <div className="inline-flex">
                <span
                  className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                    ROLE_COLORS[user.role]
                  }`}
                >
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Only administrators can change user roles
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
