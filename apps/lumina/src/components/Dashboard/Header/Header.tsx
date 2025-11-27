'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState, useRef, useEffect } from 'react'

import { logout } from '@/app/api'
import { useUser } from '@/libs/auth/useUser'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, loading } = useUser()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleLogout = useCallback(async () => {
    await logout()
    router.push('/users/sign-in')
    router.refresh()
  }, [router])

  const displayName =
    user != null
      ? [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User'
      : 'User'
  const userInitial =
    user?.firstName && user?.lastName
      ? `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase()
      : (user?.email?.[0]?.toUpperCase() ?? 'U')

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 lg:hidden"
        aria-label="Open menu"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div className="flex-1 lg:flex-none"></div>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-100"
          aria-label="User menu"
          aria-expanded={isDropdownOpen}
        >
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={displayName}
              className="h-8 w-8 rounded-full"
            />
          ) : loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          ) : (
            <div className="bg-primary-500 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white">
              {userInitial}
            </div>
          )}
        </button>

        {isDropdownOpen && !loading && user && (
          <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="py-1">
              <div className="border-b border-gray-200 px-4 py-2 text-sm text-gray-700">
                <div className="font-medium">{displayName}</div>
                {user.email && (
                  <div className="truncate text-xs text-gray-500">
                    {user.email}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
