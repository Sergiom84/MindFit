import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useUserContext } from '../contexts/UserContext';
import { 
  Heart, 
  Activity, 
  CheckCircle
} from 'lucide-react';

/**
 * @typedef {Object} Injury
 * @property {number} id
 * @property {number} user_id
 * @property {string} titulo
 * @property {string | null=} zona
 * @property {string | null=} tipo
 * @property {('leve'|'moderada'|'grave'|string|null)=} gravedad
 * @property {string | null=} fecha_inicio
 * @property {string | null=} fecha_fin
 * @property {string | null=} causa
 * @property {string | null=} tratamiento
 * @property {('activo'|'en recuperación'|'recuperado'|string)} estado
 * @property {string | null=} notas
 * @property {string=} created_at
 * @property {string=} updated_at
 */

// Estados válidos para lesiones (alineado con API y BD)
const ESTADOS = Object.freeze(['activo','en recuperación','recuperado']);

// Helpers de normalización/visualización
const s = (v = '') => String(v || '').toLowerCase();
const isEstadoValido = (v) => ESTADOS.includes(s(v));
const displayEstado = (v) => (isEstadoValido(v) ? v : '(desconocido)');

const InjuriesScreen = () => {
  const [activeInjuryTab, setActiveInjuryTab] = useState('status');
  const { userData } = useUserContext();
  /** @type {[Injury[], React.Dispatch<React.SetStateAction<Injury[]>>]} */
  const [injuries, setInjuries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ titulo:'', zona:'', tipo:'', gravedad:'leve', fecha_inicio:'', causa:'', tratamiento:'', estado:'activo', notas:'' });
  const [editingInjury, setEditingInjury] = useState(null);
  const [deletingInjury, setDeletingInjury] = useState(null);
  const [preventingId, setPreventingId] = useState(null);
  const [prevention, setPrevention] = useState(null);

  // Evitar duplicar barras si VITE_API_URL viene con '/'
  const apiBase = ''; // usar proxy de Vite en desarrollo

  const fetchInjuries = async () => {
    if (!userData?.id) return;
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`${apiBase}/api/users/${userData.id}/injuries`);
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error || 'Error');
      // Mapeo defensivo al tipo Injury
      const list = Array.isArray(j.injuries) ? j.injuries : [];
      /** @type {Injury[]} */
      const mapped = list.map((it) => ({
        id: it.id,
        user_id: it.user_id,
        titulo: it.titulo,
        zona: it.zona ?? null,
        tipo: it.tipo ?? null,
        gravedad: it.gravedad ?? null,
        fecha_inicio: it.fecha_inicio ?? null,
        fecha_fin: it.fecha_fin ?? null,
        causa: it.causa ?? null,
        tratamiento: it.tratamiento ?? null,
        estado: typeof it.estado === 'string' ? it.estado : '',
        notas: it.notas ?? null,
        created_at: it.created_at,
        updated_at: it.updated_at
      }));
      setInjuries(mapped);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInjuries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id]);

  // Calcular conteos y separar lesiones
  const { counts, activeInjuries, historyInjuries } = useMemo(() => {
    const active = injuries.filter(i => s(i.estado) === 'activo').length;
    const recovering = injuries.filter(i => s(i.estado) === 'en recuperación').length;
    const activeInjuries = injuries.filter(i => s(i.estado) === 'activo' || s(i.estado) === 'en recuperación');
    const historyInjuries = injuries.filter(i => s(i.estado) === 'recuperado');

    return {
      counts: { active, recovering },
      activeInjuries,
      historyInjuries
    };
  }, [injuries]);

  const onSaveInjury = async () => {
    if (!userData?.id || !form.titulo) return;
    setSaving(true);
    try {
      const r = await fetch(`${apiBase}/api/users/${userData.id}/injuries`, {
        method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(form)
      });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error || 'Error al crear lesión');
      setAddOpen(false);
      setForm({ titulo:'', zona:'', tipo:'', gravedad:'leve', fecha_inicio:'', causa:'', tratamiento:'', estado:'activo', notas:'' });
      fetchInjuries();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onEditInjury = (injury) => {
    setEditingInjury(injury);
    setForm({
      titulo: injury.titulo || '',
      zona: injury.zona || '',
      tipo: injury.tipo || '',
      gravedad: injury.gravedad || 'leve',
      fecha_inicio: injury.fecha_inicio || '',
      causa: injury.causa || '',
      tratamiento: injury.tratamiento || '',
      estado: injury.estado || 'activo',
      notas: injury.notas || ''
    });
    setEditOpen(true);
  };

  const onUpdateInjury = async () => {
    if (!editingInjury?.id || !form.titulo) return;
    setSaving(true);
    try {
      const r = await fetch(`${apiBase}/api/injuries/${editingInjury.id}`, {
        method: 'PATCH', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(form)
      });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error || 'Error al actualizar lesión');
      setEditOpen(false);
      setEditingInjury(null);
      setForm({ titulo:'', zona:'', tipo:'', gravedad:'leve', fecha_inicio:'', causa:'', tratamiento:'', estado:'activo', notas:'' });
      fetchInjuries();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onDeleteInjury = async () => {
    if (!deletingInjury?.id) return;
    setSaving(true);
    try {
      const r = await fetch(`${apiBase}/api/injuries/${deletingInjury.id}`, {
        method: 'DELETE'
      });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error || 'Error al eliminar lesión');
      setDeleteOpen(false);
      setDeletingInjury(null);
      fetchInjuries();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onRequestPrevention = async (injuryId) => {
  setPreventingId(injuryId);
  setPrevention(null);
  setActiveInjuryTab('prevention');
    try {
      const r = await fetch(`${apiBase}/api/injuries/${injuryId}/prevention`, { method: 'POST' });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error || 'Error IA prevención');
      setPrevention(j.prevention);
    } catch (e) {
      setError(e.message);
    } finally {
      setPreventingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-yellow-400">Prevención de Lesiones IA - {userData.nombre}</h1>
      </div>
      {error && (
        <Alert className="mb-4 border-red-400 bg-red-400/10">
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>
      )}

      {/* Información general del usuario */}
      <Card className="bg-gray-900 border-yellow-400/20 mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-400">{counts.active}</p>
              <p className="text-gray-400 text-sm">Lesiones Activas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{counts.recovering}</p>
              <p className="text-gray-400 text-sm">En Recuperación</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{injuries.length}</p>
              <p className="text-gray-400 text-sm">Zonas Vulnerables</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400 capitalize">Bajo</p>
              <p className="text-gray-400 text-sm">Riesgo Actual</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeInjuryTab} onValueChange={setActiveInjuryTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="status" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Estado Actual
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Historial
          </TabsTrigger>
          <TabsTrigger value="prevention" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Prevención
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-yellow-400" />
                  Estado de Salud Actual
                </CardTitle>
                <Button size="sm" onClick={() => setAddOpen(true)}>+ Añadir lesión</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${counts.active === 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-white">{counts.active === 0 ? 'Sin lesiones activas' : `${counts.active} lesión(es) activa(s)`}</span>
              </div>

              <Alert className={`${counts.active === 0 ? 'border-green-400 bg-green-400/10' : 'border-yellow-400 bg-yellow-400/10'}`}>
                <AlertDescription className={`${counts.active === 0 ? 'text-green-300' : 'text-yellow-300'}`}>
                  🤖 IA monitorea automáticamente tu feedback y ajusta la rutina preventivamente.
                  {/* Riesgo actual: placeholder */}
                </AlertDescription>
              </Alert>
              
              {/* Información específica del usuario */}
              {false && (
                <div className="mt-4 p-3 bg-blue-400/10 rounded-lg border border-blue-400/20">
                  <h4 className="text-blue-400 font-semibold mb-2">Tu Plan Preventivo:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Calentamiento:</span>
                      <span className="text-white ml-2">—</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Estiramientos:</span>
                      <span className="text-white ml-2">—</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Descanso:</span>
                      <span className="text-white ml-2">—</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Hidratación:</span>
                      <span className="text-white ml-2">—</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Lesiones activas */}
              {activeInjuries.length > 0 ? (
                <div className="mt-4 space-y-3">
                  <h4 className="text-white font-semibold">Lesiones Activas:</h4>
                  {activeInjuries.map((inj) => (
                    <Card key={inj.id} className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="text-white font-medium">{inj.titulo}</h5>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  s(inj.estado) === 'en recuperación' ? 'border-yellow-400 text-yellow-400' :
                                  'border-red-400 text-red-400'
                                }`}
                              >
                                {displayEstado(inj.estado)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                              <div><span className="font-medium">Zona:</span> {inj.zona || '—'}</div>
                              <div><span className="font-medium">Gravedad:</span> {inj.gravedad || '—'}</div>
                              <div><span className="font-medium">Causa:</span> {inj.causa || '—'}</div>
                              <div><span className="font-medium">Tratamiento:</span> {inj.tratamiento || '—'}</div>
                            </div>
                            {inj.notas && (
                              <div className="mt-2 text-sm text-gray-300">
                                <span className="font-medium">Notas:</span> {inj.notas}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <Button size="sm" variant="outline" onClick={() => onEditInjury(inj)}>
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                              onClick={() => {
                                setDeletingInjury(inj);
                                setDeleteOpen(true);
                              }}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="mt-4 p-4 bg-green-400/10 rounded-lg border border-green-400/20 text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-300 font-medium">¡Sin lesiones activas!</p>
                  <p className="text-green-400 text-sm">Mantén las buenas prácticas preventivas.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {historyInjuries.length === 0 ? (
            <Card className="bg-gray-900 border-yellow-400/20">
              <CardContent className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-white text-xl font-semibold mb-2">¡Excelente!</h3>
                <p className="text-gray-400">No tienes historial de lesiones recuperadas.</p>
                <p className="text-gray-400 text-sm mt-2">Las lesiones que marques como "recuperadas" aparecerán aquí.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-semibold">Historial de Lesiones Recuperadas</h3>
                <Badge variant="outline" className="border-green-400 text-green-400">
                  {historyInjuries.length} recuperada{historyInjuries.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              {historyInjuries.map((injury) => (
                <Card key={injury.id} className="bg-gray-900 border-yellow-400/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{injury.titulo}</CardTitle>
                        <CardDescription className="text-gray-400">{injury.zona || '—'} • {injury.gravedad || '—'}</CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className={`$
                          s(injury.estado) === 'recuperado' ? 'border-green-400 text-green-400' :
                          s(injury.estado) === 'en recuperación' ? 'border-yellow-400 text-yellow-400' :
                          'border-red-400 text-red-400'
                        }`}
                      >
                        {displayEstado(injury.estado)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-white font-semibold mb-2">Detalles de la Lesión:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-400">Causa:</span>
                            <span className="text-white ml-2">{injury.causa || '—'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Tratamiento:</span>
                            <span className="text-white ml-2">{injury.tratamiento || '—'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => onRequestPrevention(injury.id)} disabled={preventingId===injury.id}>
                          {preventingId===injury.id ? 'Generando...' : 'Prevención IA'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="prevention" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-yellow-400" />
                Sistema de Prevención Activa
              </CardTitle>
            </CardHeader>
            <CardContent>
              {preventingId ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Generando plan de prevención con IA…</p>
                </div>
              ) : (!prevention) ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Selecciona una lesión en Historial y pulsa "Prevención IA" para generar un plan.</p>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  {prevention.calentamiento && (
                    <div className="p-3 bg-blue-400/10 rounded border border-blue-400/20">
                      <h4 className="text-blue-300 font-semibold mb-1">Calentamiento</h4>
                      <p className="text-blue-200">{prevention.calentamiento}</p>
                    </div>
                  )}
                  {Array.isArray(prevention.movilidad) && prevention.movilidad.length>0 && (
                    <div className="p-3 bg-green-400/10 rounded border border-green-400/20">
                      <h4 className="text-green-300 font-semibold mb-1">Movilidad</h4>
                      <ul className="list-disc pl-5 text-green-200">
                        {prevention.movilidad.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(prevention.fortalecimiento) && prevention.fortalecimiento.length>0 && (
                    <div className="p-3 bg-yellow-400/10 rounded border border-yellow-400/20">
                      <h4 className="text-yellow-300 font-semibold mb-1">Fortalecimiento</h4>
                      <ul className="list-disc pl-5 text-yellow-200">
                        {prevention.fortalecimiento.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(prevention.evitar) && prevention.evitar.length>0 && (
                    <div className="p-3 bg-red-400/10 rounded border border-red-400/20">
                      <h4 className="text-red-300 font-semibold mb-1">Evitar</h4>
                      <ul className="list-disc pl-5 text-red-200">
                        {prevention.evitar.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                  )}
                  {prevention.frecuencia && (
                    <p className="text-gray-300">Frecuencia: {prevention.frecuencia}</p>
                  )}
                  {prevention.duracion_aprox && (
                    <p className="text-gray-300">Duración aproximada: {prevention.duracion_aprox}</p>
                  )}
                  {Array.isArray(prevention.advertencias) && prevention.advertencias.length>0 && (
                    <div className="p-3 bg-orange-400/10 rounded border border-orange-400/20">
                      <h4 className="text-orange-300 font-semibold mb-1">Advertencias</h4>
                      <ul className="list-disc pl-5 text-orange-200">
                        {prevention.advertencias.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para añadir lesión */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-gray-900 border-yellow-400/20 text-white">
          <DialogHeader>
            <DialogTitle>Nueva Lesión</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-sm">Título</label>
              <input className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} />
            </div>
            <div>
              <label className="text-gray-400 text-sm">Zona</label>
              <input className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded" value={form.zona} onChange={e=>setForm(f=>({...f,zona:e.target.value}))} />
            </div>
            <div>
              <label className="text-gray-400 text-sm">Tipo</label>
              <input className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded" value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))} />
            </div>
            <div>
              <label className="text-gray-400 text-sm">Gravedad</label>
              <select className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded" value={form.gravedad} onChange={e=>setForm(f=>({...f,gravedad:e.target.value}))}>
                <option value="leve">Leve</option>
                <option value="moderada">Moderada</option>
                <option value="grave">Grave</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-gray-400 text-sm">Causa</label>
              <input className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded" value={form.causa} onChange={e=>setForm(f=>({...f,causa:e.target.value}))} />
            </div>
            <div className="md:col-span-2">
              <label className="text-gray-400 text-sm">Tratamiento</label>
              <input className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded" value={form.tratamiento} onChange={e=>setForm(f=>({...f,tratamiento:e.target.value}))} />
            </div>
            <div>
              <label className="text-gray-400 text-sm">Estado</label>
              <select className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded" value={form.estado} onChange={e=>setForm(f=>({...f,estado:e.target.value}))}>
                <option value="activo">Activo</option>
                <option value="en recuperación">En recuperación</option>
                <option value="recuperado">Recuperado</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Notas</label>
              <input className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded" value={form.notas} onChange={e=>setForm(f=>({...f,notas:e.target.value}))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={()=>setAddOpen(false)}>Cancelar</Button>
            <Button onClick={onSaveInjury} disabled={saving || !form.titulo}>{saving? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar lesión */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-gray-900 border-yellow-400/20 text-white">
          <DialogHeader>
            <DialogTitle>Editar Lesión</DialogTitle>
            <DialogDescription className="text-gray-400">
              Actualiza la información de tu lesión
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-sm">Título</label>
              <input className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} />
            </div>
            <div>
              <label className="text-gray-400 text-sm">Zona</label>
              <input className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded" value={form.zona} onChange={e=>setForm(f=>({...f,zona:e.target.value}))} />
            </div>
            <div>
              <label className="text-gray-400 text-sm">Tipo</label>
              <input className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded" value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))} />
            </div>
            <div>
              <label className="text-gray-400 text-sm">Gravedad</label>
              <select className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded" value={form.gravedad} onChange={e=>setForm(f=>({...f,gravedad:e.target.value}))}>
                <option value="leve">Leve</option>
                <option value="moderada">Moderada</option>
                <option value="grave">Grave</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-gray-400 text-sm">Causa</label>
              <input className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded" value={form.causa} onChange={e=>setForm(f=>({...f,causa:e.target.value}))} />
            </div>
            <div className="md:col-span-2">
              <label className="text-gray-400 text-sm">Tratamiento</label>
              <input className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded" value={form.tratamiento} onChange={e=>setForm(f=>({...f,tratamiento:e.target.value}))} />
            </div>
            <div>
              <label className="text-gray-400 text-sm">Estado</label>
              <select className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded" value={form.estado} onChange={e=>setForm(f=>({...f,estado:e.target.value}))}>
                <option value="activo">Activo</option>
                <option value="en recuperación">En recuperación</option>
                <option value="recuperado">Recuperado</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Notas</label>
              <input className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded" value={form.notas} onChange={e=>setForm(f=>({...f,notas:e.target.value}))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={()=>{setEditOpen(false); setEditingInjury(null);}}>Cancelar</Button>
            <Button onClick={onUpdateInjury} disabled={saving || !form.titulo}>{saving? 'Actualizando...' : 'Actualizar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para confirmar eliminación */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-gray-900 border-red-400/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">Eliminar Lesión</DialogTitle>
            <DialogDescription className="text-gray-400">
              ¿Estás seguro de que quieres eliminar esta lesión? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {deletingInjury && (
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h4 className="text-white font-medium">{deletingInjury.titulo}</h4>
              <p className="text-gray-400 text-sm">{deletingInjury.zona || '—'} • {displayEstado(deletingInjury.estado)}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={()=>{setDeleteOpen(false); setDeletingInjury(null);}}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={onDeleteInjury}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InjuriesScreen;
