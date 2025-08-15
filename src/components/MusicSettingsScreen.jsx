// src/components/MusicSettingsScreen.jsx
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/contexts/AuthContext'
import { useMusic } from '@/contexts/MusicContext.jsx'

import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx'
import { Label } from '@/components/ui/label.jsx'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.jsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx'

import { Music, Link as LinkIcon, Unlink, CheckCircle, AlertCircle, Settings } from 'lucide-react'

const providerLabels = {
  spotify: 'Spotify',
  apple: 'Apple Music',
  youtube: 'YouTube Music',
  device: 'Reproductor del móvil'
}

export default function MusicSettingsScreen () {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const {
    state,
    setPreferredProvider,
    connect,
    disconnect,
    setAdaptiveMode,
    setRule,
    saveToBackend
  } = useMusic()

  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [saveError, setSaveError] = useState('')

  const canBePreferred = useMemo(() => {
    const c = state.connections
    return { spotify: !!c.spotify, apple: !!c.apple, youtube: !!c.youtube, device: true }
  }, [state.connections])

  function handleConnect (provider) {
    connect(provider)
    // (Opcional) sincronicemos con backend
    fetch(`/api/music/connect/${provider}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUser?.id })
    }).catch(() => {})
  }

  function handleDisconnect (provider) {
    if (state.preferredProvider === provider && provider !== 'device') {
      setPreferredProvider('device')
    }
    disconnect(provider)
    // (Opcional) sincronicemos con backend
    fetch(`/api/music/disconnect/${provider}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUser?.id })
    }).catch(() => {})
  }

  async function handleSave () {
    setSaving(true)
    setSaveError('')
    setSavedOk(false)
    const res = await saveToBackend(currentUser?.id)
    setSaving(false)
    if (!res.ok) {
      setSaveError(res.error || 'No se pudieron guardar las preferencias.')
      return
    }
    setSavedOk(true)
    setTimeout(() => setSavedOk(false), 2500)
  }

  const ConnectionRow = ({ provider }) => {
    const connected = !!state.connections[provider]
    const isPreferred = state.preferredProvider === provider
    const label = providerLabels[provider]

    return (
      <div className="flex items-center justify-between p-3 rounded-lg border border-yellow-400/20 bg-gray-900">
        <div className="flex items-center gap-3">
          <Music className="w-5 h-5 text-yellow-400" />
          <div>
            <div className="font-medium text-white">{label}</div>
            <div className="text-xs text-gray-400">
              {connected ? 'Conectado' : 'No conectado'}
              {isPreferred ? ' • Preferido' : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {connected
            ? (
            <Button variant="outline" onClick={() => handleDisconnect(provider)}>
              <Unlink className="w-4 h-4 mr-2" />
              Desvincular
            </Button>
              )
            : (
            <Button onClick={() => handleConnect(provider)}>
              <LinkIcon className="w-4 h-4 mr-2" />
              Vincular
            </Button>
              )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-yellow-400">Configuración Musical</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>Volver</Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Estado & proveedores */}
        <Card className="bg-gray-950 border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white">Proveedores</CardTitle>
            <CardDescription className="text-gray-400">
              Vincula tus servicios y elige el proveedor preferido.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <ConnectionRow provider="spotify" />
              <ConnectionRow provider="apple" />
              <ConnectionRow provider="youtube" />
              <ConnectionRow provider="device" />
            </div>

            <div className="mt-4">
              <Label className="text-yellow-400">Proveedor preferido</Label>
              <RadioGroup
                className="mt-2 grid grid-cols-2 gap-3"
                value={state.preferredProvider}
                onValueChange={setPreferredProvider}
              >
                {Object.keys(providerLabels).map((p) => {
                  const disabled = !canBePreferred[p]
                  return (
                    <div
                      key={p}
                      className={`flex items-center space-x-2 p-3 rounded-lg border ${
                        disabled ? 'border-gray-700 opacity-60 cursor-not-allowed' : 'border-yellow-400/20'
                      }`}
                    >
                      <RadioGroupItem value={p} id={`prov-${p}`} disabled={disabled} />
                      <Label htmlFor={`prov-${p}`} className="text-white">{providerLabels[p]}</Label>
                    </div>
                  )
                })}
              </RadioGroup>
              {!state.connections[state.preferredProvider] && state.preferredProvider !== 'device' && (
                <p className="text-xs text-yellow-300 mt-2">
                  El proveedor preferido no está vinculado. Vincúlalo o selecciona otro.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Adaptación automática */}
        <Card className="bg-gray-950 border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white">Adaptación de música</CardTitle>
            <CardDescription className="text-gray-400">
              Ajusta la música según el tipo de entrenamiento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-yellow-400">Modo</Label>
              <RadioGroup
                className="mt-2 grid grid-cols-2 gap-3"
                value={state.adaptiveMode}
                onValueChange={setAdaptiveMode}
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-yellow-400/20">
                  <RadioGroupItem value="auto" id="mode-auto" />
                  <Label htmlFor="mode-auto" className="text-white">Automático</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-yellow-400/20">
                  <RadioGroupItem value="off" id="mode-off" />
                  <Label htmlFor="mode-off" className="text-white">Desactivado</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {/* Fuerza */}
              <Card className="bg-gray-900 border-yellow-400/20">
                <CardHeader>
                  <CardTitle className="text-white text-base">Fuerza</CardTitle>
                  <CardDescription className="text-gray-400">BPM altos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <RadioGroup value={state.rules.fuerza} onValueChange={(v) => setRule('fuerza', v)}>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="alto" id="fuerza-alto" /><Label htmlFor="fuerza-alto" className="text-white">Alto</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="medio" id="fuerza-medio" /><Label htmlFor="fuerza-medio" className="text-white">Medio</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="suave" id="fuerza-suave" /><Label htmlFor="fuerza-suave" className="text-white">Suave</Label></div>
                  </RadioGroup>
                </CardContent>
              </Card>
              {/* Cardio */}
              <Card className="bg-gray-900 border-yellow-400/20">
                <CardHeader>
                  <CardTitle className="text-white text-base">Cardio</CardTitle>
                  <CardDescription className="text-gray-400">BPM medios</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <RadioGroup value={state.rules.cardio} onValueChange={(v) => setRule('cardio', v)}>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="alto" id="cardio-alto" /><Label htmlFor="cardio-alto" className="text-white">Alto</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="medio" id="cardio-medio" /><Label htmlFor="cardio-medio" className="text-white">Medio</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="suave" id="cardio-suave" /><Label htmlFor="cardio-suave" className="text-white">Suave</Label></div>
                  </RadioGroup>
                </CardContent>
              </Card>
              {/* Movilidad */}
              <Card className="bg-gray-900 border-yellow-400/20">
                <CardHeader>
                  <CardTitle className="text-white text-base">Movilidad</CardTitle>
                  <CardDescription className="text-gray-400">BPM bajos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <RadioGroup value={state.rules.movilidad} onValueChange={(v) => setRule('movilidad', v)}>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="alto" id="mob-alto" /><Label htmlFor="mob-alto" className="text-white">Alto</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="medio" id="mob-medio" /><Label htmlFor="mob-medio" className="text-white">Medio</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="suave" id="mob-suave" /><Label htmlFor="mob-suave" className="text-white">Suave</Label></div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            <Alert className="bg-gray-900 border-yellow-400/20">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <AlertTitle className="text-white">Nota</AlertTitle>
              <AlertDescription className="text-gray-300">
                La vinculación real con Spotify/Apple/YouTube requiere iniciar sesión (OAuth).
                Lo activaremos en próximos pasos y guardaremos tus preferencias en tu perfil.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-yellow-400 text-black hover:bg-yellow-300">
                <CheckCircle className="w-4 h-4 mr-2" />
                {saving ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>

            {savedOk && (
              <Alert className="mt-3 bg-green-900/30 border-green-500/40">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertTitle className="text-white">Guardado</AlertTitle>
                <AlertDescription className="text-gray-200">Preferencias musicales guardadas.</AlertDescription>
              </Alert>
            )}

            {saveError && (
              <Alert className="mt-3 bg-red-900/30 border-red-400/40">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertTitle className="text-white">Error</AlertTitle>
                <AlertDescription className="text-gray-200">{saveError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Avanzado / futuro */}
        <Card className="bg-gray-950 border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-yellow-400" />
              Opciones avanzadas (próximos pasos)
            </CardTitle>
            <CardDescription className="text-gray-400">
              Mapeo por tipo de sesión (calentamiento, pico, enfriamiento), volumen adaptativo, etc.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-gray-300">
            Aquí podremos definir reglas finas como:
            <ul className="list-disc pl-5 mt-2">
              <li>Calentamiento: BPM medio → playlist dinámica.</li>
              <li>Pico de intensidad: BPM alto → lista de empuje.</li>
              <li>Enfriamiento: BPM bajo → lista de relajación.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
