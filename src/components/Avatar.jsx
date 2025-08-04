import React from 'react';

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
  };

  // Colores de fondo basados en las iniciales
  const getBackgroundColor = (iniciales) => {
    if (!iniciales) return 'bg-gray-600';
    
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    
    // Usar la primera letra para determinar el color
    const charCode = iniciales.charAt(0).toUpperCase().charCodeAt(0);
    const colorIndex = charCode % colors.length;
    return colors[colorIndex];
  };

  const sizeClass = sizes[size] || sizes.md;
  const borderClass = showBorder ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-black' : '';
  
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
    );
  }

  // Si no hay avatar, mostrar círculo con iniciales
  const bgColor = getBackgroundColor(iniciales);
  const displayInitials = iniciales || (nombre ? nombre.charAt(0).toUpperCase() : '?');

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
  );
};

export default Avatar;
