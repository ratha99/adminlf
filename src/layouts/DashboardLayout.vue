<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-md">
      <div class="p-4 border-b">
        <h1 class="text-xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>
      
      <nav class="p-4 space-y-2">
        <router-link 
          to="/" 
          :class="['nav-link', { active: route.path === '/' }]"
        >
          <HomeIcon class="sidebar-icon" />
          Dashboard
        </router-link>
        
        <router-link 
          to="/posts" 
          :class="['nav-link', { active: route.path === '/posts' }]"
        >
          <DocumentTextIcon class="sidebar-icon" />
          Posts
        </router-link>
        
        <router-link 
          to="/users" 
          :class="['nav-link', { active: route.path === '/users' }]"
        >
          <UsersIcon class="sidebar-icon" />
          Users
        </router-link>
        
        <router-link 
          to="/settings" 
          :class="['nav-link', { active: route.path === '/settings' }]"
        >
          <Cog6ToothIcon class="sidebar-icon" />
          Settings
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto">
      <!-- Top Navigation -->
      <header class="bg-white shadow-sm">
        <div class="flex justify-between items-center px-6 py-4">
          <h2 class="text-xl font-semibold text-gray-800">
            {{ currentPage }}
          </h2>
          
          <div class="flex items-center gap-4">
            <span class="text-gray-600">{{ user?.name }}</span>
            <button
              @click="handleLogout"
              class="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="p-6">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
  HomeIcon,
  DocumentTextIcon,
  UsersIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const currentPage = computed(() => route.name)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style>
.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  color: #4a5568;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: #edf2f7;
}

.nav-link.active {
  background-color: #4f46e5;
  color: #ffffff;
}

.sidebar-icon {
  width: 20px;
  height: 20px;
}
</style>
