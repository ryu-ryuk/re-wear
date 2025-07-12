"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Plus, Eye, Heart, ShoppingCart, Package, Star, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { userAPI, itemsAPI, swapsAPI, type UserProfile as APIUserProfile, type DashboardStats, type Item, type SwapRequest } from "@/lib/api"

// Types for frontend UI (different from API types)
interface UserProfile {
  id: number
  name: string
  email: string
  first_name: string
  last_name: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  bio: string
  avatar: string
  joinDate: string
  rating: number
  totalSales: number
  points: number
  location: string
  is_private: boolean
}

interface Listing {
  id: number
  title: string
  description: string
  price: number
  image: string
  status: "available" | "swapped" | "pending"
  views: number
  likes: number
  createdAt: string
  category: string
  condition: string
  is_approved: boolean
}

interface Purchase {
  id: number
  title: string
  seller: string
  price: number
  image: string
  status: "delivered" | "shipped" | "processing" | "completed"
  purchaseDate: string
}

function DashboardContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({})
  
  // Real data states
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)

  // Load data on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Filter listings based on search term
  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      console.log("Loading dashboard data...")
      
      // Check if user is authenticated
      const token = localStorage.getItem('ReWearToken')
      const user = localStorage.getItem('ReWearUser')
      
      console.log("Auth status:", { hasToken: !!token, hasUser: !!user })
      
      if (!token) {
        toast.error("Not authenticated", {
          description: "Please log in to view your dashboard"
        })
        return
      }
      
      // Load user profile and stats in parallel
      console.log("Fetching profile...")
      const profileData = await userAPI.getProfile()
      console.log("Profile data:", profileData)
      
      console.log("Fetching dashboard stats...")
      const statsData = await userAPI.getDashboardStats()
      console.log("Stats data:", statsData)
      
      console.log("Fetching user items...")
      const myItems = await itemsAPI.getMyItems()
      console.log("Items data:", myItems)
      
      // Transform API profile to UI profile format
      const uiProfile: UserProfile = {
        id: profileData.id,
        name: `${profileData.first_name} ${profileData.last_name}`.trim() || profileData.username,
        email: profileData.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: "", // Not available in API
        address: "", // Not available in API  
        city: profileData.location || "",
        state: "", // Not available in API
        zipCode: "", // Not available in API
        bio: "", // Not available in API
        avatar: profileData.profile_picture || "",
        joinDate: new Date(profileData.date_joined).toLocaleDateString(),
        rating: 4.8, // Not available in API yet
        totalSales: profileData.items_swapped,
        points: profileData.points,
        location: profileData.location || "",
        is_private: profileData.is_private
      }
      
      // Transform API items to UI listings format
      const uiListings: Listing[] = myItems.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.point_value,
        image: item.images?.[0]?.image || "",
        status: item.status,
        views: item.view_count,
        likes: item.like_count,
        createdAt: new Date(item.created_at).toLocaleDateString(),
        category: item.category,
        condition: item.condition,
        is_approved: item.is_approved
      }))
      
      setProfile(uiProfile)
      setStats(statsData)
      setListings(uiListings)
      
      console.log("Dashboard data loaded successfully")
      
      // Load swaps data
      try {
        const swapsData = await swapsAPI.getMySwaps()
        const uiPurchases: Purchase[] = swapsData.map(swap => ({
          id: swap.id,
          title: swap.requested_item.title,
          seller: swap.requested_item.owner?.username || "Unknown",
          price: swap.requested_item.point_value,
          image: swap.requested_item.images?.[0]?.image || "",
          status: swap.status === 'completed' ? 'completed' : swap.status === 'accepted' ? 'shipped' : 'processing',
          purchaseDate: new Date(swap.created_at).toLocaleDateString()
        }))
        setPurchases(uiPurchases)
      } catch (error) {
        console.error("Failed to load swaps:", error)
        // Don't fail the whole dashboard if swaps fail
      }
      
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      toast.error("Failed to load dashboard data", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    if (!profile) return
    
    try {
      setUpdating(true)
      
      // Transform UI profile back to API format
      const updateData = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        location: profile.location,
        is_private: profile.is_private
      }
      
      const updatedProfile = await userAPI.updateProfile(updateData)
      
      // Update UI profile with latest data
      const uiProfile: UserProfile = {
        ...profile,
        name: `${updatedProfile.first_name} ${updatedProfile.last_name}`.trim() || updatedProfile.username,
        first_name: updatedProfile.first_name,
        last_name: updatedProfile.last_name,
        location: updatedProfile.location || "",
        is_private: updatedProfile.is_private
      }
      
      setProfile(uiProfile)
      setIsEditing(false)
      
      toast.success("Profile Updated", {
        description: "Your profile information has been successfully updated.",
      })
    } catch (error) {
      console.error("Profile update failed:", error)
      toast.error("Error", {
        description: "Failed to update profile. Please try again.",
      })
    } finally {
      setUpdating(false)
    }
  }

  // Button handlers
  const handleEditItem = (itemId: number) => {
    // Navigate to edit item page
    window.location.href = `/app/dashboard/listings/edit?id=${itemId}`
  }

  const handleViewItem = (itemId: number) => {
    // Navigate to item details page or open modal
    window.location.href = `/items/${itemId}`
  }

  const handleAddNewListing = () => {
    // Navigate to add listing page
    window.location.href = '/app/dashboard/listings/add'
  }

  const handleLikeItem = async (itemId: number) => {
    try {
      setActionLoading({ ...actionLoading, [`like_${itemId}`]: true })
      
      const result = await itemsAPI.toggleLike(itemId)
      
      // Update the item in listings
      setListings(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, likes: result.like_count }
          : item
      ))
      
      toast.success(result.liked ? "Item liked!" : "Item unliked!")
      
    } catch (error) {
      console.error("Failed to like item:", error)
      toast.error("Failed to update like status")
    } finally {
      setActionLoading({ ...actionLoading, [`like_${itemId}`]: false })
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return
    }
    
    try {
      setActionLoading({ ...actionLoading, [`delete_${itemId}`]: true })
      
      await itemsAPI.deleteItem(itemId)
      
      // Remove item from listings
      setListings(prev => prev.filter(item => item.id !== itemId))
      
      toast.success("Item deleted successfully")
      
      // Refresh stats
      const updatedStats = await userAPI.getDashboardStats()
      setStats(updatedStats)
      
    } catch (error) {
      console.error("Failed to delete item:", error)
      toast.error("Failed to delete item")
    } finally {
      setActionLoading({ ...actionLoading, [`delete_${itemId}`]: false })
    }
  }

  const handleSwapAction = async (swapId: number, action: 'accept' | 'reject' | 'complete') => {
    try {
      setActionLoading({ ...actionLoading, [`swap_${swapId}_${action}`]: true })
      
      let result
      switch (action) {
        case 'accept':
          result = await swapsAPI.acceptSwap(swapId)
          toast.success("Swap request accepted!")
          break
        case 'reject':
          result = await swapsAPI.rejectSwap(swapId)
          toast.success("Swap request rejected")
          break
        case 'complete':
          result = await swapsAPI.completeSwap(swapId)
          toast.success("Swap completed!")
          break
      }
      
      // Refresh dashboard data
      await loadDashboardData()
      
    } catch (error) {
      console.error(`Failed to ${action} swap:`, error)
      toast.error(`Failed to ${action} swap request`)
    } finally {
      setActionLoading({ ...actionLoading, [`swap_${swapId}_${action}`]: false })
    }
  }

  const handleBrowseItems = () => {
    // Navigate to browse items page
    window.location.href = '/browse'
  }

  const handleRefreshData = async () => {
    await loadDashboardData()
    toast.success("Dashboard data refreshed!")
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      available: "bg-green-100 text-green-800",
      swapped: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      delivered: "bg-green-100 text-green-800",
      shipped: "bg-blue-100 text-blue-800",
      processing: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
    }

    return (
      <Badge className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load profile data</p>
          <Button onClick={loadDashboardData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
            {stats && (
              <p className="text-gray-600 mt-1">
                {stats.total_points} points • {stats.total_items} items • {stats.successful_swaps} successful swaps
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshData}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search your items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Avatar>
              <AvatarImage src={profile.avatar || "/placeholder.svg"} />
              <AvatarFallback>{profile.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Profile Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Profile Information</CardTitle>
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => (isEditing ? handleProfileUpdate() : setIsEditing(true))}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  "Save Changes"
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">{profile.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{profile.name}</h3>
                  <div className="flex items-center gap-1 mt-1 justify-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">
                      {profile.rating} ({profile.totalSales} swaps)
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Member since {profile.joinDate}</p>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {profile.points} points
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value, name: `${e.target.value} ${profile.last_name}`.trim() })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value, name: `${profile.first_name} ${e.target.value}`.trim() })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled={true} // Email cannot be changed
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    disabled={!isEditing}
                    placeholder="City, State"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="points">Points Balance</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="points"
                      value={profile.points}
                      disabled={true}
                      className="bg-gray-50"
                    />
                    <Badge variant="secondary">Earned through swaps</Badge>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_private"
                      checked={profile.is_private}
                      onChange={(e) => setProfile({ ...profile, is_private: e.target.checked })}
                      disabled={!isEditing}
                      className="rounded"
                    />
                    <Label htmlFor="is_private">Make profile private</Label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    When enabled, your profile statistics won't be visible to other users
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Points</p>
                    <p className="text-2xl font-bold text-green-600">{stats.total_points}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Available Items</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.available_items}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.total_views}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Successful Swaps</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.successful_swaps}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <ShoppingCart className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* My Listings Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                My Listings ({searchTerm ? `${filteredListings.length} of ${listings.length}` : listings.length})
              </CardTitle>
              <Button onClick={handleAddNewListing}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Listing
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {listings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items listed yet</h3>
                <p className="text-gray-600 mb-4">Start by listing your first item to begin swapping!</p>
                <Button onClick={handleAddNewListing}>
                  <Plus className="w-4 h-4 mr-2" />
                  List Your First Item
                </Button>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items match your search</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search terms or clear the search to see all items.</p>
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredListings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={listing.image || "/placeholder.svg"}
                        alt={listing.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">{getStatusBadge(listing.status)}</div>
                      {!listing.is_approved && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="outline" className="bg-white">Pending Approval</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{listing.title}</h3>
                      <p className="text-lg font-bold text-green-600 mb-2">{listing.price} points</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {listing.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {listing.likes}
                          </span>
                        </div>
                        <span>{listing.createdAt}</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        <span className="font-medium">{listing.category}</span> • <span>{listing.condition}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 bg-transparent"
                          onClick={() => handleEditItem(listing.id)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 bg-transparent"
                          onClick={() => handleViewItem(listing.id)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Purchases/Swaps Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              My Swaps ({purchases.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No swaps yet</h3>
                <p className="text-gray-600 mb-4">Start browsing items to make your first swap!</p>
                <Button variant="outline" onClick={handleBrowseItems}>
                  Browse Items
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {purchases.map((purchase) => (
                  <Card key={purchase.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={purchase.image || "/placeholder.svg"}
                        alt={purchase.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">{getStatusBadge(purchase.status)}</div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">{purchase.title}</h3>
                      <p className="text-xs text-gray-600 mb-2">by {purchase.seller}</p>
                      <p className="text-lg font-bold text-blue-600 mb-2">{purchase.price} points</p>
                      <p className="text-xs text-gray-500 mb-3">Swapped: {purchase.purchaseDate}</p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 bg-transparent"
                          onClick={() => handleViewItem(purchase.id)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Details
                        </Button>
                        {purchase.status === "completed" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 bg-transparent"
                            onClick={() => {
                              // TODO: Implement review functionality
                              toast.info("Review functionality coming soon!")
                            }}
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Review
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Main component with authentication
export default function SellerDashboard() {
  // Check if user is authenticated
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    const storedUser = localStorage.getItem("ReWearUser")
    const token = localStorage.getItem("ReWearToken")
    
    if (!storedUser || !token) {
      // Redirect to login if not authenticated
      window.location.href = "/login"
      return
    }
    
    setUser(JSON.parse(storedUser))
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <DashboardContent />
}