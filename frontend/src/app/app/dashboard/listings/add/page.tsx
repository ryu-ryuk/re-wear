"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Upload, X, Save, Eye, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface ListingImage {
  id: string
  url: string
  name: string
}

interface PreviousListing {
  id: string
  title: string
  price: number
  image: string
  status: "active" | "sold" | "draft"
}

interface ListingData {
  id: string
  title: string
  description: string
  price: string
  category: string
  condition: string
  availability: string
  images: ListingImage[]
  status: string
  createdAt: string
  updatedAt: string
}

export default function EditListingPage() {
  const searchParams = useSearchParams()
  const listingId = searchParams.get("id")
  const isEditing = !!listingId

  const [searchTerm, setSearchTerm] = useState("Bharat Surana")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [condition, setCondition] = useState("")
  const [availability, setAvailability] = useState("Available")
  const [images, setImages] = useState<ListingImage[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEditing)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [previousListings] = useState<PreviousListing[]>([
    {
      id: "1",
      title: "Vintage Camera",
      price: 299,
      image: "/placeholder.svg?height=150&width=150",
      status: "active",
    },
    {
      id: "2",
      title: "Antique Watch",
      price: 150,
      image: "/placeholder.svg?height=150&width=150",
      status: "sold",
    },
    {
      id: "3",
      title: "Vinyl Records",
      price: 75,
      image: "/placeholder.svg?height=150&width=150",
      status: "active",
    },
    {
      id: "4",
      title: "Art Print",
      price: 45,
      image: "/placeholder.svg?height=150&width=150",
      status: "draft",
    },
  ])

  // Mock database of listings
  const mockListings: Record<string, ListingData> = {
    "1": {
      id: "1",
      title: "Vintage Camera Collection",
      description:
        "Beautiful vintage camera in excellent condition. Perfect for photography enthusiasts and collectors. Includes original case and manual. This camera has been well-maintained and is ready for its next owner.",
      price: "299",
      category: "Electronics",
      condition: "Excellent",
      availability: "Available",
      status: "active",
      createdAt: "2024-01-20",
      updatedAt: "2024-01-22",
      images: [
        {
          id: "img1",
          url: "/placeholder.svg?height=200&width=200",
          name: "Courageous Woodpecker",
        },
        {
          id: "img2",
          url: "/placeholder.svg?height=200&width=200",
          name: "Camera Front View",
        },
      ],
    },
    "2": {
      id: "2",
      title: "Antique Pocket Watch",
      description:
        "Rare gold-plated pocket watch from the 1920s. Mechanical movement still works perfectly. Comes with original chain and presentation box.",
      price: "150",
      category: "Collectibles",
      condition: "Good",
      availability: "Swap",
      status: "sold",
      createdAt: "2024-01-18",
      updatedAt: "2024-01-19",
      images: [
        {
          id: "img3",
          url: "/placeholder.svg?height=200&width=200",
          name: "Pocket Watch",
        },
      ],
    },
    "3": {
      id: "3",
      title: "Vinyl Record Collection",
      description:
        "Classic rock vinyl records from the 70s and 80s. All in excellent condition with minimal wear. Perfect for collectors or music lovers.",
      price: "75",
      category: "Music",
      condition: "Very Good",
      availability: "Available",
      status: "active",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-16",
      images: [
        {
          id: "img4",
          url: "/placeholder.svg?height=200&width=200",
          name: "Vinyl Collection",
        },
      ],
    },
    "4": {
      id: "4",
      title: "Handmade Art Print",
      description:
        "Original watercolor art print. Limited edition piece by local artist. Perfect for home decoration or as a gift.",
      price: "45",
      category: "Art",
      condition: "New",
      availability: "Available",
      status: "draft",
      createdAt: "2024-01-22",
      updatedAt: "2024-01-22",
      images: [
        {
          id: "img5",
          url: "/placeholder.svg?height=200&width=200",
          name: "Art Print",
        },
      ],
    },
  }

  // Load listing data based on ID
  useEffect(() => {
    if (isEditing && listingId) {
      loadListingData(listingId)
    } else {
      // Reset form for new listing
      resetForm()
    }
  }, [listingId, isEditing])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setPrice("")
    setCategory("")
    setCondition("")
    setAvailability("Available")
    setImages([])
  }

  // Simulated network request functions
  const loadListingData = async (id: string) => {
    setInitialLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const listingData = mockListings[id]

      if (!listingData) {
        throw new Error("Listing not found")
      }

      // Populate form with existing data
      setTitle(listingData.title)
      setDescription(listingData.description)
      setPrice(listingData.price)
      setCategory(listingData.category)
      setCondition(listingData.condition)
      setAvailability(listingData.availability)
      setImages(listingData.images)

      toast("Listing Loaded", {description: `Editing "${listingData.title}"`})
    } catch (error) {
      toast.error("Load Failed",{
        description: error instanceof Error ? error.message : "Failed to load listing data.",
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    setLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate successful upload
      const imageUrl = URL.createObjectURL(file)

      toast("Image Uploaded",{
        description: `${file.name} has been uploaded successfully.`,
      })

      return imageUrl
    } catch (error) {
      toast.error( "Upload Failed",{
        description: "Failed to upload image. Please try again.",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const saveListing = async () => {
    setLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate validation
      if (!title || !description || !price) {
        throw new Error("Please fill in all required fields")
      }

      const listingData = {
        id: listingId || `new_${Date.now()}`,
        title,
        description,
        price,
        category,
        condition,
        availability,
        images: images.map((img) => img.url),
        status: "draft",
      }

      console.log(isEditing ? "Updating listing:" : "Creating new listing:", listingData)

      toast(isEditing ? "Listing Updated" : "Listing Created",{
        description: isEditing
          ? "Your listing has been updated successfully."
          : "Your new listing has been saved as draft.",
      })
    } catch (error) {
      toast.error("Save Failed",{
        description: error instanceof Error ? error.message : "Failed to save listing.",
      })
    } finally {
      setLoading(false)
    }
  }

  const publishListing = async () => {
    setLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // Simulate validation
      if (!title || !description || !price || images.length === 0) {
        throw new Error("Please complete all fields and add at least one image")
      }

      const listingData = {
        id: listingId || `new_${Date.now()}`,
        title,
        description,
        price,
        category,
        condition,
        availability,
        images: images.map((img) => img.url),
        status: "active",
      }

      console.log(isEditing ? "Publishing updated listing:" : "Publishing new listing:", listingData)

      toast("Listing Published",{
        description: "Your listing is now live and visible to buyers.",
      })
    } catch (error) {
      toast.error("Publish Failed",{
        description: error instanceof Error ? error.message : "Failed to publish listing.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      try {
        const imageUrl = await uploadImage(file)
        const newImage: ListingImage = {
          id: Date.now().toString(),
          url: imageUrl,
          name: file.name,
        }
        setImages((prev) => [...prev, newImage])
      } catch (error) {
        console.error("Failed to upload image:", error)
      }
    }
  }

  const removeImage = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      sold: "bg-blue-100 text-blue-800",
      draft: "bg-gray-100 text-gray-800",
    }

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{isEditing ? "Edit Listing" : "Create New Listing"}</h1>
              {isEditing && listingId && <p className="text-sm text-gray-600 mt-1">Listing ID: {listingId}</p>}
            </div>
          </div>
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
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Status Banner for Editing */}
        {isEditing && listingId && mockListings[listingId] && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Editing: {mockListings[listingId].title}</h3>
                <p className="text-sm text-blue-700">
                  Status: {getStatusBadge(mockListings[listingId].status)} • Last updated:{" "}
                  {mockListings[listingId].updatedAt}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Side - Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isEditing ? "Update Images" : "Add Images"}
                {images.length > 0 && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({images.length} image{images.length !== 1 ? "s" : ""})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors mb-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Click to upload images</p>
                <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Uploaded Images */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button size="sm" variant="destructive" onClick={() => removeImage(image.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-center mt-2 text-gray-600 truncate">{image.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Side - Product Description */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{isEditing ? "Update Product Description" : "Add Product Description"}</CardTitle>
                <Badge variant="secondary">Assured Pony</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter product title"
                />
              </div>

              <div>
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Electronics, Clothing, Books"
                />
              </div>

              <div>
                <Label htmlFor="condition">Condition</Label>
                <Input
                  id="condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="e.g., New, Like New, Good, Fair"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your product in detail..."
                  rows={6}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={availability === "Available" ? "default" : "outline"}
                  onClick={() => setAvailability("Available")}
                  className="flex-1"
                >
                  Available
                </Button>
                <Button
                  variant={availability === "Swap" ? "default" : "outline"}
                  onClick={() => setAvailability("Swap")}
                  className="flex-1"
                >
                  Swap
                </Button>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={saveListing} disabled={loading} className="flex-1 bg-transparent">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : isEditing ? "Update Draft" : "Save Draft"}
                </Button>
                <Button onClick={publishListing} disabled={loading} className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  {loading ? "Publishing..." : isEditing ? "Update & Publish" : "Publish"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Previous Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Previous Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {previousListings.map((listing) => (
                <Link key={listing.id} href={`/edit-listing?id=${listing.id}`}>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={listing.image || "/placeholder.svg"}
                        alt={listing.title}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2">{getStatusBadge(listing.status)}</div>
                      {listingId === listing.id && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="default" className="bg-blue-600">
                            Editing
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{listing.title}</h3>
                      <p className="text-lg font-bold text-green-600">${listing.price}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

