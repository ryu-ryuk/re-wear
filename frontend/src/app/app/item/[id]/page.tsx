"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Heart, Share2, Flag, MessageCircle, Star, Eye, MapPin, Calendar, User, Zap } from "lucide-react"
import { toast } from "sonner"
import { itemsAPI, swapsAPI, type Item } from "@/lib/api"
import { getImageUrl } from "@/lib/utils"
import Link from "next/link"

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (params.id) {
      loadItem()
    }
  }, [params.id])

  const loadItem = async () => {
    try {
      setLoading(true)
      const itemData = await itemsAPI.getItem(Number(params.id))
      setItem(itemData)
    } catch (error) {
      console.error("Failed to load item:", error)
      toast.error("Failed to load item details")
      router.push("/browse")
    } finally {
      setLoading(false)
    }
  }

  const handleLikeItem = async () => {
    if (!item) return
    
    try {
      setActionLoading({ ...actionLoading, like: true })
      const result = await itemsAPI.toggleLike(item.id)
      setItem({ ...item, like_count: result.like_count })
      toast.success(result.liked ? "Item liked!" : "Item unliked!")
    } catch (error) {
      console.error("Failed to like item:", error)
      toast.error("Failed to update like status")
    } finally {
      setActionLoading({ ...actionLoading, like: false })
    }
  }

  const handleRequestSwap = async () => {
    if (!item) return
    
    try {
      setActionLoading({ ...actionLoading, swap: true })
      // Navigate to swap request page or open modal
      router.push(`/app/swaps/request?item=${item.id}`)
    } catch (error) {
      console.error("Failed to initiate swap:", error)
      toast.error("Failed to request swap")
    } finally {
      setActionLoading({ ...actionLoading, swap: false })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading item details...</p>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h2>
          <p className="text-gray-600 mb-6">The item you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/browse">Back to Browse</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleLikeItem} disabled={actionLoading.like}>
              <Heart className="w-4 h-4 mr-2" />
              {item.like_count}
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Flag className="w-4 h-4 mr-2" />
              Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={getImageUrl(item.images?.[currentImageIndex]?.image || "")}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error(`Failed to load image: ${getImageUrl(item.images?.[currentImageIndex]?.image || "")}`)
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="bg-white/90">
                  {item.condition}
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500 text-white">
                  {item.point_value} pts
                </Badge>
              </div>
            </div>
            
            {/* Thumbnail Gallery */}
            {item.images && item.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                      currentImageIndex === index ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={getImageUrl(image.image)}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/400x300?text=No+Image"
                }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {item.view_count} views
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {item.like_count} likes
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed">{item.description}</p>
            </div>

            {/* Item Info */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Item Details</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <Badge variant="outline">{item.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Condition:</span>
                  <span className="font-medium">{item.condition}</span>
                </div>
                {item.size && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{item.size}</span>
                  </div>
                )}
                {item.brand && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brand:</span>
                    <span className="font-medium">{item.brand}</span>
                  </div>
                )}
                {item.color && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-medium">{item.color}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Swap Value:</span>
                  <span className="font-bold text-green-600">{item.point_value} points</span>
                </div>
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Owner</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {item.owner?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{item.owner?.username || 'Anonymous'}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>Location not specified</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full" 
                onClick={handleRequestSwap}
                disabled={actionLoading.swap}
              >
                <Zap className="w-5 h-5 mr-2" />
                Request Swap
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Message Owner
              </Button>
            </div>

            {/* Safety Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Safety Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Meet in public places for item exchanges</li>
                <li>• Verify item condition before swapping</li>
                <li>• Use ReWear's secure messaging system</li>
                <li>• Report any suspicious activity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
