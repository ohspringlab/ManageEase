import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit, 
  Save,
  X,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || ''
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email
      });

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <div className="spinner w-8 h-8 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your account information and preferences.
        </p>
      </div>

      {/* Profile Information */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary btn-sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="btn-secondary btn-sm"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="form-label">First Name</label>
                <input
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters'
                    }
                  })}
                  type="text"
                  className="form-input"
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Last Name</label>
                <input
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters'
                    }
                  })}
                  type="text"
                  className="form-input"
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="form-input"
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary btn-md"
              >
                {isSubmitting ? (
                  <div className="spinner w-4 h-4 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h4>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {formatDate(user.createdAt)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-500">Full Name</span>
                </div>
                <p className="text-gray-900">{user.firstName} {user.lastName}</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-500">Email</span>
                </div>
                <p className="text-gray-900">{user.email}</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-gray-500">Account Status</span>
                </div>
                <p className="text-green-600 font-medium">Active</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-500">Member Since</span>
                </div>
                <p className="text-gray-900">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account Settings */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-500">Receive email updates about your tasks</p>
            </div>
            <button className="btn-secondary btn-sm">
              Configure
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
              <p className="text-sm text-gray-500">Update your password for better security</p>
            </div>
            <button className="btn-secondary btn-sm">
              Change
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Delete Account</h4>
              <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
            </div>
            <button className="btn-danger btn-sm">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};