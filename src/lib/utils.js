import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn (...inputs) {
  return twMerge(clsx(inputs))
}

// Función para calcular el IMC
export function calculateIMC (peso, altura) {
  if (!peso || !altura || altura <= 0) {
    return null
  }

  // Convertir altura de cm a metros
  const alturaEnMetros = altura / 100

  // Calcular IMC: peso (kg) / altura² (m²)
  const imc = peso / (alturaEnMetros * alturaEnMetros)

  // Redondear a 1 decimal
  return Math.round(imc * 10) / 10
}

// Función para obtener la categoría del IMC
export function getIMCCategory (imc) {
  if (!imc) return 'No calculado'

  if (imc < 18.5) return 'Bajo peso'
  if (imc < 25) return 'Normal'
  if (imc < 30) return 'Sobrepeso'
  return 'Obesidad'
}

// Función para obtener el color de la categoría del IMC
export function getIMCCategoryColor (imc) {
  if (!imc) return 'text-gray-400'

  if (imc < 18.5) return 'text-blue-400'
  if (imc < 25) return 'text-green-400'
  if (imc < 30) return 'text-yellow-400'
  return 'text-red-400'
}
