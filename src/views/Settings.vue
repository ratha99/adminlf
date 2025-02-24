<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">General Settings</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Site Name</label>
            <input
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              v-model="settings.siteName"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Site Description</label>
            <textarea
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              v-model="settings.description"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Email Notifications</label>
            <div class="mt-2">
              <label class="inline-flex items-center">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  v-model="settings.emailNotifications"
                />
                <span class="ml-2 text-sm text-gray-600">Enable email notifications</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div class="px-6 py-3 bg-gray-50 text-right">
        <button
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          @click="saveSettings"
        >
          Save Changes
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Security Settings</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              v-model="security.currentPassword"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              v-model="security.newPassword"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              v-model="security.confirmPassword"
            />
          </div>
        </div>
      </div>
      
      <div class="px-6 py-3 bg-gray-50 text-right">
        <button
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          @click="changePassword"
        >
          Update Password
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const settings = reactive({
  siteName: 'Admin Dashboard',
  description: 'A powerful admin dashboard built with Vue.js',
  emailNotifications: true
})

const security = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const saveSettings = () => {
  // Implement settings save logic
  alert('Settings saved!')
}

const changePassword = () => {
  if (security.newPassword !== security.confirmPassword) {
    alert('Passwords do not match!')
    return
  }
  // Implement password change logic
  alert('Password updated!')
}
</script>