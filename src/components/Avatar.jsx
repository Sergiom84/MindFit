import React from 'react'
import {
  Dumbbell,
  Trophy,
  Target,
  Zap,
  Activity,
  Heart,
  UserCircle,
  Flame,
  Medal,
  Crown
} from 'lucide-react'

// Iconos de gimnasio disponibles
const GYM_ICONS = {
  dumbbell: Dumbbell,
  trophy: Trophy,
  target: Target,
  zap: Zap,
  activity: Activity,
  heart: Heart,
  flame: Flame,
  medal: Medal,
  crown: Crown,
  user: UserCircle
}

const Avatar = ({
  avatar,
  iniciales,
  nombre,
  size = 'md',
  className = '',
  showBorder = false
}) => {
  // Tamaños disponibles
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 text-3xl',
    '2xl': 'w-24 h-24 text-4xl'
  }

  // Colores de fondo basados en las iniciales
  const getBackgroundColor = (iniciales) => {
    if (!iniciales) return 'bg-gray-600'

    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ]

    // Usar la primera letra para determinar el color
    const charCode = iniciales.charAt(0).toUpperCase().charCodeAt(0)
    const colorIndex = charCode % colors.length
    return colors[colorIndex]
  }

  const sizeClass = sizes[size] || sizes.md
  const borderClass = showBorder ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-black' : ''

  // Obtener tamaño del icono basado en el tamaño del avatar
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16
      case 'md': return 24
      case 'lg': return 32
      case 'xl': return 40
      case '2xl': return 48
      default: return 24
    }
  }

  // Si hay avatar (URL de imagen), mostrar imagen
  if (avatar && typeof avatar === 'string' && avatar.startsWith('http')) {
    return (
      <div className={`${sizeClass} ${borderClass} ${className} rounded-full overflow-hidden flex-shrink-0`}>
        <img
          src={avatar}
          alt={nombre || 'Avatar'}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  // Si hay un icono de gimnasio, mostrarlo
  if (avatar && GYM_ICONS[avatar]) {
    const IconComponent = GYM_ICONS[avatar]
    return (
      <div
        className={`
          ${sizeClass}
          bg-yellow-400
          ${borderClass}
          ${className}
          rounded-full
          flex
          items-center
          justify-center
          text-black
          flex-shrink-0
          shadow-lg
        `}
      >
        <IconComponent size={getIconSize()} />
      </div>
    )
  }

  // Si no hay avatar, mostrar círculo con iniciales
  const bgColor = getBackgroundColor(iniciales)
  const displayInitials = iniciales || (nombre ? nombre.charAt(0).toUpperCase() : '?')

  return (
    <div
      className={`
        ${sizeClass}
        ${bgColor}
        ${borderClass}
        ${className}
        rounded-full
        flex
        items-center
        justify-center
        text-white
        font-bold
        flex-shrink-0
        shadow-lg
      `}
    >
      {displayInitials}
    </div>
  )
}

// Exportar iconos disponibles para uso en otros componentes
export const getAvailableGymIcons = () => {
  return Object.keys(GYM_ICONS).map(key => ({
    key,
    component: GYM_ICONS[key],
    name: key.charAt(0).toUpperCase() + key.slice(1)
  }))
}

export default Avatar
