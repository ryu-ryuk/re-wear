// Complete API service functions for ReWear platform
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"

// Get JWT token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ReWearToken')
  }
  return null
}

// Get authenticated headers
const getAuthHeaders = () => {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

// API response types
export interface UserProfile {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  points: number
  location: string
  profile_picture: string | null
  is_private: boolean
  date_joined: string
  total_items: number
  items_swapped: number
  active_swaps: number
  total_likes_received: number
}

export interface DashboardStats {
  total_points: number
  points_earned_this_month: number
  total_items: number
  pending_approval: number
  available_items: number
  swapped_items: number
  total_views: number
  total_likes: number
  profile_views: number
  swaps_requested: number
  swaps_received: number
}

export interface CompleteDashboard {
  user: UserProfile
  stats: DashboardStats
  recent_activity: ActivityItem[]
  liked_items: Item[]
  my_swaps: SwapRequest[]
}

export interface ActivityItem {
  id: number
  type: 'item_created' | 'item_liked' | 'swap_requested' | 'swap_accepted' | 'swap_completed'
  message: string
  timestamp: string
  item?: Item
  swap?: SwapRequest
}

export interface Item {
  id: number
  title: string
  description: string
  point_value: number
  images: Array<{ image: string }>
  status: 'available' | 'swapped' | 'pending'
  view_count: number
  like_count: number
  created_at: string
  category: string
  condition: string
  size: string
  color: string
  brand: string
  is_approved: boolean
  is_flagged: boolean
  owner?: {
    id: number
    username: string
    first_name: string
    last_name: string
  }
}

export interface SwapRequest {
  id: number
  requester: {
    id: number
    username: string
  }
  offered_item: Item
  requested_item: Item
  status: 'pending' | 'accepted' | 'completed' | 'rejected' | 'cancelled'
  created_at: string
  message: string
  response_message?: string
}

export interface PlatformStats {
  total_users: number
  total_items: number
  total_swaps: number
  items_this_month: number
  swaps_this_month: number
}

// Authentication API
export const authAPI = {
  async register(userData: {
    username: string
    email: string
    password: string
    first_name?: string
    last_name?: string
    location?: string
  }): Promise<{ user: UserProfile; token: string }> {
    const response = await fetch(`${API_BASE_URL}/users/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Registration failed')
    }
    
    const data = await response.json()
    
    // Store token and user data
    localStorage.setItem('ReWearToken', data.token)
    localStorage.setItem('ReWearUser', JSON.stringify(data.user))
    
    return data
  },

  async login(credentials: { username: string; password: string }): Promise<{ user: UserProfile; token: string }> {
    const response = await fetch(`${API_BASE_URL}/users/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }
    
    const data = await response.json()
    
    // Store token and user data
    localStorage.setItem('ReWearToken', data.token)
    localStorage.setItem('ReWearUser', JSON.stringify(data.user))
    
    return data
  },

  logout(): void {
    localStorage.removeItem('ReWearToken')
    localStorage.removeItem('ReWearUser')
  }
}

// User API
export const userAPI = {
  // Get current user profile
  async getProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/me/`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  },

  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/users/dashboard/`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard stats: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  },

  // Get complete dashboard (all data in one call)
  async getCompleteDashboard(): Promise<CompleteDashboard> {
    const response = await fetch(`${API_BASE_URL}/users/complete_dashboard/`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch complete dashboard: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  },

  // Get user activity feed
  async getMyActivity(): Promise<ActivityItem[]> {
    const response = await fetch(`${API_BASE_URL}/users/my_activity/`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch activity: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.results || data
  },

  // Get user's swap history
  async getMySwaps(): Promise<SwapRequest[]> {
    const response = await fetch(`${API_BASE_URL}/users/my_swaps/`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch swaps: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.results || data
  },

  // Get public user profile
  async getPublicProfile(userId: number): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  },

  // Update user profile
  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const user = JSON.parse(localStorage.getItem('ReWearUser') || '{}')
    const response = await fetch(`${API_BASE_URL}/users/${user.id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    })
    
    if (!response.ok) {
      throw new Error('Failed to update profile')
    }
    
    const updatedProfile = await response.json()
    localStorage.setItem('ReWearUser', JSON.stringify(updatedProfile))
    return updatedProfile
  },

  // Get user's liked items
  async getLikedItems(): Promise<Item[]> {
    const response = await fetch(`${API_BASE_URL}/users/liked_items/`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch liked items')
    }
    
    const data = await response.json()
    return data.results || data
  }
}

// Items API
export const itemsAPI = {
  // Get all items (public listing with filters)
  async getAllItems(params?: {
    page?: number
    page_size?: number
    category?: string
    condition?: string
    search?: string
    ordering?: string
    min_points?: number
    max_points?: number
    size?: string
    color?: string
  }): Promise<{ results: Item[]; pagination: any }> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const url = `${API_BASE_URL}/items/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await fetch(url, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch items: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return {
      results: data.results,
      pagination: data.pagination || {
        count: data.count || 0,
        next: data.next,
        previous: data.previous,
        current_page: data.current_page || 1,
        total_pages: data.total_pages || 1
      }
    }
  },

  // Get featured items for homepage
  async getFeaturedItems(limit?: number): Promise<{ results: Item[]; count: number }> {
    const params = limit ? `?limit=${limit}` : ''
    const response = await fetch(`${API_BASE_URL}/items/featured/${params}`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch featured items: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  },

  // Get user's items
  async getMyItems(): Promise<Item[]> {
    const response = await fetch(`${API_BASE_URL}/items/my/`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user items: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.results || data
  },

  // Get item details
  async getItem(id: number): Promise<Item> {
    const response = await fetch(`${API_BASE_URL}/items/${id}/`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch item: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  },

  // Create new item
  async createItem(itemData: FormData): Promise<Item> {
    const token = getAuthToken()
    const response = await fetch(`${API_BASE_URL}/items/`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: itemData
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create item: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  },

  // Update item
  async updateItem(id: number, itemData: FormData | Partial<Item>): Promise<Item> {
    const token = getAuthToken()
    const isFormData = itemData instanceof FormData
    
    const response = await fetch(`${API_BASE_URL}/items/${id}/`, {
      method: 'PATCH',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(!isFormData && { 'Content-Type': 'application/json' })
      },
      body: isFormData ? itemData : JSON.stringify(itemData)
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update item: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  },

  // Delete item
  async deleteItem(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/items/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to delete item: ${response.status} ${response.statusText}`)
    }
  },

  // Like/unlike item
  async toggleLike(id: number): Promise<{ liked: boolean; like_count: number }> {
    const response = await fetch(`${API_BASE_URL}/items/${id}/like/`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to toggle like: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  },

  // Get categories and conditions for form dropdowns
  async getCategories(): Promise<{
    categories: Array<{ value: string; label: string }>
    conditions: Array<{ value: string; label: string }>
  }> {
    const response = await fetch(`${API_BASE_URL}/items/categories/`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  },

  // Get platform statistics
  async getPlatformStats(): Promise<PlatformStats> {
    const response = await fetch(`${API_BASE_URL}/items/stats/`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch platform stats: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  },

  // Advanced search
  async searchItems(query: string, filters?: {
    category?: string
    condition?: string
    min_points?: number
    max_points?: number
    size?: string
    color?: string
  }): Promise<{ results: Item[]; pagination: any }> {
    const searchParams = new URLSearchParams({ q: query })
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const response = await fetch(`${API_BASE_URL}/items/search/?${searchParams.toString()}`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to search items: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return {
      results: data.results,
      pagination: data.pagination || {
        count: data.count || 0,
        next: data.next,
        previous: data.previous,
        current_page: data.current_page || 1,
        total_pages: data.total_pages || 1
      }
    }
  }
}

// Swaps API
export const swapsAPI = {
  // Get user's swaps (sent and received)
  async getMySwaps(): Promise<SwapRequest[]> {
    const response = await fetch(`${API_BASE_URL}/swaps/`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch swaps: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.results || data
  },

  // Get swap details
  async getSwap(id: number): Promise<SwapRequest> {
    const response = await fetch(`${API_BASE_URL}/swaps/${id}/`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch swap: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  },

  // Create swap request
  async createSwap(swapData: {
    offered_item: number
    requested_item: number
    message?: string
  }): Promise<SwapRequest> {
    const response = await fetch(`${API_BASE_URL}/swaps/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(swapData)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create swap: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  },

  // Accept swap request
  async acceptSwap(id: number, message?: string): Promise<SwapRequest> {
    const response = await fetch(`${API_BASE_URL}/swaps/${id}/accept/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to accept swap: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  },

  // Reject swap request
  async rejectSwap(id: number, message?: string): Promise<SwapRequest> {
    const response = await fetch(`${API_BASE_URL}/swaps/${id}/reject/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to reject swap: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  },

  // Complete swap
  async completeSwap(id: number): Promise<SwapRequest> {
    const response = await fetch(`${API_BASE_URL}/swaps/${id}/complete/`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to complete swap: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  },

  // Cancel swap request
  async cancelSwap(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/swaps/${id}/cancel/`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`Failed to cancel swap: ${response.status} ${response.statusText}`)
    }
  },

  // Redeem item with points
  async redeemItem(itemId: number): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/swaps/redeem/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ item_id: itemId })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to redeem item: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }
}
