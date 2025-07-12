"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Search,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Package,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { toast } from "sonner"

interface Product {
  id: number
  title: string
  description: string
  images: string[]
  category: string
  condition: string
  location: string
  postedDate: string
  swapValue: string
  owner: {
    name: string
    avatar: string
    rating: number
    totalSwaps: number
    joinDate: string
  }
  specifications: { [key: string]: string }
  swapPreferences: string[]
}

interface SimilarProduct {
  id: number
  title: string
  image: string
  swapValue: string
  location: string
  condition: string
}

export default function ItemListingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSimilarProducts, setShowSimilarProducts] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const [thumbnailScrollPosition, setThumbnailScrollPosition] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Mock product data
  const product: Product = {
    id: 1,
    title: "iPhone 14 Pro Max - 256GB Space Black",
    description: `Excellent condition iPhone 14 Pro Max in Space Black with 256GB storage. This phone has been my daily driver for about 8 months and has been kept in a case with a screen protector since day one. 

The phone is in pristine condition with no scratches, dents, or any signs of wear. Battery health is still at 96% and all functions work perfectly. Includes original box, unused lightning cable, and documentation.

Looking to swap for a high-end Android phone (Samsung Galaxy S24 Ultra, Google Pixel 8 Pro) or a MacBook Air M2. Open to other electronics of similar value.

This is a great opportunity to get a premium iPhone without the premium price tag. The phone has been well-maintained and comes from a smoke-free, pet-free home.`,
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    category: "Electronics",
    condition: "Like New",
    location: "San Francisco, CA",
    postedDate: "2024-01-15",
    swapValue: "$800-900",
    owner: {
      name: "Hemant Jha",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
      totalSwaps: 23,
      joinDate: "2022-03-15",
    },
    specifications: {
      Storage: "256GB",
      Color: "Space Black",
      Condition: "Like New",
      "Battery Health": "96%",
      Carrier: "Unlocked",
      Warranty: "No warranty remaining",
    },
    swapPreferences: [
      "Samsung Galaxy S24 Ultra",
      "Google Pixel 8 Pro",
      "MacBook Air M2",
      'iPad Pro 12.9"',
      "High-end Android phones",
    ],
  }

  const similarProducts: SimilarProduct[] = [
    {
      id: 2,
      title: "iPhone 13 Pro - 128GB",
      image: "/placeholder.svg?height=200&width=200",
      swapValue: "$600-700",
      location: "Oakland, CA",
      condition: "Very Good",
    },
    {
      id: 3,
      title: "Samsung Galaxy S23 Ultra",
      image: "/placeholder.svg?height=200&width=200",
      swapValue: "$750-850",
      location: "San Jose, CA",
      condition: "Excellent",
    },
    {
      id: 4,
      title: "iPhone 14 - 256GB Blue",
      image: "/placeholder.svg?height=200&width=200",
      swapValue: "$650-750",
      location: "Berkeley, CA",
      condition: "Like New",
    },
    {
      id: 5,
      title: "Google Pixel 8 Pro",
      image: "/placeholder.svg?height=200&width=200",
      swapValue: "$700-800",
      location: "Palo Alto, CA",
      condition: "Very Good",
    },
  ]

  // Handle scroll to show similar products
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Show similar products when user scrolls past 60% of the page
      if (scrollPosition > (documentHeight - windowHeight) * 0.6) {
        setShowSimilarProducts(true)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist")
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link copied to clipboard!")
  }

  const handleContact = () => {
    toast.success("Opening chat with Hemant Jha...")
  }

  const handleSwapRequest = () => {
    toast.success("Swap request sent!")
  }

  const scrollThumbnails = (direction: "left" | "right") => {
    const container = document.getElementById("thumbnail-container")
    if (!container) return

    const scrollAmount = 200 // Adjust based on thumbnail width
    const newPosition =
      direction === "left"
        ? Math.max(0, thumbnailScrollPosition - scrollAmount)
        : thumbnailScrollPosition + scrollAmount

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    })

    setThumbnailScrollPosition(newPosition)
    updateScrollButtons(newPosition, container)
  }

  const updateScrollButtons = (scrollLeft: number, container: HTMLElement) => {
    const maxScroll = container.scrollWidth - container.clientWidth
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < maxScroll - 10) // 10px buffer
  }

  const handleThumbnailScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const scrollLeft = container.scrollLeft
    setThumbnailScrollPosition(scrollLeft)
    updateScrollButtons(scrollLeft, container)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <Package className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">SwapHub</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>HJ</AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium">Hemant Jha</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={product.images[currentImageIndex] || "/placeholder.svg"}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Thumbnail Images */}
            <div className="relative">
              {product.images.length > 4 ? (
                // Carousel version for more than 4 images
                <div className="relative">
                  {canScrollLeft && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 backdrop-blur shadow-md"
                      onClick={() => scrollThumbnails("left")}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}

                  <div
                    id="thumbnail-container"
                    className="flex gap-2 overflow-x-auto scrollbar-hide px-8"
                    onScroll={handleThumbnailScroll}
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex ? "border-primary" : "border-muted"
                        }`}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${product.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>

                  {canScrollRight && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 backdrop-blur shadow-md"
                      onClick={() => scrollThumbnails("right")}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ) : (
                // Grid version for 4 or fewer images
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? "border-primary" : "border-muted"
                      }`}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{product.title}</h1>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={handleWishlist}>
                    <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{product.category}</Badge>
                <Badge variant="outline">{product.condition}</Badge>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{product.swapValue}</Badge>
              </div>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{product.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Posted {new Date(product.postedDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Owner Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={product.owner.avatar || "/placeholder.svg"} alt={product.owner.name} />
                    <AvatarFallback>
                      {product.owner.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.owner.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{product.owner.rating}</span>
                      </div>
                      <span>•</span>
                      <span>{product.owner.totalSwaps} swaps</span>
                      <span>•</span>
                      <span>Joined {new Date(product.owner.joinDate).getFullYear()}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleContact}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button className="flex-1" size="lg" onClick={handleSwapRequest}>
                Request Swap
              </Button>
              <Button variant="outline" size="lg">
                Make Offer
              </Button>
            </div>

            {/* Trust & Safety */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-blue-800">
                  <Shield className="h-5 w-5" />
                  <span className="font-semibold">SwapHub Protection</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  All swaps are protected by our secure platform and dispute resolution system.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Information Tabs */}
        <Tabs defaultValue="description" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="swap-preferences">Swap Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  {product.description.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0 text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-muted last:border-b-0">
                      <span className="font-medium">{key}:</span>
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="swap-preferences" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">What I'm looking for:</h3>
                <div className="space-y-2">
                  {product.swapPreferences.map((preference, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>{preference}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Similar Products Section */}
        {showSimilarProducts && (
          <section className="animate-in slide-in-from-bottom-4 duration-500">
            <Separator className="mb-8" />
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Similar Items</h2>
              <p className="text-muted-foreground">You might also be interested in these items</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <CardHeader className="p-0">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 line-clamp-2">{item.title}</CardTitle>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-primary">{item.swapValue}</span>
                        <Badge variant="outline">{item.condition}</Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

