<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-800">Total Posts</h3>
        <p class="text-3xl font-bold text-indigo-600 mt-2">{{ reportData.totalPosts || 0 }}</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-800">Lost Items</h3>
        <p class="text-3xl font-bold text-indigo-600 mt-2">{{ reportData.type?.lost || 0 }}</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-800">Found Items</h3>
        <p class="text-3xl font-bold text-indigo-600 mt-2">{{ reportData.type?.found || 0 }}</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-800">Total Users</h3>
        <p class="text-3xl font-bold text-indigo-600 mt-2">{{ userData.totalUsers || 0 }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-800">Post Status</h3>
        <ul>
          <li>Active: {{ reportData.status?.active || 0 }}</li>
          <li>Resolved: {{ reportData.status?.Resolved || 0 }}</li>
          <li>Deactive: {{ reportData.status?.deactive || 0 }}</li>
          <li>Blocked: {{ reportData.status?.blocked || 0 }}</li>
        </ul>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-800">Categories</h3>
        <ul>
          <li>Pets: {{ reportData.category?.pets || 0 }}</li>
          <li>Stuffs: {{ reportData.category?.stuffs || 0 }}</li>
          <li>People: {{ reportData.category?.people || 0 }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
const apiUrl = import.meta.env.VITE_API_URL
// Define types for reportData and userData
interface ReportData {
  totalPosts: number
  type?: {
    lost: number
    found: number
  }
  status?: {
    active: number
    Resolved: number
    deactive: number
    blocked: number
  }
  category?: {
    pets: number
    stuffs: number
    people: number
  }
}

interface UserData {
  totalUsers: number
}

// Initialize with default values
const reportData = ref<ReportData>({
  totalPosts: 0, // default value
  type: {
    lost: 0,
    found: 0
  },
  status: {
    active: 0,
    Resolved: 0,
    deactive: 0,
    blocked: 0
  },
  category: {
    pets: 0,
    stuffs: 0,
    people: 0
  }
})

const userData = ref<UserData>({
  totalUsers: 0 // default value
})

// Fetch report data
const fetchReportData = async () => {
  try {
    const response = await axios.get(`${apiUrl}/report/post`)
    const [type, category, status, totalPosts] = response.data

    reportData.value = {
      type: type.type,
      category: category.category,
      status: status.status,
      totalPosts: totalPosts.totalPosts
    }
  } catch (error) {
    console.error('Failed to fetch report data:', error)
  }
}

// Fetch user data
const fetchUserData = async () => {
  try {
    const response = await axios.get(`${apiUrl}/report/user`)
    userData.value = response.data
  } catch (error) {
    console.error('Failed to fetch user data:', error)
  }
}

// On mounted, fetch data
onMounted(() => {
  fetchReportData()
  fetchUserData()
})
</script>
