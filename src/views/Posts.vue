<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-800">Posts</h3>
      <div class="flex gap-4">
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search posts..."
            class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div class="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Add New Post
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading posts...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 p-4 rounded-lg">
      <p class="text-red-600">{{ error }}</p>
      <button 
        @click="fetchPosts"
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
          <tr v-for="post in paginatedPosts" :key="post.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ post.userId.firstname }} {{ post.userId.lastname }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <img :src="post.images" alt="user profile" class="h-8 w-8 rounded-full"/>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ post.title }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ post.categoryId }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              :class="{
                'bg-green-100 text-green-800': post.status === 'active',
                'bg-yellow-100 text-yellow-800': post.status === 'deactive',
                'bg-blue-100 text-blue-800': post.status === 'Resolved',
                'bg-gray-100 text-gray-800': post.status === 'blocked'
               }">
                {{ post.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button class="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
              <button @click="openDeleteModal(post)" class="text-red-600 hover:text-red-900">Delete</button>
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
              <span class="font-medium">{{ Math.min(endIndex, filteredPosts.length) }}</span>
              of
              <span class="font-medium">{{ filteredPosts.length }}</span>
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

    <!-- Delete Confirmation Modal -->
    <div v-if="isDeleteModalOpen" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
        <textarea
          v-model="deleteReason"
          placeholder="Please provide a reason for deletion"
          rows="4"
          class="mt-2 w-full p-2 border border-gray-300 rounded-lg"
        ></textarea>
        <div class="mt-4 flex justify-end space-x-4">
          <button
            @click="closeDeleteModal"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Confirm Deletion
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
const apiUrl = import.meta.env.VITE_API_URL
interface Post {
  id: string
  title: string
  description: string
  categoryId: string
  status: string
  location: string
  images: string
  date: string
  phone: string
  userId: {
    _id: string
    profile_pic: string
    firstname: string
    lastname: string
  }
}

interface Column {
  key: keyof Post
  label: string
}

const columns: Column[] = [
  { key: 'userId', label: 'User' },
  { key: 'images', label: 'Images' },
  { key: 'title', label: 'Title' },
  { key: 'categoryId', label: 'Category' },
  { key: 'status', label: 'Status' }
]

const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const sortColumn = ref<keyof Post>('title')
const sortDirection = ref<'asc' | 'desc'>('asc')

const filteredPosts = computed(() => {
  let filtered = [...posts.value]
  
  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.description.toLowerCase().includes(query) ||
      post.userId.firstname.toLowerCase().includes(query) ||
      post.userId.lastname.toLowerCase().includes(query) ||
      post.categoryId.toLowerCase().includes(query) ||
      post.status.toLowerCase().includes(query) 
    )
  }
  
  // Sort
  filtered.sort((a, b) => {
    const aValue = a[sortColumn.value]
    const bValue = b[sortColumn.value]
    
    if (aValue === bValue) return 0
    
    const comparison = aValue < bValue ? -1 : 1
    return sortDirection.value === 'asc' ? comparison : -comparison
  })
  
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredPosts.value.length / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => startIndex.value + itemsPerPage)

const paginatedPosts = computed(() => 
  filteredPosts.value.slice(startIndex.value, endIndex.value)
)

const sortBy = (column: keyof Post) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

const fetchPosts = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await fetch(`${apiUrl}/post?block="block"`)
    if (!response.ok) {
      throw new Error('Failed to fetch posts')
    }
    
    const data = await response.json()
    posts.value = data.docs.map((post: any) => ({
      id: post._id,
      title: post.title,
      description: post.description,
      categoryId: post.categoryId,
      status: post.status,
      location: post.location,
      images: post.images,
      date: post.date,
      phone: post.phone,
      userId: post.userId
    }))
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An error occurred while fetching posts'
  } finally {
    loading.value = false
  }
}

watch(searchQuery, () => {
  currentPage.value = 1
})

onMounted(() => {
  fetchPosts()
})

const isDeleteModalOpen = ref(false)
const deleteReason = ref('')
const postToDelete = ref<Post | null>(null)

const openDeleteModal = (post: Post) => {
  postToDelete.value = post
  isDeleteModalOpen.value = true
  deleteReason.value = '' 
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  deleteReason.value = ''
  postToDelete.value = null
}

const confirmDelete = async () => {
  console.log(postToDelete.value?.userId._id);
  if (!postToDelete.value || !deleteReason.value.trim()) {
    alert('Please provide a reason for deletion')
    return
  }

  try {
    await fetch(`${apiUrl}/block`, {
      method: 'POST',
      body: JSON.stringify({ 
        reason: deleteReason.value,
        postId: postToDelete.value.id,
        userId: postToDelete.value.userId._id
       }),
      headers: { 'Content-Type': 'application/json' },
    })

    // posts.value = posts.value.filter(post => post.id !== postToDelete.value.id)
    fetchPosts()
    closeDeleteModal()
  } catch (e) {
    alert('An error occurred while deleting the post')
  }
}

</script>
