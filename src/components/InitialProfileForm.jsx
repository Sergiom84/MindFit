import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Loader2, Brain, UserPlus, LogIn } from 'lucide-react';

const InitialProfileForm = () => {
  // Estado del formulario
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // El estado 'data' ahora refleja los campos del perfil
  const [data, setData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    edad: '',
    sexo: '',
    peso: '',
    altura: '',
    nivel: '', // Nivel de entrenamiento (principiante, etc.)
    nivel_actividad: '',
    años_entrenando: '',
    metodologia_preferida: '',
    frecuencia_semanal: '',
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

  // Handlers (sin cambios)
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
      } else {
        setSubmitError(result.error || 'Error al registrar usuario');
      }
    } catch (error) {
      setSubmitError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Vista de éxito (sin cambios)
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

  // Formulario principal
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
                <Brain className="w-16 h-16 text-yellow-400 mr-4" />
                <h1 className="text-6xl font-extrabold text-yellow-400">MindFit IA</h1>
            </div>
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
        </div>

        <form onSubmit={submit} className="bg-gray-900 border border-yellow-400/20 rounded-lg p-6">
          <Tabs value={`${step}`} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6 bg-gray-800">
              <TabsTrigger value="1">Básicos</TabsTrigger>
              <TabsTrigger value="2">Composición</TabsTrigger>
              <TabsTrigger value="3">Salud</TabsTrigger>
              <TabsTrigger value="4">Objetivos</TabsTrigger>
            </TabsList>

            {/* ---- PASO 1: DATOS BÁSICOS Y EXPERIENCIA ---- */}
            <TabsContent value="1" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campos de cuenta */}
                <div className="md:col-span-2 text-lg font-semibold text-yellow-400 border-b border-yellow-400/20 pb-2 mb-2">Información de Cuenta</div>
                <div><Label htmlFor="nombre">Nombre *</Label><Input id="nombre" name="nombre" value={data.nombre} onChange={handleChange} required /></div>
                <div><Label htmlFor="apellido">Apellido *</Label><Input id="apellido" name="apellido" value={data.apellido} onChange={handleChange} required /></div>
                <div><Label htmlFor="email">Email *</Label><Input id="email" name="email" type="email" value={data.email} onChange={handleChange} required /></div>
                <div><Label htmlFor="password">Contraseña *</Label><Input id="password" name="password" type="password" value={data.password} onChange={handleChange} required /></div>
                
                {/* Datos personales y físicos */}
                <div className="md:col-span-2 text-lg font-semibold text-yellow-400 border-b border-yellow-400/20 pb-2 mb-2 mt-4">Datos Personales</div>
                <div><Label htmlFor="edad">Edad</Label><Input id="edad" name="edad" type="number" value={data.edad} onChange={handleChange} /></div>
                <div><Label htmlFor="sexo">Sexo</Label><Select onValueChange={(v) => handleSelectChange('sexo', v)}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent><SelectItem value="masculino">Masculino</SelectItem><SelectItem value="femenino">Femenino</SelectItem><SelectItem value="otro">Otro</SelectItem></SelectContent></Select></div>
                <div><Label htmlFor="peso">Peso (kg)</Label><Input id="peso" name="peso" type="number" step="0.1" value={data.peso} onChange={handleChange} /></div>
                <div><Label htmlFor="altura">Altura (cm)</Label><Input id="altura" name="altura" type="number" value={data.altura} onChange={handleChange} /></div>

                {/* --- NUEVO: Campos de experiencia --- */}
                <div className="md:col-span-2 text-lg font-semibold text-yellow-400 border-b border-yellow-400/20 pb-2 mb-2 mt-4">Experiencia en Entrenamiento</div>
                <div><Label>Nivel de Entrenamiento</Label><Select onValueChange={(v) => handleSelectChange('nivel', v)}><SelectTrigger><SelectValue placeholder="Seleccionar nivel" /></SelectTrigger><SelectContent><SelectItem value="principiante">Principiante</SelectItem><SelectItem value="intermedio">Intermedio</SelectItem><SelectItem value="avanzado">Avanzado</SelectItem></SelectContent></Select></div>
                <div><Label>Años Entrenando</Label><Input name="años_entrenando" type="number" value={data.años_entrenando} onChange={handleChange} placeholder="Ej: 3" /></div>
                <div><Label>Frecuencia Semanal (días)</Label><Input name="frecuencia_semanal" type="number" value={data.frecuencia_semanal} onChange={handleChange} placeholder="Ej: 4" /></div>
                <div>
                  <Label>Metodología Preferida</Label>
                  <Select onValueChange={(v) => handleSelectChange('metodologia_preferida', v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar metodología" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="powerlifting">Powerlifting</SelectItem><SelectItem value="bodybuilding">Bodybuilding</SelectItem><SelectItem value="crossfit">CrossFit</SelectItem><SelectItem value="calistenia">Calistenia</SelectItem><SelectItem value="entrenamiento_casa">Entrenamiento en Casa</SelectItem><SelectItem value="heavy_duty">Heavy Duty</SelectItem><SelectItem value="funcional">Entrenamiento Funcional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2"><Label>Nivel de Actividad Diaria</Label><Select onValueChange={(v) => handleSelectChange('nivel_actividad', v)}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent><SelectItem value="sedentario">Sedentario</SelectItem><SelectItem value="ligero">Ligero</SelectItem><SelectItem value="moderado">Moderado</SelectItem><SelectItem value="activo">Activo</SelectItem><SelectItem value="muy_activo">Muy Activo</SelectItem></SelectContent></Select></div>
              </div>
              <div className="flex justify-end mt-6"><Button type="button" onClick={next}>Siguiente →</Button></div>
            </TabsContent>

            {/* ---- PASO 2: COMPOSICIÓN CORPORAL (MEDIDAS) ---- */}
            <TabsContent value="2" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* --- EDITADO: Solo se piden medidas corporales --- */}
                <div className="md:col-span-2 text-lg font-semibold text-yellow-400 border-b border-yellow-400/20 pb-2 mb-2">Medidas Corporales (Opcional)</div>
                <div><Label>Cintura (cm)</Label><Input name="cintura" type="number" step="0.1" value={data.cintura} onChange={handleChange} /></div>
                <div><Label>Pecho (cm)</Label><Input name="pecho" type="number" step="0.1" value={data.pecho} onChange={handleChange} /></div>
                <div><Label>Brazos (cm)</Label><Input name="brazos" type="number" step="0.1" value={data.brazos} onChange={handleChange} /></div>
                <div><Label>Muslos (cm)</Label><Input name="muslos" type="number" step="0.1" value={data.muslos} onChange={handleChange} /></div>
                <div><Label>Cuello (cm)</Label><Input name="cuello" type="number" step="0.1" value={data.cuello} onChange={handleChange} /></div>
                <div><Label>Antebrazos (cm)</Label><Input name="antebrazos" type="number" step="0.1" value={data.antebrazos} onChange={handleChange} /></div>
              </div>
              <div className="flex justify-between mt-6"><Button type="button" onClick={prev} variant="outline">← Anterior</Button><Button type="button" onClick={next}>Siguiente →</Button></div>
            </TabsContent>

            {/* ---- PASO 3: SALUD ---- */}
            <TabsContent value="3" className="space-y-4">
              <div className="space-y-4">
                <div className="text-lg font-semibold text-yellow-400 border-b border-yellow-400/20 pb-2 mb-2">Información de Salud (Opcional)</div>
                <div><Label>Historial Médico</Label><Textarea name="historial_medico" value={data.historial_medico} onChange={handleChange} placeholder="Describe cualquier condición médica relevante..." rows={2}/></div>
                <div><Label>Limitaciones Físicas</Label><Textarea name="limitaciones" value={data.limitaciones} onChange={handleChange} placeholder="Lesiones, dolores, limitaciones de movimiento..." rows={2}/></div>
                <div><Label>Alergias</Label><Textarea name="alergias" value={data.alergias} onChange={handleChange} placeholder="Alergias alimentarias o de otro tipo (separadas por comas)" rows={2}/></div>
                <div><Label>Medicamentos</Label><Textarea name="medicamentos" value={data.medicamentos} onChange={handleChange} placeholder="Medicamentos que tomas actualmente (separados por comas)" rows={2}/></div>
              </div>
              <div className="flex justify-between mt-6"><Button type="button" onClick={prev} variant="outline">← Anterior</Button><Button type="button" onClick={next}>Siguiente →</Button></div>
            </TabsContent>

            {/* ---- PASO 4: OBJETIVOS Y PREFERENCIAS ---- */}
            <TabsContent value="4" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 text-lg font-semibold text-yellow-400 border-b border-yellow-400/20 pb-2 mb-2">Metas y Objetivos</div>
                <div>
                  <Label>Objetivo Principal</Label>
                  {/* --- ACTUALIZADO: Opciones como en ProfileScreen --- */}
                  <Select onValueChange={(v) => handleSelectChange('objetivo_principal', v)}><SelectTrigger><SelectValue placeholder="Seleccionar objetivo" /></SelectTrigger><SelectContent>
                      <SelectItem value="rehabilitacion">Rehabilitación</SelectItem><SelectItem value="ganar_peso">Ganar Peso</SelectItem><SelectItem value="perder_peso">Perder Peso</SelectItem><SelectItem value="tonificar">Tonificar</SelectItem><SelectItem value="ganar_masa_muscular">Ganar Masa Muscular</SelectItem><SelectItem value="mejorar_resistencia">Mejorar Resistencia</SelectItem><SelectItem value="mejorar_flexibilidad">Mejorar Flexibilidad</SelectItem><SelectItem value="salud_general">Salud General</SelectItem><SelectItem value="mantenimiento">Mantenimiento</SelectItem><SelectItem value="competicion">Competición</SelectItem>
                  </SelectContent></Select>
                </div>
                <div><Label>Meta de Peso (kg)</Label><Input name="meta_peso" type="number" step="0.1" value={data.meta_peso} onChange={handleChange} /></div>
                <div><Label>Meta de % Grasa Corporal</Label><Input name="meta_grasa" type="number" step="0.1" value={data.meta_grasa} onChange={handleChange} /></div>
                <div>
                  <Label>Enfoque de Entrenamiento</Label>
                  {/* --- ACTUALIZADO: Opciones como en ProfileScreen --- */}
                  <Select onValueChange={(v) => handleSelectChange('enfoque', v)}><SelectTrigger><SelectValue placeholder="Seleccionar enfoque" /></SelectTrigger><SelectContent>
                      <SelectItem value="hipertrofia">Hipertrofia (Masa muscular)</SelectItem><SelectItem value="fuerza">Fuerza</SelectItem><SelectItem value="resistencia">Resistencia Cardiovascular</SelectItem><SelectItem value="movilidad">Flexibilidad/Movilidad</SelectItem><SelectItem value="potencia">Potencia/Velocidad</SelectItem>
                  </SelectContent></Select>
                </div>

                <div className="md:col-span-2 text-lg font-semibold text-yellow-400 border-b border-yellow-400/20 pb-2 mb-2 mt-4">Preferencias de Nutrición y Horarios</div>
                <div>
                  <Label>Horario Preferido</Label>
                  {/* --- ACTUALIZADO: Opciones como en ProfileScreen --- */}
                  <Select onValueChange={(v) => handleSelectChange('horario_preferido', v)}><SelectTrigger><SelectValue placeholder="Seleccionar horario" /></SelectTrigger><SelectContent>
                      <SelectItem value="mañana">Mañana (6:00 - 12:00)</SelectItem><SelectItem value="tarde">Tarde (12:00 - 18:00)</SelectItem><SelectItem value="noche">Noche (18:00 - 22:00)</SelectItem><SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent></Select>
                </div>
                <div><Label>Comidas por Día</Label><Input name="comidas_diarias" type="number" value={data.comidas_diarias} onChange={handleChange} placeholder="Ej: 4" /></div>
                <div className="md:col-span-2"><Label>Suplementación</Label><Textarea name="suplementacion" value={data.suplementacion} onChange={handleChange} placeholder="Proteína, creatina, vitaminas (separadas por comas)..." rows={2}/></div>
                <div className="md:col-span-2"><Label>Alimentos Excluidos</Label><Textarea name="alimentos_excluidos" value={data.alimentos_excluidos} onChange={handleChange} placeholder="Alimentos que no te gustan o no puedes comer (separados por comas)..." rows={2}/></div>
              </div>

              {submitError && (<Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{submitError}</AlertDescription></Alert>)}

              <div className="flex justify-between mt-6">
                <Button type="button" onClick={prev} variant="outline">← Anterior</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-green-500 hover:bg-green-600 text-white">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : 'Guardar Perfil'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  );
};

export default InitialProfileForm;