import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Avatar from './Avatar'
import { LogOut, ChevronDown } from 'lucide-react'

const UserProfile = () => {
  const { logout, getCurrentUserInfo } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const userInfo = getCurrentUserInfo()

  if (!userInfo) return null

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="relative">
        {/* Avatar y nombre clickeable */}
        <div
          className="flex items-center space-x-2 bg-black/80 backdrop-blur-sm rounded-full px-3 py-2 border border-yellow-400/20 cursor-pointer hover:border-yellow-400/40 transition-colors"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <Avatar
            avatar={userInfo.avatar}
            iniciales={userInfo.iniciales}
            nombre={userInfo.nombre}
            size="sm"
          />
          <div className="text-right">
            <p className="text-white text-sm font-medium">{userInfo.nombre}</p>
            <p className="text-gray-400 text-xs capitalize">{userInfo.nivel}</p>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              showDropdown ? 'rotate-180' : ''
            }`}
          />
        </div>

        {/* Dropdown menu */}
        {showDropdown && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-yellow-400/20 rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <Avatar
                  avatar={userInfo.avatar}
                  iniciales={userInfo.iniciales}
                  nombre={userInfo.nombre}
                  size="md"
                />
                <div>
                  <p className="text-white font-medium">{userInfo.nombre} {userInfo.apellido}</p>
                  <p className="text-gray-400 text-sm">{userInfo.email}</p>
                  <p className="text-yellow-400 text-xs capitalize font-medium">{userInfo.nivel}</p>
                </div>
              </div>
            </div>

            <div className="py-2">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 hover:text-red-400 transition-colors flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Overlay para cerrar dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}

export default UserProfile
