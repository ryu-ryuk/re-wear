"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingBag, Heart, Bell, ChevronLeft, ChevronRight, Package, LogOut, RefreshCw, Eye, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Item {
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
  is_flagged: boolean
}

interface Category {
  value: string
  label: string
  count?: number
}

interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  points: number
  profile_picture?: string | null
}

export default function HomePage() {
  const router = useRouter()
  
  // State
  const [user, setUser] = useState<User | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    // Filter items when search term or category changes
    filterItems()
  }, [searchTerm, selectedCategory, items])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Mock data for now until API is fixed
      const mockItems: Item[] = [
        {
          id: 1,
          title: "Vintage Denim Jacket",
          description: "Classic blue denim jacket in excellent condition",
          point_value: 25,
          images: [{ image: "/placeholder.svg?height=200&width=200" }],
          status: 'available',
          view_count: 15,
          like_count: 8,
          created_at: "2024-01-15",
          category: "outerwear",
          condition: "excellent",
          size: "M",
          color: "Blue",
          brand: "Levi's",
          is_flagged: false
        },
        {
          id: 2,
          title: "Summer Floral Dress",
          description: "Beautiful floral dress perfect for summer",
          point_value: 30,
          images: [{ image: "/placeholder.svg?height=200&width=200" }],
          status: 'available',
          view_count: 22,
          like_count: 12,
          created_at: "2024-01-14",
          category: "dresses",
          condition: "good",
          size: "S",
          color: "Multi",
          brand: "Zara",
          is_flagged: false
        },
        {
          id: 3,
          title: "Nike Running Shoes",
          description: "Comfortable running shoes, barely used",
          point_value: 40,
          images: [{ image: "/placeholder.svg?height=200&width=200" }],
          status: 'available',
          view_count: 35,
          like_count: 20,
          created_at: "2024-01-13",
          category: "shoes",
          condition: "excellent",
          size: "9",
          color: "Black",
          brand: "Nike",
          is_flagged: false
        }
      ]
      
      setItems(mockItems)
      
      // Mock user
      setUser({
        id: 1,
        username: "testuser",
        first_name: "Test",
        last_name: "User",
        email: "test@example.com",
        points: 150,
        profile_picture: null
      })
      
      // Mock categories
      const mockCategories = [
        { value: 'all', label: 'All Categories', count: mockItems.length },
        { value: 'tops', label: 'Tops', count: 0 },
        { value: 'bottoms', label: 'Bottoms', count: 0 },
        { value: 'dresses', label: 'Dresses', count: 1 },
        { value: 'outerwear', label: 'Outerwear', count: 1 },
        { value: 'shoes', label: 'Shoes', count: 1 },
        { value: 'accessories', label: 'Accessories', count: 0 }
      ]
      
      setCategories(mockCategories)
      
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error("Failed to load listings")
    } finally {
      setLoading(false)
    }
  }

  const refreshItems = async () => {
    try {
      setRefreshing(true)
      await loadInitialData()
      toast.success("Listings refreshed!")
    } catch (error) {
      console.error('Failed to refresh items:', error)
      toast.error("Failed to refresh listings")
    } finally {
      setRefreshing(false)
    }
  }

  const filterItems = () => {
    let filtered = [...items]
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.brand?.toLowerCase().includes(term) ||
        item.color?.toLowerCase().includes(term)
      )
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }
    
    setFilteredItems(filtered)
  }

  const handleItemClick = (itemId: number) => {
    // Navigate to item detail page
    router.push(`/app/item/${itemId}`)
  }

  const handleLikeItem = async (itemId: number) => {
    try {
      // Mock like toggle
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, like_count: item.like_count + 1 }
          : item
      ))
      
      toast.success("Item liked!")
    } catch (error) {
      console.error('Failed to toggle like:', error)
      toast.error("Failed to update like status")
    }
  }

  const handleLogout = () => {
    // Mock logout
    router.push('/login')
  }

  const getItemImage = (item: Item): string => {
    if (item.images && item.images.length > 0) {
      return item.images[0].image
    }
    return "/placeholder.svg?height=200&width=200"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ReWear marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ReWear</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 w-full"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshItems}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push('/app/dashboard')}
              >
                <Package className="h-4 w-4 mr-2" />
                Dashboard
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profile_picture || "/placeholder.svg"} />
                      <AvatarFallback>
                        {user?.username?.slice(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.points} points
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/app/dashboard')}>
                    <Package className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories Filter */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="flex items-center gap-2"
              >
                {category.label}
                {category.count !== undefined && (
                  <Badge variant="secondary" className="ml-1">
                    {category.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {selectedCategory === 'all' ? 'All Items' : categories.find(c => c.value === selectedCategory)?.label}
            </h3>
            <p className="text-gray-600 mt-1">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} available
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/app/dashboard/listings/add')}
          >
            Add Item
          </Button>
        </div>

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div onClick={() => handleItemClick(item.id)}>
                  <div className="relative">
                    <img
                      src={getItemImage(item)}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                    {item.is_flagged && (
                      <Badge className="absolute top-2 right-2 bg-red-600">
                        Flagged
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {item.condition}
                      </Badge>
                      <span className="font-semibold text-green-600">
                        {item.point_value} pts
                      </span>
                    </div>
                    
                    {item.brand && (
                      <p className="text-xs text-gray-500 mb-1">
                        Brand: {item.brand}
                      </p>
                    )}
                    
                    {item.size && (
                      <p className="text-xs text-gray-500 mb-2">
                        Size: {item.size}
                      </p>
                    )}
                  </CardContent>
                </div>
                
                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {item.view_count}
                    </span>
                    <span className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {item.like_count}
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLikeItem(item.id)
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Be the first to add an item!'
              }
            </p>
            <div className="mt-6">
              <Button onClick={() => router.push('/app/dashboard/listings/add')}>
                Add New Item
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
