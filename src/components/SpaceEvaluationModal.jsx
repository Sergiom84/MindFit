import React, { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Camera,
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Home,
  Dumbbell,
  Target
} from 'lucide-react'

const SpaceEvaluationModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('imagen')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  // Estado para el formulario de texto
  const [formData, setFormData] = useState({
    espacio: '',
    dimensiones: '',
    equipamiento: '',
    suelo: '',
    obstaculos: '',
    ruido: '',
    horarios: '',
    objetivos: ''
  })

  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handleCameraCapture = () => {
    cameraInputRef.current?.click()
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const evaluateSpaceWithImage = async () => {
    if (!selectedImage) {
      setError('Por favor selecciona una imagen primero')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('imagen', selectedImage)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/evaluar-espacio-imagen`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          type: 'imagen',
          content: data.analisis_espacio
        })
      } else {
        setError(data.error || 'Error al procesar la imagen')
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const evaluateSpaceWithText = async () => {
    // Validar que al menos algunos campos estén llenos
    const filledFields = Object.values(formData).filter(value => value.trim() !== '')
    if (filledFields.length < 3) {
      setError('Por favor completa al menos 3 campos para obtener una evaluación precisa')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/evaluar-espacio-texto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          respuestas: formData
        })
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          type: 'texto',
          content: data.sugerencias_entrenamiento
        })
      } else {
        setError(data.error || 'Error al procesar las respuestas')
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const resetModal = () => {
    setActiveTab('imagen')
    setResult(null)
    setError(null)
    setSelectedImage(null)
    setImagePreview(null)
    setFormData({
      espacio: '',
      dimensiones: '',
      equipamiento: '',
      suelo: '',
      obstaculos: '',
      ruido: '',
      horarios: '',
      objetivos: ''
    })
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-[calc(100vw-1rem)] sm:max-w-2xl md:max-w-4xl max-h-[calc(100vh-1rem)] overflow-y-auto bg-gray-900 border-yellow-400/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center">
            <Home className="w-6 h-6 mr-2 text-yellow-400" />
            Evaluación de Espacio de Entrenamiento
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="imagen" className="flex items-center space-x-2">
                <Camera className="w-4 h-4" />
                <span>Con Imagen</span>
              </TabsTrigger>
              <TabsTrigger value="texto" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Con Preguntas</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="imagen" className="space-y-4">
              <Card className="bg-gray-800 border-yellow-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-yellow-400" />
                    Evaluación con Imagen (IA Vision)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300">
                    Sube una foto de tu espacio de entrenamiento y nuestra IA analizará las dimensiones,
                    obstáculos y te recomendará los mejores ejercicios para tu espacio.
                  </p>

                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-h-64 object-cover rounded-lg"
                      />
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        Imagen seleccionada
                      </Badge>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <Button
                      onClick={handleCameraCapture}
                      variant="outline"
                      className="flex-1 border-yellow-400 text-yellow-400"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Tomar Foto
                    </Button>
                    <Button
                      onClick={handleFileUpload}
                      variant="outline"
                      className="flex-1 border-yellow-400 text-yellow-400"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Subir Imagen
                    </Button>
                  </div>

                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  <Button
                    onClick={evaluateSpaceWithImage}
                    disabled={!selectedImage || isLoading}
                    className="w-full bg-yellow-400 text-black hover:bg-yellow-300"
                  >
                    {isLoading
                      ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analizando imagen...
                      </>
                        )
                      : (
                      <>
                        <Target className="w-4 h-4 mr-2" />
                        Analizar Espacio
                      </>
                        )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="texto" className="space-y-4">
              <Card className="bg-gray-800 border-yellow-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-yellow-400" />
                    Evaluación con Preguntas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300">
                    Responde algunas preguntas sobre tu espacio y recibirás recomendaciones
                    personalizadas para tu entrenamiento en casa.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="espacio" className="text-white">Tipo de espacio</Label>
                      <Input
                        id="espacio"
                        placeholder="ej: Sala de estar, garaje, habitación..."
                        value={formData.espacio}
                        onChange={(e) => handleFormChange('espacio', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dimensiones" className="text-white">Dimensiones aproximadas</Label>
                      <Input
                        id="dimensiones"
                        placeholder="ej: 3x4 metros, 2x2 metros..."
                        value={formData.dimensiones}
                        onChange={(e) => handleFormChange('dimensiones', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="equipamiento" className="text-white">Equipamiento disponible</Label>
                      <Input
                        id="equipamiento"
                        placeholder="ej: Mancuernas, bandas, esterilla..."
                        value={formData.equipamiento}
                        onChange={(e) => handleFormChange('equipamiento', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="suelo" className="text-white">Tipo de suelo</Label>
                      <Input
                        id="suelo"
                        placeholder="ej: Parquet, baldosa, alfombra..."
                        value={formData.suelo}
                        onChange={(e) => handleFormChange('suelo', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="obstaculos" className="text-white">Obstáculos o limitaciones</Label>
                    <Textarea
                      id="obstaculos"
                      placeholder="ej: Mesa en el centro, techo bajo, vecinos abajo..."
                      value={formData.obstaculos}
                      onChange={(e) => handleFormChange('obstaculos', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ruido" className="text-white">Nivel de ruido permitido</Label>
                      <Input
                        id="ruido"
                        placeholder="ej: Bajo, medio, alto..."
                        value={formData.ruido}
                        onChange={(e) => handleFormChange('ruido', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="objetivos" className="text-white">Objetivos de entrenamiento</Label>
                      <Input
                        id="objetivos"
                        placeholder="ej: Perder peso, ganar músculo..."
                        value={formData.objetivos}
                        onChange={(e) => handleFormChange('objetivos', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={evaluateSpaceWithText}
                    disabled={isLoading}
                    className="w-full bg-yellow-400 text-black hover:bg-yellow-300"
                  >
                    {isLoading
                      ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generando recomendaciones...
                      </>
                        )
                      : (
                      <>
                        <Dumbbell className="w-4 h-4 mr-2" />
                        Obtener Recomendaciones
                      </>
                        )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          // Mostrar resultados
          <Card className="bg-gray-800 border-green-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                Análisis Completado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-300">
                  {result.content}
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <Button
                  onClick={resetModal}
                  variant="outline"
                  className="border-yellow-400 text-yellow-400"
                >
                  Nueva Evaluación
                </Button>
                <Button
                  onClick={handleClose}
                  className="bg-yellow-400 text-black hover:bg-yellow-300"
                >
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="flex items-center space-x-2 p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default SpaceEvaluationModal
