import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'

// React.memo optimiza el componente para que solo se re-renderice si sus props cambian.
export const EditableField = React.memo(({
  label,
  field,
  value,
  displayValue = null,
  editing,
  type = 'text',
  options = null,
  suffix = '',
  editedData,
  onInputChange,
  isList = false,
  displayObjects = null
}) => {
  const [newItem, setNewItem] = useState('')

  const parseList = (v) => {
    if (Array.isArray(v)) return v
    if (!v) return []
    try {
      const parsed = JSON.parse(v)
      if (Array.isArray(parsed)) return parsed
    } catch { }
    return String(v)
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
  }

  const displayList = isList ? parseList(value) : []
  const finalDisplayValue = displayValue ?? value ?? 'No especificado'

  // --- MODO VISTA ---
  if (!editing) {
    if (isList) {
      const fmtDate = (iso) => {
        try { return new Date(iso).toLocaleDateString() } catch { return iso }
      }
      if (Array.isArray(displayObjects) && displayObjects.length > 0) {
        return (
          <div>
            <label className="text-gray-400">{label}</label>
            <div className="bg-gray-700 rounded-lg p-4 min-h-[120px]">
              <ul className="list-disc list-inside space-y-1 text-white text-sm">
                {displayObjects.map((obj, idx) => (
                  <li key={idx} className="text-white font-semibold">
                    {(obj.nombre || obj.texto || '').toString()}
                    <span className="text-gray-400 text-xs"> — {fmtDate(obj.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      }
      return (
        <div>
          <label className="text-gray-400">{label}</label>
          <div className="bg-gray-700 rounded-lg p-4 min-h-[120px]">
            {displayList.length > 0
              ? (
              <ul className="text-white font-semibold list-disc list-inside space-y-1 text-sm">
                {displayList.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
                )
              : (
              <p className="text-gray-400 italic text-sm">Sin datos registrados</p>
                )}
          </div>
        </div>
      )
    }
    return (
      <div>
        <label className="text-gray-400">{label}</label>
        <p className="text-white font-semibold">
          {finalDisplayValue}
          {suffix}
        </p>
      </div>
    )
  }

  // --- MODO EDICIÓN ---
  if (isList) {
    const currentList = editedData[field] || []

    const handleAddItem = () => {
      if (!newItem.trim()) return
      onInputChange(field, [...currentList, newItem.trim()])
      setNewItem('')
    }

    const handleRemoveItem = (indexToRemove) => {
      onInputChange(field, currentList.filter((_, index) => index !== indexToRemove))
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleAddItem()
      }
    }

    return (
        <div>
            <label className="text-gray-400 text-sm mb-2 block">{label}</label>
            <div className="space-y-2">
                {currentList.map((item, idx) => (
                    <div key={`${field}-${idx}`} className="flex items-center gap-2">
                        <input
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                            value={item}
                            onChange={(e) => {
                              const updatedList = [...currentList]
                              updatedList[idx] = e.target.value
                              onInputChange(field, updatedList)
                            }}
                            placeholder={`${label} ${idx + 1}`}
                        />
                        <button type="button" onClick={() => handleRemoveItem(idx)} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Eliminar">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <div className="flex gap-2">
                    <input
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                        placeholder={`Añadir ${label.toLowerCase()}...`}
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button type="button" onClick={handleAddItem} className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors" title="Añadir">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
  }

  if (options) {
    return (
      <div>
        <label className="text-gray-400 text-sm">{label}</label>
        <select
          value={editedData[field] ?? value ?? ''}
          onChange={(e) => onInputChange(field, e.target.value)}
          className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
        >
          <option value="">Seleccionar...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    )
  }

  if (type === 'textarea') {
    return (
      <div>
        <label className="text-gray-400 text-sm">{label}</label>
        <textarea
          rows={3}
          value={editedData[field] ?? value ?? ''}
          onChange={(e) => onInputChange(field, e.target.value)}
          className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
          placeholder={`Ingresa ${label.toLowerCase()}`}
        />
      </div>
    )
  }

  return (
    <div>
      <label className="text-gray-400 text-sm">{label}</label>
      <input
        type={type}
        value={editedData[field] ?? value ?? ''}
        onChange={(e) => onInputChange(field, e.target.value)}
        className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
        placeholder={`Ingresa ${label.toLowerCase()}`}
        autoComplete="off"
      />
    </div>
  )
})
