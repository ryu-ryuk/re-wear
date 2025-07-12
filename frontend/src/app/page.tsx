"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Repeat, Search, Plus, Star, Users, Shield, Zap, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { getImageUrl } from "@/lib/utils"

interface FeaturedItem {
  id: number
  title: string
  description: string
  images?: Array<{ image: string }>
  image?: string
  category: string
  condition: string
  location?: string
  rating?: number
  swapValue?: string
  point_value?: number
  view_count?: number
  like_count?: number
}

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([])
  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
        const response = await fetch(`${BASE_URL}/items/featured/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const body = await response.json()
          setFeaturedItems(body.results)
          console.log("Featured Items:", body)
        } else {
          // Fallback to demo data if API fails
          setDemoFeaturedItems()
        }
      } catch (error) {
        console.error("Failed to fetch featured items:", error)
        // Fallback to demo data
        setDemoFeaturedItems()
      }
    }
    
    const setDemoFeaturedItems = () => {
      const demoItems: FeaturedItem[] = [
        {
          id: 1,
          title: "Vintage Denim Jacket",
          description: "Classic blue denim jacket in excellent condition. Perfect for casual outings.",
          images: [{ image: "https://picsum.photos/400/300?random=1" }],
          category: "Outerwear",
          condition: "Excellent",
          point_value: 150,
          like_count: 24,
          view_count: 89
        },
        {
          id: 2,
          title: "Designer Sneakers",
          description: "Limited edition sneakers, barely worn. Great for collectors or fashion enthusiasts.",
          images: [{ image: "https://picsum.photos/400/300?random=2" }],
          category: "Footwear",
          condition: "Like New",
          point_value: 200,
          like_count: 18,
          view_count: 67
        },
        {
          id: 3,
          title: "Cozy Winter Sweater",
          description: "Warm wool sweater perfect for cold weather. Soft and comfortable.",
          images: [{ image: "https://picsum.photos/400/300?random=3" }],
          category: "Tops",
          condition: "Good",
          point_value: 80,
          like_count: 15,
          view_count: 45
        },
        {
          id: 4,
          title: "Leather Handbag",
          description: "Elegant leather handbag with multiple compartments. Timeless style.",
          images: [{ image: "https://picsum.photos/400/300?random=4" }],
          category: "Accessories",
          condition: "Very Good",
          point_value: 120,
          like_count: 31,
          view_count: 102
        },
        {
          id: 5,
          title: "Summer Floral Dress",
          description: "Beautiful floral print dress, perfect for summer occasions.",
          images: [{ image: "https://picsum.photos/400/300?random=5" }],
          category: "Dresses",
          condition: "Excellent",
          point_value: 90,
          like_count: 22,
          view_count: 78
        },
        {
          id: 6,
          title: "Athletic Running Shoes",
          description: "High-performance running shoes with minimal wear. Great for fitness enthusiasts.",
          images: [{ image: "https://picsum.photos/400/300?random=6" }],
          category: "Sports",
          condition: "Good",
          point_value: 110,
          like_count: 19,
          view_count: 56
        }
      ]
      setFeaturedItems(demoItems)
    }

    fetchFeaturedItems()
  }, [])




  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(featuredItems.length / 3))
    }, 5000)
    return () => clearInterval(timer)
  }, [featuredItems.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(featuredItems.length / 3))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(featuredItems.length / 3)) % Math.ceil(featuredItems.length / 3))
  }

  const getVisibleItems = () => {
    const itemsPerSlide = 3
    const startIndex = currentSlide * itemsPerSlide
    return featuredItems.slice(startIndex, startIndex + itemsPerSlide)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Repeat className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">SwapHub</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/browse" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Browse Items
              </Link>
              <Button variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Join Now</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Swap, Trade, Discover
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Turn your unused items into treasures you actually want. Join thousands of swappers in the most trusted
              peer-to-peer trading platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/app/dashboard">
                  <Repeat className="mr-2 h-5 w-5" />
                  Start Swapping
                </Link>
              </Button>
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
                <Link href="/browse">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Items
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                <div className="text-muted-foreground">Active Swappers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">200K+</div>
                <div className="text-muted-foreground">Items Swapped</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">98%</div>
                <div className="text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items Carousel */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Items</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing items from our community. From electronics to fashion, find your next treasure.
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getVisibleItems().map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="p-0">
                      <div className="relative">
                        <img
                          src={getImageUrl(item.images?.[0]?.image || item.image)}
                          alt={item.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                          onError={(e) => {
                            console.error(`Failed to load image: ${getImageUrl(item.images?.[0]?.image || item.image)}`)
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                        <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
                          {item.category}
                        </Badge>
                        <Badge variant="secondary" className="absolute top-3 right-3 bg-background/90 text-foreground">
                          {item.condition}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <CardTitle className="mb-2 line-clamp-1">{item.title}</CardTitle>
                      <CardDescription className="mb-4 line-clamp-2">{item.description}</CardDescription>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Points:</span>
                          <span className="font-semibold text-primary">{item.point_value || item.swapValue || 'N/A'}</span>
                        </div>
                        {item.location && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Location:</span>
                            <span>{item.location}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{item.rating || (item.like_count ? `${item.like_count} likes` : '0')}</span>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/app/item/${item.id}`}>
                              View Details
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Carousel Controls */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur"
              onClick={nextSlide}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Carousel Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: Math.ceil(featuredItems.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How SwapHub Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting started is easy. Follow these simple steps to begin your swapping journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. List Your Item</h3>
              <p className="text-muted-foreground">
                Upload photos and describe what you want to swap. Set your preferences and desired items.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Find Matches</h3>
              <p className="text-muted-foreground">
                Browse items or get matched with people who want what you have and have what you want.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Repeat className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Make the Swap</h3>
              <p className="text-muted-foreground">
                Connect with other swappers, arrange the exchange, and enjoy your new treasure!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SwapHub?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="mb-2">Trusted Community</CardTitle>
                <CardDescription>
                  Join a verified community of swappers with ratings and reviews for safe trading.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="mb-2">Secure Platform</CardTitle>
                <CardDescription>
                  Advanced security measures and dispute resolution to protect every transaction.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="mb-2">Instant Matching</CardTitle>
                <CardDescription>Smart algorithms find the perfect matches for your items in seconds.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Swapping?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of happy swappers and turn your unused items into something amazing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/app">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent" asChild>
                <Link href="/browse">Browse Items</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Repeat className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">SwapHub</span>
              </div>
              <p className="text-muted-foreground">
                The most trusted platform for peer-to-peer item swapping and trading.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

