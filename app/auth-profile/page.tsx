'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { updateUser } from '@/store/slices/authSlice';
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeAlert } from '@/lib/utils/sweetAlert';

interface ProfileData {
  fullName: string;
  email: string;
  contactNumber: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);

  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    contactNumber: '',
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        contactNumber: user.contactNumber || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+947[0-9]{8}$/;
    return phoneRegex.test(phone);
  };

  const handleUpdateProfile = async () => {
    if (!profileData.fullName.trim()) {
      showErrorAlert('Please enter your full name', 'Validation Error');
      return;
    }

    if (profileData.fullName.trim().length < 2) {
      showErrorAlert('Full name must be at least 2 characters', 'Validation Error');
      return;
    }

    if (!validatePhoneNumber(profileData.contactNumber)) {
      showErrorAlert('Please enter a valid Sri Lankan phone number (+947XXXXXXXX)', 'Invalid Phone Number');
      return;
    }

    showLoadingAlert('Updating your profile...');

    try {
      const response = await fetch('/api/auth/profile-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: profileData.fullName.trim(),
          contactNumber: profileData.contactNumber,
        }),
      });

      const data = await response.json();
      closeAlert();

      if (response.ok && data.success) {
        // Update Redux store with the updated user data
        dispatch(updateUser(data.data));
        
        setIsEditingProfile(false);
        await showSuccessAlert('Your profile has been updated successfully!', 'Profile Updated!');
      } else {
        showErrorAlert(data.message || 'Failed to update profile', 'Update Failed');
      }
    } catch (error) {
      closeAlert();
      console.error('Profile update error:', error);
      showErrorAlert('An unexpected error occurred', 'Update Error');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      showErrorAlert('Please enter your current password', 'Validation Error');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showErrorAlert('New password must be at least 8 characters', 'Validation Error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showErrorAlert('New passwords do not match', 'Validation Error');
      return;
    }

    showLoadingAlert('Changing your password...');

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      closeAlert();

      if (response.ok && data.success) {
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        await showSuccessAlert('Your password has been changed successfully!', 'Password Changed!');
      } else {
        showErrorAlert(data.message || 'Failed to change password', 'Change Failed');
      }
    } catch (error) {
      closeAlert();
      console.error('Password change error:', error);
      showErrorAlert('An unexpected error occurred', 'Change Error');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        contactNumber: user.contactNumber || '',
      });
    }
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#0a0015] via-[#211f60] to-[#0a0015] relative overflow-hidden mt-6 pt-24 pb-12">
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-[#a60054] rounded-full blur-3xl opacity-20"
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3">
            My Profile
          </h1>
          <p className="text-lg text-white/70">
            Manage your account information and settings
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Profile Information</h2>
              {!isEditingProfile ? (
                <motion.button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white rounded-lg text-sm font-medium transition-all hover:opacity-90"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Edit Profile
                </motion.button>
              ) : null}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleProfileChange}
                  disabled={!isEditingProfile}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#a60054] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 cursor-not-allowed transition-all"
                />
                <p className="text-white/40 text-xs mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={profileData.contactNumber}
                  onChange={handleProfileChange}
                  disabled={!isEditingProfile}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#a60054] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  placeholder="+947XXXXXXXX"
                />
                <p className="text-white/40 text-xs mt-1">Format: +947XXXXXXXX</p>
              </div>

              {isEditingProfile && (
                <div className="flex gap-4 pt-4">
                  <motion.button
                    onClick={handleCancelEdit}
                    className="flex-1 py-3 bg-white/5 border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleUpdateProfile}
                    className="flex-1 py-3 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white font-semibold rounded-xl shadow-lg transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Save Changes
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Change Password</h2>
              {!isChangingPassword ? (
                <motion.button
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white rounded-lg text-sm font-medium transition-all hover:opacity-90"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Change Password
                </motion.button>
              ) : null}
            </div>

            {isChangingPassword ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#a60054] transition-all"
                    placeholder="Enter your current password"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#a60054] transition-all"
                    placeholder="Enter your new password"
                  />
                  <p className="text-white/40 text-xs mt-1">Must be at least 8 characters</p>
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#a60054] transition-all"
                    placeholder="Re-enter your new password"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    onClick={handleCancelPasswordChange}
                    className="flex-1 py-3 bg-white/5 border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleChangePassword}
                    className="flex-1 py-3 bg-gradient-to-r from-[#a60054] to-[#211f60] text-white font-semibold rounded-xl shadow-lg transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Update Password
                  </motion.button>
                </div>
              </div>
            ) : (
              <p className="text-white/60">
                Keep your account secure by regularly updating your password
              </p>
            )}
          </motion.div>

          {/* Account Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Account Information</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white/70">Account Type</span>
                <span className="px-3 py-1 bg-gradient-to-r from-[#a60054]/20 to-[#211f60]/20 border border-[#a60054]/40 text-white rounded-lg text-sm font-medium">
                  {user?.userType === 'admin' ? 'Administrator' : 'Customer'}
                </span>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-white/70">Member Since</span>
                <span className="text-white font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}