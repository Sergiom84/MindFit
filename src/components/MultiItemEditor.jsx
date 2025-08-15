import React, { useMemo, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'

// items: Array<{ nombre: string, createdAt: string } | string>
// onChange: (items: Array<{ nombre: string, createdAt: string }>) => void
export function MultiItemEditor ({ label, items = [], onChange, placeholder = 'Añade un ítem y pulsa Enter' }) {
  // Normaliza a [{ nombre, createdAt }]
  const normalized = useMemo(() => {
    if (!Array.isArray(items)) return []
    return items
      .map((it) => {
        if (typeof it === 'string') return { nombre: it, createdAt: new Date().toISOString() }
        if (it && typeof it === 'object') {
          const nombre = String(it.nombre ?? '').trim()
          const createdAt = it.createdAt || new Date().toISOString()
          return nombre ? { nombre, createdAt } : null
        }
        return null
      })
      .filter(Boolean)
  }, [items])

  const [value, setValue] = useState('')

  const exists = useCallback(
    (nombre) => normalized.some((it) => it.nombre.toLowerCase() === nombre.toLowerCase()),
    [normalized]
  )

  const add = useCallback(() => {
    const nombre = value.trim()
    if (!nombre) return
    if (exists(nombre)) {
      setValue('')
      return
    }
    const next = [...normalized, { nombre, createdAt: new Date().toISOString() }]
    onChange?.(next)
    setValue('')
  }, [value, normalized, onChange, exists])

  const removeAt = useCallback(
    (idx) => {
      const next = normalized.slice()
      next.splice(idx, 1)
      onChange?.(next)
    },
    [normalized, onChange]
  )

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      add()
    }
  }

  const formatDate = (iso) => {
    try {
      const d = new Date(iso)
      return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).format(d)
    } catch {
      return iso
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-gray-400 text-sm">{label}</label>
        <div className="mt-1 flex gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
            placeholder={placeholder}
            autoComplete="off"
          />
          <Button onClick={add} className="bg-yellow-500 hover:bg-yellow-600 text-black" type="button">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Pulsa Enter para añadir rápidamente.</p>
      </div>

      <div>
        <label className="text-gray-400 text-sm">Histórico de {label.toLowerCase()}</label>
        <div className="mt-1 border border-gray-700 rounded-lg overflow-hidden">
          {normalized.length === 0
            ? (
            <div className="p-3 text-gray-400 text-sm">Sin {label.toLowerCase()} registradas</div>
              )
            : (
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="text-left px-3 py-2">Nombre</th>
                  <th className="text-left px-3 py-2">Creado</th>
                  <th className="px-3 py-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {normalized.map((it, idx) => (
                  <tr key={idx} className="border-t border-gray-800">
                    <td className="px-3 py-2 text-white">{it.nombre}</td>
                    <td className="px-3 py-2 text-gray-400">{formatDate(it.createdAt)}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeAt(idx)}
                        className="p-1 text-gray-400 hover:text-red-400"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              )}
        </div>
      </div>
    </div>
  )
}
