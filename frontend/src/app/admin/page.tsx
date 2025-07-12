"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, UserIcon, ShoppingCart, List, Check, X, Ban, Eye, AlertTriangle, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// Types
interface AdminUser {
  id: string
  name: string
  email: string
  avatar: string
  status: "active" | "suspended" | "pending"
  joinDate: string
  listingsCount: number
}

interface Listing {
  id: string
  title: string
  description: string
  price: number
  image: string
  status: "pending" | "approved" | "rejected"
  userId: string
  userName: string
  createdAt: string
  flagged: boolean
}

interface Order {
  id: string
  buyerName: string
  sellerName: string
  itemTitle: string
  amount: number
  status: "pending" | "completed" | "cancelled"
  createdAt: string
}

export default function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<AdminUser[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    loadMockData()
  }, [])

  const loadMockData = () => {
    setUsers([
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "active",
        joinDate: "2024-01-15",
        listingsCount: 5,
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "pending",
        joinDate: "2024-01-20",
        listingsCount: 2,
      },
      {
        id: "3",
        name: "Mysterious Dave",
        email: "dave@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "suspended",
        joinDate: "2024-01-10",
        listingsCount: 8,
      },
    ])

    setListings([
      {
        id: "1",
        title: "Vintage Camera",
        description: "Classic film camera in excellent condition",
        price: 299,
        image: "/placeholder.svg?height=100&width=100",
        status: "pending",
        userId: "1",
        userName: "John Doe",
        createdAt: "2024-01-25",
        flagged: false,
      },
      {
        id: "2",
        title: "Suspicious Item",
        description: "This looks like spam content...",
        price: 1,
        image: "/placeholder.svg?height=100&width=100",
        status: "pending",
        userId: "3",
        userName: "Mysterious Dave",
        createdAt: "2024-01-24",
        flagged: true,
      },
    ])

    setOrders([
      {
        id: "1",
        buyerName: "Alice Johnson",
        sellerName: "John Doe",
        itemTitle: "Vintage Camera",
        amount: 299,
        status: "pending",
        createdAt: "2024-01-25",
      },
    ])
  }

  // Network request functions
  const approveUser = async (userId: string) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, status: "active" as const } : user)))

      toast.success( "User Approved")
    } catch (error) {
      toast.error( "Failed to approve user. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const suspendUser = async (userId: string) => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, status: "suspended" as const } : user)))

      toast.warning("User Suspended")

    } catch (error) {
      toast.error("Failed to suspend user. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const approveListing = async (listingId: string) => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setListings((prev) =>
        prev.map((listing) => (listing.id === listingId ? { ...listing, status: "approved" as const } : listing)),
      )


      try {
        toast.success("Listing Approved", {
          description: "Listing has been approved and is now live.",
        })
      } catch (error) {
        toast.error("Error", {
          description: "Failed to approve listing. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const rejectListing = async (listingId: string) => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setListings((prev) =>
        prev.map((listing) => (listing.id === listingId ? { ...listing, status: "rejected" as const } : listing)),
      )

      try {
        toast.error("Listing Rejected", {
          description: "Listing has been rejected and removed from public view.",
        })
      } catch (error) {
        toast.error("Error", {
          description: "Failed to reject listing. Please try again.",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const removeListing = async (listingId: string) => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setListings((prev) => prev.filter((listing) => listing.id !== listingId))

    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      pending: "secondary",
      suspended: "destructive",
      approved: "default",
      rejected: "destructive",
      completed: "default",
      cancelled: "destructive",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
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
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Manage Users
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Manage Orders
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Manage Listings
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{user.name}</h3>
                          {getStatusBadge(user.status)}
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Joined: {user.joinDate} • {user.listingsCount} listings
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {user.status === "pending" && (
                          <Button size="sm" onClick={() => approveUser(user.id)} disabled={loading}>
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        {user.status === "active" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => suspendUser(user.id)}
                            disabled={loading}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Suspend
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>View Listings</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Manage Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">Order #{order.id}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.buyerName} → {order.sellerName}
                        </p>
                        <p className="text-sm text-gray-600">{order.itemTitle}</p>
                        <p className="text-xs text-gray-500">
                          ${order.amount} • {order.createdAt}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                            <DropdownMenuItem>Cancel Order</DropdownMenuItem>
                            <DropdownMenuItem>Contact Buyer</DropdownMenuItem>
                            <DropdownMenuItem>Contact Seller</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>Manage Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div key={listing.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={listing.image || "/placeholder.svg"}
                        alt={listing.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{listing.title}</h3>
                          {getStatusBadge(listing.status)}
                          {listing.flagged && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Flagged
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{listing.description}</p>
                        <p className="text-sm text-gray-600">
                          By {listing.userName} • ${listing.price}
                        </p>
                        <p className="text-xs text-gray-500">{listing.createdAt}</p>
                      </div>

                      <div className="flex gap-2">
                        {listing.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => approveListing(listing.id)} disabled={loading}>
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectListing(listing.id)}
                              disabled={loading}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {listing.flagged && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeListing(listing.id)}
                            disabled={loading}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Full Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Contact Seller</DropdownMenuItem>
                            <DropdownMenuItem>Flag as Inappropriate</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

