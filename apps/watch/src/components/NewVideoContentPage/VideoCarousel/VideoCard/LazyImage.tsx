import Image from 'next/image'
import { ReactElement, useState, useRef, useEffect } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  fill?: boolean
  style?: React.CSSProperties
  className?: string
  priority?: boolean
  threshold?: number
}

export function LazyImage({
  src,
  alt,
  fill = false,
  style,
  className,
  priority = false,
  threshold = 0.1
}: LazyImageProps): ReactElement {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority) // Load immediately if priority
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority) return // Skip intersection observer for priority images

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin: '50px' // Start loading 50px before entering viewport
      }
    )

    const currentRef = imgRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [priority, threshold])

  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          style={{
            ...style,
            transition: 'opacity 0.3s ease-in-out',
            opacity: isLoaded ? 1 : 0
          }}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)} // Show even if error occurs
          loading={priority ? 'eager' : 'lazy'}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyxxkNzjvqiuXelypBvGOvZbTOaRLKOZccLm2IlwWX5vqs6UZUsgEV6VpYpTVQrfAKrTKMYJ8wjBD21IfvMKR4PnJPPqmDw3lDIW/Zm1sjSMQ9n8lLNbNaM0lMGrEUrLR1K7dFe7hXwmV7zK4+bgrXpRzaZ"
        />
      )}
      {!isLoaded && isInView && (
        <div
          style={{
            position: fill ? 'absolute' : 'relative',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0.5rem'
          }}
        >
          <div
            style={{
              width: '2rem',
              height: '2rem',
              border: '2px solid #333',
              borderTop: '2px solid #fff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
