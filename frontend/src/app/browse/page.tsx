"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Heart, Eye, Filter, Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { itemsAPI, type Item } from "@/lib/api"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FilterState {
  search: string
  category: string
  condition: string
  min_points: string
  max_points: string
}

export default function BrowsePage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    condition: "",
    min_points: "",
    max_points: ""
  })
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([])
  const [conditions, setConditions] = useState<Array<{ value: string; label: string }>>([])
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    currentPage: 1
  })
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    loadItems()
    loadFilterOptions()
  }, [])

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      loadItems()
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [filters])

  const loadItems = async (page = 1) => {
    try {
      setLoading(true)
      
      const params: any = { page }
      
      // Add filters to params
      if (filters.search) params.search = filters.search
      if (filters.category) params.category = filters.category
      if (filters.condition) params.condition = filters.condition
      if (filters.min_points) params.min_points = parseInt(filters.min_points)
      if (filters.max_points) params.max_points = parseInt(filters.max_points)

      const response = await itemsAPI.getAllItems(params)
      
      setItems(response.results)
      setPagination({
        count: response.count,
        next: response.next,
        previous: response.previous,
        currentPage: page
      })
      
    } catch (error) {
      console.error("Failed to load items:", error)
      toast.error("Failed to load items")
    } finally {
      setLoading(false)
    }
  }

  const loadFilterOptions = async () => {
    try {
      const options = await itemsAPI.getCategories()
      setCategories(options.categories)
      setConditions(options.conditions)
    } catch (error) {
      console.error("Failed to load filter options:", error)
    }
  }

  const handleLikeItem = async (itemId: number) => {
    try {
      setActionLoading({ ...actionLoading, [`like_${itemId}`]: true })
      
      const result = await itemsAPI.toggleLike(itemId)
      
      // Update the item in the list
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, like_count: result.like_count }
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

  const handleViewItem = (itemId: number) => {
    window.location.href = `/items/${itemId}`
  }

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "/placeholder.svg"
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl
    
    // If it starts with /media/, prepend the API base URL
    if (imageUrl.startsWith('/media/')) {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
      return `${API_BASE_URL.replace('/api', '')}${imageUrl}`
    }
    
    // Otherwise, assume it needs the full media path
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
    return `${API_BASE_URL.replace('/api', '')}/media/${imageUrl}`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/app">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Browse Items</h1>
              <p className="text-gray-600">
                {pagination.count} items available for swapping
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search items..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
              
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.condition}
                onValueChange={(value) => setFilters({ ...filters, condition: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  {conditions.map(condition => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Min points"
                type="number"
                value={filters.min_points}
                onChange={(e) => setFilters({ ...filters, min_points: e.target.value })}
              />

              <Input
                placeholder="Max points"
                type="number"
                value={filters.max_points}
                onChange={(e) => setFilters({ ...filters, max_points: e.target.value })}
              />
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={() => setFilters({
                  search: "",
                  category: "",
                  condition: "",
                  min_points: "",
                  max_points: ""
                })}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Items Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading items...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search filters or check back later for new items.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative" onClick={() => handleViewItem(item.id)}>
                    <img
                      src={getImageUrl(item.images?.[0]?.image || "")}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        console.error(`Failed to load image: ${getImageUrl(item.images?.[0]?.image || "")}`)
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-white/90">
                        {item.condition}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500 text-white">
                        {item.point_value} pts
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm line-clamp-2 flex-1">{item.title}</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLikeItem(item.id)
                        }}
                        disabled={actionLoading[`like_${item.id}`]}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span className="font-medium">{item.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {item.view_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {item.like_count}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {item.size && `Size: ${item.size}`}
                      </span>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewItem(item.id)
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {((pagination.currentPage - 1) * 20) + 1} to {Math.min(pagination.currentPage * 20, pagination.count)} of {pagination.count} items
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={!pagination.previous || loading}
                  onClick={() => loadItems(pagination.currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={!pagination.next || loading}
                  onClick={() => loadItems(pagination.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
