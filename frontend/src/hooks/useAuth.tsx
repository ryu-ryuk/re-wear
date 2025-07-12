import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/api'

export function useAuth(redirectTo: string = '/login') {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      
      if (!authenticated) {
        router.push(redirectTo)
        return
      }
      
      setIsAuthed(true)
      setIsLoading(false)
    }

    // Check auth on mount
    checkAuth()
    
    // Check auth when localStorage changes (login/logout events)
    const handleStorageChange = () => {
      checkAuth()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [router, redirectTo])

  return { isLoading, isAuthenticated: isAuthed }
}

export function AuthGuard({ 
  children, 
  redirectTo = '/login',
  fallback = <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div><p>Loading...</p></div></div>
}: {
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
}) {
  const { isLoading, isAuthenticated } = useAuth(redirectTo)

  if (isLoading) {
    return <>{fallback}</>
  }

  if (!isAuthenticated) {
    return null // Router will handle redirect
  }

  return <>{children}</>
}
