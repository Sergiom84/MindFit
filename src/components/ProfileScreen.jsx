import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserContext } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button.jsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  calculateIMC,
  getIMCCategory,
  getIMCCategoryColor,
} from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Upload, FileText } from 'lucide-react';

// Importa los componentes de cada pestaña
import { BasicInfoTab } from "./profile/BasicInfoTab";
import { BodyCompositionTab } from "./profile/BodyCompositionTab";
import { HealthTab } from "./profile/HealthTab";
import { GoalsTab } from "./profile/GoalsTab";
import { SettingsTab } from "./profile/SettingsTab";

const API_URL = import.meta?.env?.VITE_API_URL || '';

// --- Funciones de Utilidad (sin cambios) ---
const parseArrayField = (src) => {
    if (!src) return [];
    if (Array.isArray(src)) return src.map((x) => String(x).trim()).filter(Boolean);
    const s = String(src).trim();
    if (!s) return [];
    if (s.startsWith("[")) {
        try {
            const arr = JSON.parse(s);
            return Array.isArray(arr)
                ? arr.map((x) => String(x).trim()).filter(Boolean)
                : [];
        } catch { /* ignore */ }
    }
    return s.split(/[,;\n]+/).map((t) => t.trim()).filter(Boolean);
};

const parseArrayObjects = (src) => {
    try {
        if (typeof src === "string" && src.trim().startsWith("[")) {
            const parsed = JSON.parse(src);
            if (Array.isArray(parsed)) {
                return parsed
                    .map((it) => {
                        if (typeof it === "string") return { nombre: it.trim(), createdAt: new Date().toISOString() };
                        if (it && typeof it === "object") {
                            const nombre = String(it.nombre ?? it.texto ?? "").trim();
                            const createdAt = it.createdAt || new Date().toISOString();
                            return nombre ? { nombre, createdAt } : null;
                        }
                        return null;
                    })
                    .filter(Boolean);
            }
        }
    } catch { /* ignore */ }
    return parseArrayField(src).map((nombre) => ({ nombre, createdAt: new Date().toISOString() }));
};

/* ---------------------- PERFIL DE USUARIO (COMPONENTE PRINCIPAL) ---------------------- */
const ProfileScreen = () => {
    // ---- ESTADO DEL COMPONENTE ----
    const [activeTab, setActiveTab] = useState("basic");
    const [editingSection, setEditingSection] = useState(null);
    const [editedData, setEditedData] = useState({});
    const fileInputRef = useRef(null);
    const { currentUser } = useAuth();
    const { userData, updateUserProfile } = useUserContext();

    // Estados de los modales
    const [docs, setDocs] = useState([]);
    const [docsOpen, setDocsOpen] = useState(false);
    const [isBodyCalcOpen, setIsBodyCalcOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
    
    const userProfile = useMemo(() => ({ ...currentUser, ...userData }), [currentUser, userData]);

    const [bodyCalcForm, setBodyCalcForm] = useState({
        sexo: userProfile?.sexo || "masculino",
        edad: userProfile?.edad || "",
        peso: userProfile?.peso || "",
        altura: userProfile?.altura || "",
        cintura: userProfile?.cintura || "",
        cuello: userProfile?.cuello || "",
        cadera: userProfile?.cadera || "",
    });

    // ---- DATOS Y FUNCIONES DERIVADAS (sin cambios) ----
    const objetivoPrincipalOptions = [
        { value: "rehabilitacion", label: "Rehabilitación" }, { value: "ganar_peso", label: "Ganar Peso" },
        { value: "perder_peso", label: "Perder Peso" }, { value: "tonificar", label: "Tonificar" },
        { value: "ganar_masa_muscular", label: "Ganar Masa Muscular" }, { value: "mejorar_resistencia", label: "Mejorar Resistencia" },
        { value: "mejorar_flexibilidad", label: "Mejorar Flexibilidad" }, { value: "salud_general", label: "Salud General" },
        { value: "mantenimiento", label: "Mantenimiento" }, { value: "competicion", label: "Competición" }
    ];
    const enfoqueOptions = [
        { value: "hipertrofia", label: "Hipertrofia (Masa muscular)" }, { value: "fuerza", label: "Fuerza" },
        { value: "resistencia", label: "Resistencia Cardiovascular" }, { value: "movilidad", label: "Flexibilidad/Movilidad" },
        { value: "potencia", label: "Potencia/Velocidad" }
    ];
    const horarioOptions = [
        { value: "mañana", label: "Mañana (6:00 - 12:00)" }, { value: "tarde", label: "Tarde (12:00 - 18:00)" },
        { value: "noche", label: "Noche (18:00 - 22:00)" }, { value: "flexible", label: "Flexible" }
    ];
    const sexoOptions = [
        { value: "masculino", label: "Masculino" }, { value: "femenino", label: "Femenino" },
        { value: "otro", label: "Otro" }, { value: "prefiero_no_decir", label: "Prefiero no decir" }
    ];
    const metodologiaOptions = [
        { value: "powerlifting", label: "Powerlifting" }, { value: "bodybuilding", label: "Bodybuilding" }, 
        { value: "crossfit", label: "CrossFit" }, { value: "calistenia", label: "Calistenia" }, 
        { value: "entrenamiento_casa", label: "Entrenamiento en Casa" }, { value: "heavy_duty", label: "Heavy Duty" }, 
        { value: "funcional", label: "Entrenamiento Funcional" }
    ];
    const nivelActividadOptions = [
        { value: "sedentario", label: "Sedentario" }, { value: "ligero", label: "Ligero" }, 
        { value: "moderado", label: "Moderado" }, { value: "activo", label: "Activo" }, 
        { value: "muy_activo", label: "Muy Activo" }
    ];

    const getObjetivoLabel = useCallback((value) => objetivoPrincipalOptions.find(opt => opt.value === value)?.label || value || "No especificado", []);
    const getEnfoqueLabel = useCallback((value) => enfoqueOptions.find(opt => opt.value === value)?.label || value || "No especificado", []);
    const getHorarioLabel = useCallback((value) => horarioOptions.find(opt => opt.value === value)?.label || value || "No especificado", []);
    const getSexoLabel = useCallback((value) => sexoOptions.find(opt => opt.value === value)?.label || value || "No especificado", []);
    const getMetodologiaLabel = useCallback((value) => metodologiaOptions.find(opt => opt.value === value)?.label || value || "No especificado", []);
    const getNivelActividadLabel = useCallback((value) => nivelActividadOptions.find(opt => opt.value === value)?.label || value || "No especificado", []);

    const alergiasObjList = useMemo(() => parseArrayObjects(userProfile?.alergias), [userProfile?.alergias]);
    const medicamentosObjList = useMemo(() => parseArrayObjects(userProfile?.medicamentos), [userProfile?.medicamentos]);
    const suplementacionObjList = useMemo(() => parseArrayObjects(userProfile?.suplementacion), [userProfile?.suplementacion]);
    const alimentosObjList = useMemo(() => parseArrayObjects(userProfile?.alimentos_excluidos), [userProfile?.alimentos_excluidos]);
    const alergiasList = useMemo(() => alergiasObjList.map(o => o.nombre), [alergiasObjList]);
    const medicamentosList = useMemo(() => medicamentosObjList.map(o => o.nombre), [medicamentosObjList]);
    const suplementacionList = useMemo(() => suplementacionObjList.map(o => o.nombre), [suplementacionObjList]);
    const alimentosList = useMemo(() => alimentosObjList.map(o => o.nombre), [alimentosObjList]);

    // ---- FUNCIONES DE MANEJO DE EVENTOS ----
    const handleInputChange = useCallback((field, value) => setEditedData(prev => ({ ...prev, [field]: value })), []);
    const startEdit = useCallback((section, sectionFields) => { setEditingSection(section); setEditedData(sectionFields); }, []);
    const handleCancel = useCallback(() => { setEditingSection(null); setEditedData({}); }, []);
    
    // CORRECCIÓN FINAL: La llamada a updateUserProfile ahora solo pasa un argumento.
    const handleSave = useCallback(async () => {
        if (!editingSection || !currentUser?.id) return;
        try {
            await updateUserProfile(editedData); // <-- ÚNICO CAMBIO REALIZADO AQUÍ

            // Eliminada la notificación molesta de éxito
            setEditingSection(null);
            setEditedData({});
        } catch (error) {
            console.error("Error al guardar el perfil:", error);
            setNotification({ open: true, message: `Error al guardar: ${error.message}`, type: 'error' });
        }
    }, [editingSection, editedData, updateUserProfile, currentUser?.id]);
    
    const handlePreviewDoc = (docId) => {
        console.log('handlePreviewDoc called with docId:', docId);
        console.log('API_URL:', API_URL);
        console.log('currentUser.id:', currentUser?.id);
        const fullUrl = `${API_URL}/api/users/${currentUser?.id}/medical-docs/${docId}/view`;
        console.log('Full Preview URL:', fullUrl);
        setPreviewUrl(fullUrl);
        setIsPreviewOpen(true);
        console.log('Preview modal should open now');
    };

    const fetchDocs = useCallback(async () => {
        if (!currentUser?.id) return;
        try {
            const response = await fetch(`${API_URL}/api/users/${currentUser.id}/medical-docs`);
            if (!response.ok) throw new Error('No se pudieron obtener los documentos.');
            
            const data = await response.json();
            setDocs(data.docs || []); 

        } catch (error) {
            console.error("Error al obtener documentos:", error);
            setDocs([]);
        }
    }, [currentUser?.id]);

    const handlePdfUpload = useCallback(async (file) => {
        if (!file || !currentUser?.id) return;

        const formData = new FormData();
        formData.append("file", file);

        setNotification({ open: true, message: 'Subiendo documento...', type: 'loading' });

        try {
            const response = await fetch(`${API_URL}/api/users/${currentUser.id}/medical-docs`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Error del servidor: ${response.status}`);
            }

            await response.json();
            setNotification({ open: true, message: '¡Documento subido con éxito!', type: 'success' });
            await fetchDocs();

        } catch (error) {
            console.error("Error en la subida:", error);
            setNotification({ open: true, message: `Error al subir: ${error.message}`, type: 'error' });
        }
    }, [currentUser?.id, fetchDocs]);

    const computeBodyComposition = useCallback((data) => {
        const { sexo, edad, peso, altura, cintura, cuello, cadera } = data;

        // Convertir a números
        const edadNum = parseFloat(edad);
        const pesoNum = parseFloat(peso);
        const alturaNum = parseFloat(altura);
        const cinturaNum = parseFloat(cintura);
        const cuelloNum = parseFloat(cuello);
        const caderaNum = parseFloat(cadera);

        // Calcular grasa corporal usando fórmula US Navy
        let grasaCorporal = 0;
        if (sexo === 'masculino') {
            grasaCorporal = 495 / (1.0324 - 0.19077 * Math.log10(cinturaNum - cuelloNum) + 0.15456 * Math.log10(alturaNum)) - 450;
        } else {
            grasaCorporal = 495 / (1.29579 - 0.35004 * Math.log10(cinturaNum + caderaNum - cuelloNum) + 0.22100 * Math.log10(alturaNum)) - 450;
        }

        // Calcular metabolismo basal usando fórmula Mifflin-St Jeor
        let metabolismoBasal = 0;
        if (sexo === 'masculino') {
            metabolismoBasal = 10 * pesoNum + 6.25 * alturaNum - 5 * edadNum + 5;
        } else {
            metabolismoBasal = 10 * pesoNum + 6.25 * alturaNum - 5 * edadNum - 161;
        }

        // Calcular masa muscular aproximada
        const masaMuscular = pesoNum * (1 - grasaCorporal / 100) * 0.45; // Aproximación

        // Calcular agua corporal aproximada
        const aguaCorporal = sexo === 'masculino' ? pesoNum * 0.6 : pesoNum * 0.5;

        return {
            grasa_corporal: Math.round(grasaCorporal * 10) / 10,
            masa_muscular: Math.round(masaMuscular * 10) / 10,
            agua_corporal: Math.round((aguaCorporal / pesoNum) * 100 * 10) / 10,
            metabolismo_basal: Math.round(metabolismoBasal)
        };
    }, []);

    const handleComputeBodyComp = useCallback(async () => {
        try {
            const results = computeBodyComposition(bodyCalcForm);
            await updateUserProfile(results);
            setIsBodyCalcOpen(false);
            setNotification({ open: true, message: 'Composición corporal calculada y guardada', type: 'success' });
        } catch (error) {
            console.error('Error calculando composición corporal:', error);
            setNotification({ open: true, message: 'Error al calcular composición corporal', type: 'error' });
        }
    }, [bodyCalcForm, computeBodyComposition, updateUserProfile]);

    const handleDeleteDoc = useCallback(async (docId) => {
        if (!currentUser?.id || !docId) return;
        if (!window.confirm("¿Estás seguro de que quieres eliminar este documento? Esta acción no se puede deshacer.")) return;
        try {
            const response = await fetch(`${API_URL}/api/users/${currentUser.id}/medical-docs/${docId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Error al eliminar el documento');
            await fetchDocs();
            setNotification({ open: true, message: 'Documento eliminado con éxito.', type: 'success' });
        } catch (error) {
            console.error("Error al eliminar documento:", error);
            setNotification({ open: true, message: `No se pudo eliminar: ${error.message}`, type: 'error' });
        }
    }, [currentUser?.id, fetchDocs]);

    const handleAnalyzeDocs = useCallback(async () => {
        setNotification({ open: true, message: 'Análisis con IA en desarrollo.', type: 'info' });
    }, []);
    
    useEffect(() => {
        if (currentUser?.id) {
            fetchDocs();
        }
    }, [currentUser?.id, fetchDocs]);

    const tabProps = {
        userProfile, currentUser, editingSection, editedData, docs,
        startEdit, handleSave, handleCancel, handleInputChange,
        fetchDocs, setDocsOpen, fileInputRef, handlePdfUpload,
        setBodyCalcForm, setIsBodyCalcOpen, handleComputeBodyComp,
        calculateIMC, getIMCCategory, getIMCCategoryColor,
        handleDeleteDoc, handleAnalyzeDocs, handlePreviewDoc,
        objetivoPrincipalOptions, enfoqueOptions, horarioOptions, sexoOptions, metodologiaOptions, nivelActividadOptions,
        getObjetivoLabel, getEnfoqueLabel, getHorarioLabel, getSexoLabel, getMetodologiaLabel, getNivelActividadLabel,
        alergiasList, medicamentosList, suplementacionList, alimentosList,
        alergiasObjList, medicamentosObjList, suplementacionObjList, alimentosObjList,
    };

    if (!currentUser && !userData) {
        return (
            <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
                <p>Cargando perfil...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 pt-20 pb-24">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-yellow-400">Perfil de Usuario</h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full bg-gray-800 mb-6 overflow-x-auto whitespace-nowrap rounded-lg no-scrollbar">
                    <TabsTrigger value="basic">Básicos</TabsTrigger>
                    <TabsTrigger value="body">Composición</TabsTrigger>
                    <TabsTrigger value="health">Salud</TabsTrigger>
                    <TabsTrigger value="goals">Objetivos</TabsTrigger>
                    <TabsTrigger value="settings">Configuración</TabsTrigger>
                </TabsList>

                <TabsContent value="basic"><BasicInfoTab {...tabProps} /></TabsContent>
                <TabsContent value="body"><BodyCompositionTab {...tabProps} /></TabsContent>
                <TabsContent value="health"><HealthTab {...tabProps} /></TabsContent>
                <TabsContent value="goals"><GoalsTab {...tabProps} /></TabsContent>
                <TabsContent value="settings"><SettingsTab {...tabProps} /></TabsContent>
            </Tabs>

            {/* ---- MODALES ---- */}
            <Dialog open={isBodyCalcOpen} onOpenChange={setIsBodyCalcOpen}>
                <DialogContent className="bg-gray-900 text-white border-yellow-400/30 max-w-md">
                    <DialogHeader>
                        <DialogTitle>Calculadora de Composición Corporal</DialogTitle>
                        <DialogDescription>
                            Ingresa tus medidas para calcular automáticamente tu composición corporal
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Sexo</label>
                                <select
                                    value={bodyCalcForm.sexo}
                                    onChange={(e) => setBodyCalcForm(prev => ({ ...prev, sexo: e.target.value }))}
                                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                                >
                                    <option value="masculino">Masculino</option>
                                    <option value="femenino">Femenino</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Edad</label>
                                <input
                                    type="number"
                                    value={bodyCalcForm.edad}
                                    onChange={(e) => setBodyCalcForm(prev => ({ ...prev, edad: e.target.value }))}
                                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                                    placeholder="años"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Peso (kg)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={bodyCalcForm.peso}
                                    onChange={(e) => setBodyCalcForm(prev => ({ ...prev, peso: e.target.value }))}
                                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Altura (cm)</label>
                                <input
                                    type="number"
                                    value={bodyCalcForm.altura}
                                    onChange={(e) => setBodyCalcForm(prev => ({ ...prev, altura: e.target.value }))}
                                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Cintura (cm)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={bodyCalcForm.cintura}
                                    onChange={(e) => setBodyCalcForm(prev => ({ ...prev, cintura: e.target.value }))}
                                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Cuello (cm)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={bodyCalcForm.cuello}
                                    onChange={(e) => setBodyCalcForm(prev => ({ ...prev, cuello: e.target.value }))}
                                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                                />
                            </div>
                        </div>
                        {bodyCalcForm.sexo === 'femenino' && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Cadera (cm)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={bodyCalcForm.cadera}
                                    onChange={(e) => setBodyCalcForm(prev => ({ ...prev, cadera: e.target.value }))}
                                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBodyCalcOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleComputeBodyComp} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                            Calcular
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={docsOpen} onOpenChange={setDocsOpen}>
                <DialogContent className="bg-gray-900 text-white border-yellow-400/30 max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Documentación Médica</DialogTitle>
                        <DialogDescription>Aquí puedes ver, eliminar y analizar tus documentos subidos.</DialogDescription>
                    </DialogHeader>
                    <div className="my-4 max-h-[60vh] overflow-y-auto pr-2">
                        {docs?.length > 0 ? (
                            <div className="space-y-3">
                                {docs.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between bg-gray-800/60 p-3 rounded-lg hover:bg-gray-800">
                                        <div className="flex items-center space-x-3 overflow-hidden">
                                            <FileText className="w-5 h-5 text-red-400 flex-shrink-0" />
                                            <div className="truncate">
                                                <p className="text-white font-medium truncate" title={doc.originalName}>{doc.originalName}</p>
                                                <p className="text-gray-400 text-sm">Subido: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                            <Button variant="ghost" size="sm" onClick={() => handlePreviewDoc(doc.id)}>Ver</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteDoc(doc.id)}>Eliminar</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10"><p className="text-gray-400">No tienes documentos subidos.</p></div>
                        )}
                    </div>
                    <DialogFooter className="justify-between items-center w-full sm:justify-between sm:flex-row flex-col-reverse sm:gap-0 gap-4">
                         <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto">
                            <Upload className="w-4 h-4 mr-2" />
                            Subir nuevo
                        </Button>
                        <Button onClick={handleAnalyzeDocs} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" disabled={!docs || docs.length === 0}>
                            Analizar con IA
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <Dialog open={notification.open} onOpenChange={(open) => setNotification({ ...notification, open })}>
                <DialogContent className="bg-gray-900 text-white">
                    <DialogHeader>
                        <DialogTitle>Notificación</DialogTitle>
                    </DialogHeader>
                    <p className={
                        notification.type === 'success' ? 'text-green-400' :
                        notification.type === 'error' ? 'text-red-400' :
                        notification.type === 'info' ? 'text-blue-400' : 'text-white'
                    }>
                        {notification.message}
                    </p>
                    <DialogFooter>
                        <Button onClick={() => setNotification({ ...notification, open: false })}>Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="bg-gray-900 text-white border-yellow-400/30 max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Previsualización de Documento</DialogTitle>
                        <p className="text-sm text-gray-400">URL: {previewUrl}</p>
                    </DialogHeader>
                    <div className="flex-grow h-full w-full">
                        {previewUrl ? (
                            <iframe
                                src={previewUrl}
                                title="Previsualización de PDF"
                                className="w-full h-full border-0 rounded-md"
                                onLoad={() => console.log('PDF iframe loaded successfully')}
                                onError={() => console.error('PDF iframe failed to load')}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-400">No hay URL de previsualización</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Input file oculto para subir PDFs */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        handlePdfUpload(file);
                        e.target.value = ''; // Reset input
                    }
                }}
            />
        </div>
    );
};

export default ProfileScreen;
