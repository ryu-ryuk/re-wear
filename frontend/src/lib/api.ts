// API service functions for ReWear platform
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
  successful_swaps: number
  active_negotiations: number
  new_likes_this_week: number
  new_views_this_week: number
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
  status: 'pending' | 'accepted' | 'completed' | 'rejected'
  created_at: string
  message: string
}

// API functions
export const userAPI = {
  // Get current user profile
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Profile API error:', {
          status: response.status,
          statusText: response.statusText,
          url: `${API_BASE_URL}/users/me/`,
          error: errorText
        })
        throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Profile fetch error:', error)
      throw error
    }
  },

  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/dashboard/`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Dashboard stats API error:', {
          status: response.status,
          statusText: response.statusText,
          url: `${API_BASE_URL}/users/dashboard/`,
          error: errorText
        })
        throw new Error(`Failed to fetch dashboard stats: ${response.status} ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Dashboard stats fetch error:', error)
      throw error
    }
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
    // Update localStorage
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

export const itemsAPI = {
  // Get user's items
  async getMyItems(): Promise<Item[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/items/my/`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('My items API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        throw new Error(`Failed to fetch user items: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.results || data
    } catch (error) {
      console.error('My items fetch error:', error)
      throw error
    }
  },

  // Get item details
  async getItem(id: number): Promise<Item> {
    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}/`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch item: ${response.status} ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Item fetch error:', error)
      throw error
    }
  },

  // Create new item
  async createItem(itemData: FormData): Promise<Item> {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}/items/`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
          // Don't set Content-Type for FormData
        },
        body: itemData
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create item: ${response.status} ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Item creation error:', error)
      throw error
    }
  },

  // Update item
  async updateItem(id: number, itemData: FormData | Partial<Item>): Promise<Item> {
    try {
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
        const errorText = await response.text()
        throw new Error(`Failed to update item: ${response.status} ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Item update error:', error)
      throw error
    }
  },

  // Delete item
  async deleteItem(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete item: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('Item deletion error:', error)
      throw error
    }
  },

  // Like/unlike item
  async toggleLike(id: number): Promise<{ liked: boolean; like_count: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}/like/`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`Failed to toggle like: ${response.status} ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Like toggle error:', error)
      throw error
    }
  },

  // Get all available items for browsing
  async getAllItems(params?: {
    search?: string
    category?: string
    condition?: string
    size?: string
    color?: string
    min_points?: number
    max_points?: number
    page?: number
  }): Promise<{ results: Item[]; count: number; next: string | null; previous: string | null }> {
    try {
      const queryParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString())
          }
        })
      }
      
      const url = `${API_BASE_URL}/items/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await fetch(url, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.status} ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Items fetch error:', error)
      throw error
    }
  },

  // Get categories and conditions for form dropdowns
  async getCategories(): Promise<{ categories: string[]; conditions: string[]; sizes: string[]; colors: string[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/items/categories/`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Categories fetch error:', error)
      throw error
    }
  }
}

export const swapsAPI = {
  // Get user's swaps (sent and received)
  async getMySwaps(): Promise<SwapRequest[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/swaps/`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch swaps: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.results || data
    } catch (error) {
      console.error('Swaps fetch error:', error)
      throw error
    }
  },

  // Create swap request
  async createSwap(swapData: {
    offered_item: number
    requested_item: number
    message?: string
  }): Promise<SwapRequest> {
    try {
      const response = await fetch(`${API_BASE_URL}/swaps/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(swapData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create swap request: ${response.status} ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Swap creation error:', error)
      throw error
    }
  },

  // Accept swap request
  async acceptSwap(id: number): Promise<SwapRequest> {
    try {
      const response = await fetch(`${API_BASE_URL}/swaps/${id}/accept/`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`Failed to accept swap: ${response.status} ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Swap accept error:', error)
      throw error
    }
  },

  // Reject swap request
  async rejectSwap(id: number): Promise<SwapRequest> {
    try {
      const response = await fetch(`${API_BASE_URL}/swaps/${id}/reject/`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`Failed to reject swap: ${response.status} ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Swap reject error:', error)
      throw error
    }
  },

  // Complete swap
  async completeSwap(id: number): Promise<SwapRequest> {
    try {
      const response = await fetch(`${API_BASE_URL}/swaps/${id}/complete/`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`Failed to complete swap: ${response.status} ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Swap complete error:', error)
      throw error
    }
  },

  // Cancel swap request
  async cancelSwap(id: number): Promise<SwapRequest> {
    try {
      const response = await fetch(`${API_BASE_URL}/swaps/${id}/cancel/`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`Failed to cancel swap: ${response.status} ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Swap cancel error:', error)
      throw error
    }
  },

  // Redeem item using points
  async redeemItem(itemData: {
    item_id: number
    delivery_address?: string
  }): Promise<{ success: boolean; message: string; points_remaining: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/swaps/redeem/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(itemData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to redeem item: ${response.status} ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Item redemption error:', error)
      throw error
    }
  }
}

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}

// Helper function to logout user
export const logout = (): void => {
  localStorage.removeItem('ReWearToken')
  localStorage.removeItem('ReWearUser')
  window.location.href = '/login'
}
