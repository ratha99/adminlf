<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-800">Users</h3>
      <div class="flex gap-4">
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search users..."
            class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div class="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Add New User
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading users...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 p-4 rounded-lg">
      <p class="text-red-600">{{ error }}</p>
      <button 
        @click="fetchUsers"
        class="mt-2 text-sm text-red-600 hover:text-red-800 underline"
      >
        Try again
      </button>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              @click="sortBy(column.key)"
            >
              <div class="flex items-center gap-2">
                {{ column.label }}
                <span v-if="sortColumn === column.key" class="text-gray-400">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in paginatedUsers" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ user.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ user.role || 'User' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ user.active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
              <button class="text-red-600 hover:text-red-900">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span class="text-sm text-gray-700">
              Showing
              <span class="font-medium">{{ startIndex + 1 }}</span>
              to
              <span class="font-medium">{{ Math.min(endIndex, filteredUsers.length) }}</span>
              of
              <span class="font-medium">{{ filteredUsers.length }}</span>
              results
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md"
              :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'"
            >
              Previous
            </button>
            <span class="text-gray-600">Page {{ currentPage }} of {{ totalPages }}</span>
            <button
              @click="currentPage++"
              :disabled="currentPage >= totalPages"
              class="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md"
              :class="currentPage >= totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
const apiUrl = import.meta.env.VITE_API_URL

interface User {
  id: number
  name: string
  email: string
  role?: string
  active: boolean
}

interface Column {
  key: keyof User
  label: string
}

const columns: Column[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'active', label: 'Status' }
]

const users = ref<User[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const sortColumn = ref<keyof User>('name')
const sortDirection = ref<'asc' | 'desc'>('asc')

const filteredUsers = computed(() => {
  let filtered = [...users.value]
  
  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.role && user.role.toLowerCase().includes(query))
    )
  }
  
  // Sort
  filtered.sort((a, b) => {
  const aValue = a[sortColumn.value]
  const bValue = b[sortColumn.value]
  
  // If either aValue or bValue is undefined, we handle it gracefully
  if (aValue === undefined && bValue === undefined) return 0
  if (aValue === undefined) return -1  // Consider undefined as lesser
  if (bValue === undefined) return 1   // Consider undefined as lesser
  
  // If both are defined, proceed with the usual comparison
  const comparison = aValue < bValue ? -1 : 1
  return sortDirection.value === 'asc' ? comparison : -comparison
})

  
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => startIndex.value + itemsPerPage)

const paginatedUsers = computed(() => 
  filteredUsers.value.slice(startIndex.value, endIndex.value)
)

const sortBy = (column: keyof User) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

const fetchUsers = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await fetch(`${apiUrl}/user`)
    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }
    
    const data = await response.json()
    users.value = data.map((user: any) => ({
      id: user.id,
      name: user.firstname + " "+ user.lastname || 'Unknown',
      email: user.email || '',
      role: user.role || 'User',
      active: user.active ?? true
    }))
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An error occurred while fetching users'
  } finally {
    loading.value = false
  }
}

// Reset to first page when search query changes
watch(searchQuery, () => {
  currentPage.value = 1
})

onMounted(() => {
  fetchUsers()
})
</script>