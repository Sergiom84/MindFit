import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Loader2, Brain, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';

const InitialProfileForm = () => {
  // Estado del formulario
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [data, setData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    edad: '',
    sexo: '',
    peso: '',
    altura: '',
    nivel: '',
    nivel_actividad: '',
    experiencia: '',
    años_entrenando: '',
    metodologia_preferida: '',
    frecuencia_semanal: '',
    grasa_corporal: '',
    masa_muscular: '',
    agua_corporal: '',
    metabolismo_basal: '',
    cintura: '',
    pecho: '',
    brazos: '',
    muslos: '',
    cuello: '',
    antebrazos: '',
    historial_medico: '',
    limitaciones: '',
    alergias: '',
    medicamentos: '',
    objetivo_principal: '',
    meta_peso: '',
    meta_grasa: '',
    enfoque: '',
    horario_preferido: '',
    comidas_diarias: '',
    suplementacion: '',
    alimentos_excluidos: ''
  });

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setData({ ...data, [name]: value });
  };

  const next = () => setStep(step + 1);
  const prev = () => setStep(step - 1);

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Error en el registro: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setSubmitSuccess(true);
        // Aquí podrías redirigir al usuario o mostrar un mensaje de éxito
      } else {
        setSubmitError(result.error || 'Error al registrar usuario');
      }
    } catch (error) {
      setSubmitError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-gray-900 border-green-400/20">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <CardTitle className="text-green-400">¡Registro Exitoso!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-4">
              Tu perfil ha sido creado exitosamente. Ya puedes iniciar sesión.
            </p>
            <Button
              onClick={() => window.location.href = '/login'}
              className="bg-yellow-400 text-black hover:bg-yellow-300"
            >
              Ir al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-16 h-16 text-yellow-400 mr-4" />
            <h1 className="text-6xl font-extrabold text-yellow-400">MindFit IA</h1>
          </div>

          {/* Contenedor principal con pestañas (estilo uniforme) */}
          <div className="max-w-2xl mx-auto bg-gray-900/40 border border-yellow-400/20 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => (window.location.href = '/login')}
                type="button"
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-yellow-400/20 text-gray-300 hover:text-yellow-300"
              >
                <LogIn className="w-4 h-4" /> Iniciar Sesión
              </button>
              <button
                type="button"
                disabled
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-yellow-400/20 bg-yellow-400 text-black"
              >
                <UserPlus className="w-4 h-4" /> Registrarse
              </button>
            </div>
            <p className="text-xl text-gray-300">Tu entrenador personal con inteligencia artificial</p>
          </div>
        </div> {/* ← Este cierre faltaba */}

        <form onSubmit={submit} className="bg-gray-900 border border-yellow-400/20 rounded-lg p-6">
          <Tabs value={`${step}`} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6 bg-gray-800">
              <TabsTrigger value="1" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
                Básicos
              </TabsTrigger>
              <TabsTrigger value="2" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
                Composición
              </TabsTrigger>
              <TabsTrigger value="3" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
                Salud
              </TabsTrigger>
              <TabsTrigger value="4" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
                Objetivos
              </TabsTrigger>
            </TabsList>

            {/* Paso 1: Datos Básicos */}
            <TabsContent value="1" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ... tus campos ... */}
                {/* Puedes dejar igual la definición de campos aquí */}
                {/* Si necesitas ayuda extra con los campos, dímelo */}
                {/* Campo de Nombre */}
                <div>
                  <Label htmlFor="nombre" className="text-gray-300">Nombre *</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={data.nombre}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="apellido" className="text-gray-300">Apellido *</Label>
                  <Input
                    id="apellido"
                    name="apellido"
                    value={data.apellido}
                    onChange={handleChange}
                    placeholder="Tu apellido"
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-300">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={data.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-gray-300">Contraseña *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={data.password}
                    onChange={handleChange}
                    placeholder="Contraseña segura"
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edad" className="text-gray-300">Edad</Label>
                  <Input
                    id="edad"
                    name="edad"
                    type="number"
                    value={data.edad}
                    onChange={handleChange}
                    placeholder="25"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="sexo" className="text-gray-300">Sexo</Label>
                  <Select onValueChange={(value) => handleSelectChange('sexo', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="peso" className="text-gray-300">Peso (kg)</Label>
                  <Input
                    id="peso"
                    name="peso"
                    type="number"
                    step="0.1"
                    value={data.peso}
                    onChange={handleChange}
                    placeholder="70.5"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="altura" className="text-gray-300">Altura (cm)</Label>
                  <Input
                    id="altura"
                    name="altura"
                    type="number"
                    value={data.altura}
                    onChange={handleChange}
                    placeholder="175"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="nivel" className="text-gray-300">Nivel de Entrenamiento</Label>
                  <Select onValueChange={(value) => handleSelectChange('nivel', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Seleccionar nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="principiante">Principiante</SelectItem>
                      <SelectItem value="intermedio">Intermedio</SelectItem>
                      <SelectItem value="avanzado">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nivel_actividad" className="text-gray-300">Nivel de Actividad</Label>
                  <Select onValueChange={(value) => handleSelectChange('nivel_actividad', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentario">Sedentario</SelectItem>
                      <SelectItem value="ligero">Ligero</SelectItem>
                      <SelectItem value="moderado">Moderado</SelectItem>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="muy_activo">Muy Activo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={next}
                  className="bg-yellow-400 text-black hover:bg-yellow-300"
                >
                  Siguiente →
                </Button>
              </div>
            </TabsContent>

            {/* Paso 2: Composición Corporal */}
            <TabsContent value="2" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ...campos de composición corporal... */}
                {/* Aquí puedes dejar igual los campos de grasa, masa muscular, etc. */}
                <div>
                  <Label htmlFor="grasa_corporal" className="text-gray-300">% Grasa Corporal</Label>
                  <Input
                    id="grasa_corporal"
                    name="grasa_corporal"
                    type="number"
                    step="0.1"
                    value={data.grasa_corporal}
                    onChange={handleChange}
                    placeholder="15.5"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="masa_muscular" className="text-gray-300">Masa Muscular (kg)</Label>
                  <Input
                    id="masa_muscular"
                    name="masa_muscular"
                    type="number"
                    step="0.1"
                    value={data.masa_muscular}
                    onChange={handleChange}
                    placeholder="45.2"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="agua_corporal" className="text-gray-300">% Agua Corporal</Label>
                  <Input
                    id="agua_corporal"
                    name="agua_corporal"
                    type="number"
                    step="0.1"
                    value={data.agua_corporal}
                    onChange={handleChange}
                    placeholder="60.0"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="metabolismo_basal" className="text-gray-300">Metabolismo Basal (kcal)</Label>
                  <Input
                    id="metabolismo_basal"
                    name="metabolismo_basal"
                    type="number"
                    value={data.metabolismo_basal}
                    onChange={handleChange}
                    placeholder="1680"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="cintura" className="text-gray-300">Cintura (cm)</Label>
                  <Input
                    id="cintura"
                    name="cintura"
                    type="number"
                    step="0.1"
                    value={data.cintura}
                    onChange={handleChange}
                    placeholder="80.5"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="pecho" className="text-gray-300">Pecho (cm)</Label>
                  <Input
                    id="pecho"
                    name="pecho"
                    type="number"
                    step="0.1"
                    value={data.pecho}
                    onChange={handleChange}
                    placeholder="95.0"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="brazos" className="text-gray-300">Brazos (cm)</Label>
                  <Input
                    id="brazos"
                    name="brazos"
                    type="number"
                    step="0.1"
                    value={data.brazos}
                    onChange={handleChange}
                    placeholder="32.0"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="muslos" className="text-gray-300">Muslos (cm)</Label>
                  <Input
                    id="muslos"
                    name="muslos"
                    type="number"
                    step="0.1"
                    value={data.muslos}
                    onChange={handleChange}
                    placeholder="55.0"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="cuello" className="text-gray-300">Cuello (cm)</Label>
                  <Input
                    id="cuello"
                    name="cuello"
                    type="number"
                    step="0.1"
                    value={data.cuello}
                    onChange={handleChange}
                    placeholder="38.0"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="antebrazos" className="text-gray-300">Antebrazos (cm)</Label>
                  <Input
                    id="antebrazos"
                    name="antebrazos"
                    type="number"
                    step="0.1"
                    value={data.antebrazos}
                    onChange={handleChange}
                    placeholder="28.0"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <Button
                  type="button"
                  onClick={prev}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  ← Anterior
                </Button>
                <Button
                  type="button"
                  onClick={next}
                  className="bg-yellow-400 text-black hover:bg-yellow-300"
                >
                  Siguiente →
                </Button>
              </div>
            </TabsContent>

            {/* Paso 3: Salud */}
            <TabsContent value="3" className="space-y-4">
              <div className="space-y-4">
                {/* ...campos de salud... */}
                <div>
                  <Label htmlFor="historial_medico" className="text-gray-300">Historial Médico</Label>
                  <Textarea
                    id="historial_medico"
                    name="historial_medico"
                    value={data.historial_medico}
                    onChange={handleChange}
                    placeholder="Describe cualquier condición médica relevante..."
                    className="bg-gray-800 border-gray-600 text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="limitaciones" className="text-gray-300">Limitaciones Físicas</Label>
                  <Textarea
                    id="limitaciones"
                    name="limitaciones"
                    value={data.limitaciones}
                    onChange={handleChange}
                    placeholder="Lesiones, dolores, limitaciones de movimiento..."
                    className="bg-gray-800 border-gray-600 text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="alergias" className="text-gray-300">Alergias</Label>
                  <Textarea
                    id="alergias"
                    name="alergias"
                    value={data.alergias}
                    onChange={handleChange}
                    placeholder="Alergias alimentarias o de otro tipo..."
                    className="bg-gray-800 border-gray-600 text-white"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="medicamentos" className="text-gray-300">Medicamentos</Label>
                  <Textarea
                    id="medicamentos"
                    name="medicamentos"
                    value={data.medicamentos}
                    onChange={handleChange}
                    placeholder="Medicamentos que tomas actualmente..."
                    className="bg-gray-800 border-gray-600 text-white"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <Button
                  type="button"
                  onClick={prev}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  ← Anterior
                </Button>
                <Button
                  type="button"
                  onClick={next}
                  className="bg-yellow-400 text-black hover:bg-yellow-300"
                >
                  Siguiente →
                </Button>
              </div>
            </TabsContent>

            {/* Paso 4: Objetivos */}
            <TabsContent value="4" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ...campos de objetivos... */}
                <div>
                  <Label htmlFor="objetivo_principal" className="text-gray-300">Objetivo Principal</Label>
                  <Select onValueChange={(value) => handleSelectChange('objetivo_principal', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Seleccionar objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="perder_peso">Perder Peso</SelectItem>
                      <SelectItem value="ganar_masa">Ganar Masa Muscular</SelectItem>
                      <SelectItem value="tonificar">Tonificar</SelectItem>
                      <SelectItem value="fuerza">Aumentar Fuerza</SelectItem>
                      <SelectItem value="resistencia">Mejorar Resistencia</SelectItem>
                      <SelectItem value="salud">Mejorar Salud General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="meta_peso" className="text-gray-300">Meta de Peso (kg)</Label>
                  <Input
                    id="meta_peso"
                    name="meta_peso"
                    type="number"
                    step="0.1"
                    value={data.meta_peso}
                    onChange={handleChange}
                    placeholder="75.0"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="meta_grasa" className="text-gray-300">Meta de % Grasa</Label>
                  <Input
                    id="meta_grasa"
                    name="meta_grasa"
                    type="number"
                    step="0.1"
                    value={data.meta_grasa}
                    onChange={handleChange}
                    placeholder="12.0"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="enfoque" className="text-gray-300">Enfoque de Entrenamiento</Label>
                  <Select onValueChange={(value) => handleSelectChange('enfoque', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Seleccionar enfoque" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="powerlifting">Powerlifting</SelectItem>
                      <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                      <SelectItem value="funcional">Funcional</SelectItem>
                      <SelectItem value="cardio">Cardiovascular</SelectItem>
                      <SelectItem value="mixto">Mixto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="horario_preferido" className="text-gray-300">Horario Preferido</Label>
                  <Select onValueChange={(value) => handleSelectChange('horario_preferido', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Seleccionar horario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mañana">Mañana (6:00-10:00)</SelectItem>
                      <SelectItem value="mediodia">Mediodía (10:00-14:00)</SelectItem>
                      <SelectItem value="tarde">Tarde (14:00-18:00)</SelectItem>
                      <SelectItem value="noche">Noche (18:00-22:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="comidas_diarias" className="text-gray-300">Comidas por Día</Label>
                  <Input
                    id="comidas_diarias"
                    name="comidas_diarias"
                    type="number"
                    value={data.comidas_diarias}
                    onChange={handleChange}
                    placeholder="4"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="suplementacion" className="text-gray-300">Suplementación</Label>
                  <Textarea
                    id="suplementacion"
                    name="suplementacion"
                    value={data.suplementacion}
                    onChange={handleChange}
                    placeholder="Proteína, creatina, vitaminas..."
                    className="bg-gray-800 border-gray-600 text-white"
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="alimentos_excluidos" className="text-gray-300">Alimentos Excluidos</Label>
                  <Textarea
                    id="alimentos_excluidos"
                    name="alimentos_excluidos"
                    value={data.alimentos_excluidos}
                    onChange={handleChange}
                    placeholder="Alimentos que prefieres evitar..."
                    className="bg-gray-800 border-gray-600 text-white"
                    rows={2}
                  />
                </div>
              </div>

              {/* Error de envío */}
              {submitError && (
                <Alert className="border-red-400 bg-red-400/10">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">
                    <strong>Error:</strong> {submitError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between">
                <Button
                  type="button"
                  onClick={prev}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  ← Anterior
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Perfil'
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </div> {/* ← Este cierre también faltaba */}
    </div>
  );
};

export default InitialProfileForm;

