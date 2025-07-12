"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingBag, Heart, Bell, ChevronLeft, ChevronRight } from "lucide-react"
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

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [user, setUser] = useState<User|null>()
  useEffect(() => {
    const storedUser = localStorage.getItem("ReWearUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser)) // ✅ parse back into an object
    }
  }, [])

  console.log(user)

  const carouselImages = [
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
    { id: 1, name: "Electronics", icon: "📱", count: 245 },
    { id: 2, name: "Fashion", icon: "👕", count: 189 },
    { id: 3, name: "Home & Garden", icon: "🏠", count: 156 },
    { id: 4, name: "Sports", icon: "⚽", count: 98 },
    { id: 5, name: "Books", icon: "📚", count: 234 },
    { id: 6, name: "Beauty", icon: "💄", count: 167 },
  ]

  const products: Product[] = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: 99.99,
      image: "/placeholder.svg",
      category: "Electronics",
      rating: 4.5,
      inStock: true,
    },
    {
      id: 2,
      name: "Cotton T-Shirt",
      price: 29.99,
      image: "/placeholder.svg",
      category: "Fashion",
      rating: 4.2,
      inStock: true,
    },
    {
      id: 3,
      name: "Smart Watch",
      price: 199.99,
      image: "/placeholder.svg",
      category: "Electronics",
      rating: 4.7,
      inStock: false,
    },
    {
      id: 4,
      name: "Running Shoes",
      price: 79.99,
      image: "/placeholder.svg",
      category: "Sports",
      rating: 4.4,
      inStock: true,
    },
    {
      id: 5,
      name: "Coffee Maker",
      price: 149.99,
      image: "/placeholder.svg",
      category: "Home & Garden",
      rating: 4.6,
      inStock: true,
    },
    {
      id: 6,
      name: "Skincare Set",
      price: 59.99,
      image: "/placeholder.svg",
      category: "Beauty",
      rating: 4.3,
      inStock: true,
    },
    {
      id: 7,
      name: "Gaming Mouse",
      price: 49.99,
      image: "/placeholder.svg",
      category: "Electronics",
      rating: 4.8,
      inStock: true,
    },
    {
      id: 8,
      name: "Yoga Mat",
      price: 34.99,
      image: "/placeholder.svg",
      category: "Sports",
      rating: 4.1,
      inStock: true,
    },
  ]

  // Mock search function
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Mock search results
      const mockResults: SearchResult[] = [
        {
          id: 1,
          title: `Search result for "${query}"`,
          description: "This is a mock search result",
          category: "Electronics",
        },
        {
          id: 2,
          title: `Another result for "${query}"`,
          description: "This is another mock result",
          category: "Fashion",
        },
        { id: 3, title: `Third result for "${query}"`, description: "Yet another search result", category: "Home" },
      ]

      setSearchResults(mockResults)
      toast.success(`Found ${mockResults.length} results for "${query}"`)
    } catch (error) {
      toast.error("Search failed. Please try again.")
    } finally {
      setIsSearching(false)
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
                <span className="text-xl font-bold">ShopHub</span>
              </div>
            </div>

            <div className="flex-1 mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
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
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                      <AvatarFallback>KS</AvatarFallback>
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
                    <p className="text-xs leading-none text-muted-foreground">kunal@example.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Orders</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 space-y-8">
        {searchResults.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Search Results</h2>
            <div className="grid gap-4">
              {searchResults.map((result) => (
                <Card key={result.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{result.title}</CardTitle>
                    <CardDescription>{result.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">{result.category}</Badge>
                  </CardContent>
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
                className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                  index === currentSlide
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
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
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
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold">${product.price}</span>
                    <Badge variant={product.inStock ? "default" : "secondary"}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 mb-2">
                    <span className="text-sm text-muted-foreground">★ {product.rating}</span>
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full" disabled={!product.inStock}>
                    {product.inStock ? "Add to Cart" : "Out of Stock"}
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

