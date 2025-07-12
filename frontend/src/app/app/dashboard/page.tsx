"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Plus, Eye, Heart, ShoppingCart, Package, Star } from "lucide-react"
import { toast } from "sonner"

// Types
interface UserProfile {
  id: string
  name: string
  email: string
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
}

interface Listing {
  id: string
  title: string
  description: string
  price: number
  image: string
  status: "active" | "sold" | "pending"
  views: number
  likes: number
  createdAt: string
}

interface Purchase {
  id: string
  title: string
  seller: string
  price: number
  image: string
  status: "delivered" | "shipped" | "processing"
  purchaseDate: string
}

export default function SellerDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    id: "1",
    name: "Wise Cobra",
    email: "wise.cobra@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Market Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    bio: "Passionate seller of vintage items and collectibles. I love finding unique pieces and sharing them with fellow enthusiasts.",
    avatar: "/placeholder.svg?height=120&width=120",
    joinDate: "2023-06-15",
    rating: 4.8,
    totalSales: 127,
  })

  const [listings, setListings] = useState<Listing[]>([
    {
      id: "1",
      title: "Vintage Camera Collection",
      description: "Rare vintage cameras from the 1960s",
      price: 299,
      image: "/placeholder.svg?height=200&width=200",
      status: "active",
      views: 45,
      likes: 12,
      createdAt: "2024-01-20",
    },
    {
      id: "2",
      title: "Antique Pocket Watch",
      description: "Beautiful gold-plated pocket watch",
      price: 150,
      image: "/placeholder.svg?height=200&width=200",
      status: "sold",
      views: 23,
      likes: 8,
      createdAt: "2024-01-18",
    },
    {
      id: "3",
      title: "Vinyl Record Collection",
      description: "Classic rock vinyl records",
      price: 75,
      image: "/placeholder.svg?height=200&width=200",
      status: "active",
      views: 67,
      likes: 15,
      createdAt: "2024-01-15",
    },
    {
      id: "4",
      title: "Handmade Jewelry Set",
      description: "Unique handcrafted jewelry pieces",
      price: 89,
      image: "/placeholder.svg?height=200&width=200",
      status: "pending",
      views: 12,
      likes: 3,
      createdAt: "2024-01-22",
    },
  ])

  const [purchases, setPurchases] = useState<Purchase[]>([
    {
      id: "1",
      title: "Designer Handbag",
      seller: "Compassionate Zebra",
      price: 245,
      image: "/placeholder.svg?height=200&width=200",
      status: "delivered",
      purchaseDate: "2024-01-10",
    },
    {
      id: "2",
      title: "Rare Book Collection",
      seller: "Fancy Fish",
      price: 180,
      image: "/placeholder.svg?height=200&width=200",
      status: "shipped",
      purchaseDate: "2024-01-15",
    },
    {
      id: "3",
      title: "Art Print Set",
      seller: "Uncommon Emu",
      price: 65,
      image: "/placeholder.svg?height=200&width=200",
      status: "processing",
      purchaseDate: "2024-01-20",
    },
    {
      id: "4",
      title: "Vintage Lamp",
      seller: "Creative Dolphin",
      price: 120,
      image: "/placeholder.svg?height=200&width=200",
      status: "delivered",
      purchaseDate: "2024-01-08",
    },
  ])

  const handleProfileUpdate = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsEditing(false)
      toast( "Profile Updated",{
        description: "Your profile information has been successfully updated.",
      })
    } catch (error) {
      toast.error("Error",{
        description: "Failed to update profile. Please try again.",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      sold: "secondary",
      pending: "outline",
      delivered: "default",
      shipped: "secondary",
      processing: "outline",
    } as const

    const colors = {
      active: "bg-green-100 text-green-800",
      sold: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      delivered: "bg-green-100 text-green-800",
      shipped: "bg-blue-100 text-blue-800",
      processing: "bg-orange-100 text-orange-800",
    }

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Avatar>
              <AvatarImage src={profile.avatar || "/placeholder.svg"} />
              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
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
              >
                {isEditing ? (
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
                  <AvatarFallback className="text-2xl">{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{profile.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">
                      {profile.rating} ({profile.totalSales} sales)
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Member since {profile.joinDate}</p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={profile.state}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Listings Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                My Listings
              </CardTitle>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Listing
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={listing.image || "/placeholder.svg"}
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">{getStatusBadge(listing.status)}</div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{listing.title}</h3>
                    <p className="text-lg font-bold text-green-600 mb-2">${listing.price}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
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
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Purchases Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              My Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                    <p className="text-lg font-bold text-blue-600 mb-2">${purchase.price}</p>
                    <p className="text-xs text-gray-500 mb-3">Purchased: {purchase.purchaseDate}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Eye className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                      {purchase.status === "delivered" && (
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <Star className="w-3 h-3 mr-1" />
                          Review
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

