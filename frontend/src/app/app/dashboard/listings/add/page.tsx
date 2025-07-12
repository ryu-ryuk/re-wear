"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, Save, ArrowLeft, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { itemsAPI, userAPI, isAuthenticated } from "@/lib/api"

interface ListingImage {
  id: string
  file: File
  url: string
  name: string
}

interface CategoryOption {
  value: string
  label: string
}

export default function AddEditListingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const listingId = searchParams.get("id")
  const isEditing = !!listingId

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [pointValue, setPointValue] = useState("")
  const [category, setCategory] = useState("")
  const [condition, setCondition] = useState("")
  const [size, setSize] = useState("")
  const [color, setColor] = useState("")
  const [brand, setBrand] = useState("")
  const [tags, setTags] = useState("")
  const [images, setImages] = useState<ListingImage[]>([])
  
  // Options from backend
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [conditions, setConditions] = useState<CategoryOption[]>([])
  
  // Loading states
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  
  // User info
  const [user, setUser] = useState<any>(null)
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    
    loadUserData()
    loadCategories()
  }, [router])

  const loadUserData = async () => {
    try {
      const userData = await userAPI.getProfile()
      setUser(userData)
    } catch (error) {
      console.error('Failed to load user data:', error)
      toast.error("Failed to load user data")
    }
  }

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true)
      const data = await itemsAPI.getCategories()
      setCategories(data.categories)
      setConditions(data.conditions)
    } catch (error) {
      console.error('Failed to load categories:', error)
      toast.error("Failed to load form options")
      // Fallback to mock data if API fails
      setCategories([
        { value: 'tops', label: 'Tops' },
        { value: 'bottoms', label: 'Bottoms' },
        { value: 'dresses', label: 'Dresses' },
        { value: 'shoes', label: 'Shoes' },
        { value: 'accessories', label: 'Accessories' }
      ])
      
      setConditions([
        { value: 'new', label: 'New (with tags)' },
        { value: 'excellent', label: 'Excellent' },
        { value: 'good', label: 'Good' },
        { value: 'fair', label: 'Fair' }
      ])
    } finally {
      setCategoriesLoading(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    // Check total image limit
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed per item")
      return
    }

    for (const file of Array.from(files)) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB.`)
        continue
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file.`)
        continue
      }

      const newImage: ListingImage = {
        id: Date.now().toString() + Math.random(),
        file,
        url: URL.createObjectURL(file),
        name: file.name,
      }
      
      setImages(prev => [...prev, newImage])
    }
  }

  const removeImage = (imageId: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== imageId)
      // Clean up object URLs to prevent memory leaks
      const imageToRemove = prev.find(img => img.id === imageId)
      if (imageToRemove && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url)
      }
      return updated
    })
  }

  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.error("Product title is required")
      return false
    }
    
    if (!description.trim()) {
      toast.error("Product description is required")
      return false
    }
    
    if (!pointValue || parseInt(pointValue) < 1 || parseInt(pointValue) > 100) {
      toast.error("Point value must be between 1 and 100")
      return false
    }
    
    if (!category) {
      toast.error("Category is required")
      return false
    }
    
    if (!condition) {
      toast.error("Condition is required")
      return false
    }
    
    if (!size.trim()) {
      toast.error("Size is required")
      return false
    }
    
    if (images.filter(img => img.file).length === 0) {
      toast.error("At least one image is required")
      return false
    }
    
    return true
  }

  const createFormData = (): FormData => {
    const formData = new FormData()
    
    formData.append('title', title.trim())
    formData.append('description', description.trim())
    formData.append('point_value', pointValue)
    formData.append('category', category)
    formData.append('condition', condition)
    formData.append('size', size.trim())
    
    if (color.trim()) formData.append('color', color.trim())
    if (brand.trim()) formData.append('brand', brand.trim())
    
    // Convert tags to array
    if (tags.trim()) {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      tagsArray.forEach(tag => formData.append('tags_list', tag))
    }
    
    // Add new images
    const newImages = images.filter(img => img.file)
    newImages.forEach(img => {
      formData.append('uploaded_images', img.file)
    })
    
    return formData
  }

  const saveListing = async () => {
    if (!validateForm()) return
    
    setLoading(true)
    try {
      const formData = createFormData()
      
      let result
      if (isEditing && listingId) {
        result = await itemsAPI.updateItem(parseInt(listingId), formData)
        toast.success("Listing updated successfully!")
      } else {
        result = await itemsAPI.createItem(formData)
        toast.success("Listing created successfully!")
      }
      
      console.log('Item created/updated:', result)
      
      // Redirect to dashboard after successful save
      router.push('/app/dashboard')
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error(error.message || "Failed to save listing")
    } finally {
      setLoading(false)
    }
  }

  // Show loading spinner while loading initial data
  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form options...</p>
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
            <Link href="/app/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? "Edit Listing" : "Add New Listing"}
              </h1>
              {isEditing && listingId && (
                <p className="text-sm text-gray-600 mt-1">Listing ID: {listingId}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={user?.profile_picture || "/placeholder.svg"} />
              <AvatarFallback>
                {user?.username?.slice(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-right">
              <p className="font-medium">{user?.username || "User"}</p>
              <p className="text-sm text-gray-600">{user?.points || 0} points</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Product Images
                {images.length > 0 && (
                  <Badge variant="secondary">{images.length}/5</Badge>
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
                <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB each (max 5 images)</p>
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
                  {images.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => removeImage(image.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      {index === 0 && (
                        <Badge className="absolute top-2 left-2 bg-blue-600">
                          Primary
                        </Badge>
                      )}
                      <p className="text-xs text-center mt-2 text-gray-600 truncate">
                        {image.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Side - Product Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter product title"
                  maxLength={255}
                />
              </div>

              {/* Point Value */}
              <div>
                <Label htmlFor="pointValue">Point Value * (1-100)</Label>
                <Input
                  id="pointValue"
                  type="number"
                  value={pointValue}
                  onChange={(e) => setPointValue(e.target.value)}
                  placeholder="Points needed to redeem"
                  min="1"
                  max="100"
                />
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Condition */}
              <div>
                <Label htmlFor="condition">Condition *</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((cond) => (
                      <SelectItem key={cond.value} value={cond.value}>
                        {cond.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Size */}
              <div>
                <Label htmlFor="size">Size *</Label>
                <Input
                  id="size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="e.g., S, M, L, XL, 32, 8"
                />
              </div>

              {/* Color */}
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g., Red, Blue, Black"
                />
              </div>

              {/* Brand */}
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., Nike, Zara, H&M"
                />
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., vintage, summer, casual (comma-separated)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate tags with commas to help users find your item
                </p>
              </div>

              {/* Description */}
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

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={saveListing}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {isEditing ? "Updating..." : "Creating..."}
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditing ? "Update Listing" : "Create Listing"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Text */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tips for a great listing</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Upload clear, well-lit photos from multiple angles</li>
                  <li>• Set the first image as your best shot - it becomes the primary image</li>
                  <li>• Be honest about the condition to build trust</li>
                  <li>• Include relevant tags to help users discover your item</li>
                  <li>• Set a fair point value based on the item's condition and desirability</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
