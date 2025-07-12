"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingBag, Heart, Bell, ChevronLeft, ChevronRight, Package, LogOut, RefreshCw } from "lucide-react"
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

interface User {
  first_name: string
  last_name: string
  email: string
  username: string
}

interface SearchResult {
  id: number
  title: string
  description: string
  category: string
}

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  rating: number
  inStock: boolean
}

interface Category {
  id: number
  name: string
  icon: string
  count: number
}

export default function MainAppPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Item[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [user, setUser] = useState<User | null>()
  const [products, setProducts] = useState()
  useEffect(() => {
    const storedUser = localStorage.getItem("ReWearUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser)) // ✅ parse back into an object
    }
    const fetchFeaturedItems = async () => {
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
        const response = await fetch(`${BASE_URL}/items/featured/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const body = await response.json()
        setProducts(body.results)
        console.log("Featured Items:", body.results)
        // You can now set them in state if needed
      } catch (error) {
        console.error("Failed to fetch featured items:", error)
      }
    }
    fetchFeaturedItems()
    console.log(products)
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)

      // Check if user is authenticated
      const storedUser = localStorage.getItem("ReWearUser")
      const token = localStorage.getItem("ReWearToken")

      if (!storedUser || !token) {
        router.push("/login")
        return
      }

      // Load user profile
      const userProfile = await userAPI.getProfile()
      setUser(userProfile)

      // Load available items for browsing
      const itemsData = await itemsAPI.getAllItems({ page: 1 })
      setItems(itemsData.results)

      // Load categories and create category data
      try {
        const categoriesResponse = await itemsAPI.getCategories()
        const categoryNames = categoriesResponse.categories || []
        setAvailableCategories(categoryNames)

        // Create category data with icons and counts
        const categoryIcons: Record<string, string> = {
          'Tops': '👕',
          'Bottoms': '👖',
          'Dresses': '👗',
          'Outerwear': '🧥',
          'Shoes': '👟',
          'Accessories': '👒',
          'Bags': '👜',
          'Activewear': '🤸',
          'Underwear': '🩲',
          'Other': '📦'
        }

        const categoryData: Category[] = categoryNames.map((name, index) => ({
          id: index + 1,
          name,
          icon: categoryIcons[name] || '📦',
          count: itemsData.results.filter(item => item.category === name).length
        }))

        setCategoriesData(categoryData)
      } catch (error) {
        console.error("Failed to load categories:", error)
      }

    } catch (error) {
      console.error("Failed to load initial data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const carouselImages = [
    {
      id: 1,
      src: "/placeholder.svg",
      alt: "Welcome to ReWear",
      title: "Welcome to ReWear",
      subtitle: "Swap clothes, earn points, save the planet",
    },
    {
      id: 2,
      src: "/placeholder.svg",
      alt: "New Swapables",
      title: "New Swapables",
      subtitle: "New swaps just rolled in",
    },
    {
      id: 3,
      src: "/placeholder.svg",
      alt: "Best Sellers",
      title: "Best Sellers",
      subtitle: "Customer favorites",
    },
  ]

  const categories: Category[] = [
    { "id": 1, "name": "Tops", "icon": "👕", "count": 5 },
    { "id": 2, "name": "Bottoms", "icon": "👖", "count": 4 },
    { "id": 3, "name": "Dresses", "icon": "👗", "count": 5 },
    { "id": 4, "name": "Outerwear", "icon": "🧥", "count": 7 },
    { "id": 5, "name": "Shoes", "icon": "👟", "count": 12 },
    { "id": 6, "name": "Accessories", "icon": "👒", "count": 12 },
    { "id": 7, "name": "Bags", "icon": "👜", "count": 19 },
    { "id": 8, "name": "Activewear", "icon": "🤸", "count": 11 },
    { "id": 9, "name": "Underwear", "icon": "🩲", "count": 2 },
    { "id": 10, "name": "Other", "icon": "📦", "count": 2 }
  ]

  const router = useRouter()

  // Mock search function
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const searchData = await itemsAPI.getAllItems({
        search: query,
        page: 1
      })

      setSearchResults(searchData.results)
      toast.success(`Found ${searchData.results.length} results for "${query}"`)
    } catch (error) {
      console.error("Search failed:", error)
      toast.error("Search failed. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  // Handle item actions
  const handleLikeItem = async (itemId: number) => {
    try {
      await itemsAPI.toggleLike(itemId)
      // Refresh items to update like counts
      loadInitialData()
      toast.success("Item liked!")
    } catch (error) {
      console.error("Failed to like item:", error)
      toast.error("Failed to like item")
    }
  }

  const handleViewItem = (itemId: number) => {
    router.push(`/app/items/${itemId}`)
  }

  const handleSwapRequest = (itemId: number) => {
    router.push(`/app/swaps/new?item=${itemId}`)
  }

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/app/browse?category=${encodeURIComponent(categoryName)}`)
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
      toast.error("Logout failed")
    }
  }

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [carouselImages.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">ReWear</span>
              </div>
            </div>

            <div className="flex-1 mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                  className="pl-10 pr-4"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => router.push("/app/liked")}>
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => router.push("/app/notifications")}>
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={loadInitialData}>
                <RefreshCw className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.first_name?.[0]}
                        {user?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      {user && (
                        <p className="text-sm font-medium leading-none">
                          {user.first_name + " " + user.last_name}
                        </p>
                      )}
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/app/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/app/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/app/listings")}>
                    My Listings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/app/swaps")}>
                    My Swaps
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    localStorage.removeItem("ReWearUser")
                    localStorage.removeItem("ReWearToken")
                  }}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <main className="container mx-auto py-6 space-y-8">
          {/* Search Results */}
          {searchResults.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Search Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {searchResults.map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="p-0">
                      <img
                        src={item.images[0]?.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    </CardHeader>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-primary">{item.point_value} pts</span>
                        <Badge variant={item.status === 'available' ? "default" : "secondary"}>
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1 mb-2">
                        <span className="text-sm text-muted-foreground">❤️ {item.like_count}</span>
                        <span className="text-sm text-muted-foreground">👀 {item.view_count}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleViewItem(item.id)}
                        className="flex-1"
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLikeItem(item.id)}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <section className="relative">
            <div className="relative h-64 md:h-80 overflow-hidden rounded-lg">
              {carouselImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`absolute inset-0 transition-transform duration-500 ease-in-out ${index === currentSlide
                      ? "translate-x-0"
                      : index < currentSlide
                        ? "-translate-x-full"
                        : "translate-x-full"
                    }`}
                >
                  <img src={image.src || "/placeholder.svg"} alt={image.alt} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h2 className="text-3xl md:text-4xl font-bold mb-2">{image.title}</h2>
                      <p className="text-lg md:text-xl">{image.subtitle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80"
              onClick={nextSlide}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </section>

          {/* Categories Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categoriesData.map((category) => (
                <Card
                  key={category.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} items</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Product Listings */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <Button variant="outline">View All</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products?.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{product.title}</h3>
                    <div className="flex items-center justify-between mb-2">
                    </div>
                    <div className="flex items-center space-x-1 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full" >
                      Swap/Buy
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        </main>
    </div>
  )
}


