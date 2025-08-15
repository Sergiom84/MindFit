import { useRef, useState } from 'react'

export default function DebugPanel () {
  const [logs, setLogs] = useState([])
  const logRef = useRef([])

  // Añadir log
  const addLog = (text) => {
    setLogs(l => [...l, `[${new Date().toLocaleTimeString()}] ${text}`])
    logRef.current.push(`[${new Date().toLocaleTimeString()}] ${text}`)
    // También a consola
    console.log(`[DEBUG] ${text}`)
  }

  // Limpiar logs
  const clearLogs = () => {
    setLogs([])
    logRef.current = []
  }

  // Exportar logs
  const exportLogs = () => {
    const blob = new Blob([logRef.current.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mindfit-debug-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Exponer función global para debug rápido (llamar window.debugLog('texto'))
  window.debugLog = addLog

  return (
    <div className="fixed right-0 top-0 z-50 w-80 h-screen bg-black/90 text-white border-l border-yellow-400 flex flex-col">
      <div className="p-3 border-b border-yellow-400 flex gap-2 items-center">
        <span className="text-yellow-400 font-bold">DEBUG PANEL</span>
        <button onClick={() => addLog('Debug button pressed')} className="px-2 py-1 bg-yellow-500 text-black rounded">Debug</button>
        <button onClick={clearLogs} className="px-2 py-1 bg-gray-600 rounded">Clear</button>
        <button onClick={exportLogs} className="px-2 py-1 bg-green-600 rounded">Export</button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 text-xs font-mono">
        {logs.length === 0 && <div className="text-gray-500">No hay logs aún.</div>}
        {logs.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  )
}
