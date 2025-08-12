import React, { useState, useCallback, useMemo, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useUserContext } from "../contexts/UserContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  User,
  Activity,
  Heart,
  Target,
  Settings,
  Pencil,
  Save,
  Plus,
  Calculator,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";


const toTitleCase = (str) => {
  if (!str) return str;
  return str
    .toString()
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};


// Campo editable reusable - Componente independiente para evitar re-renders
const EditableField = React.memo(({ 
  label,
  field,
  value,
  editing,
  type = "text",
  options = null,
  suffix = "",
  editedData,
  onInputChange,
  isList = false,
  displayObjects = null, // [{nombre|texto, createdAt}]
}) => {
  const parseList = (v) => {
    if (Array.isArray(v)) return v;
    if (!v) return [];
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return String(v)
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const displayList = isList ? parseList(value) : [];
  const displayValue = value ?? "No especificado";

  if (!editing) {
    if (isList) {
      const fmtDate = (iso) => {
        try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
      };
      if (Array.isArray(displayObjects) && displayObjects.length > 0) {
        return (
          <div>
            <label className="text-gray-400">{label}</label>
            <ul className="list-disc list-inside">
              {displayObjects.map((obj, idx) => (
                <li key={idx} className="text-white font-semibold">
                  {(obj.nombre || obj.texto || '').toString()}
                  <span className="text-gray-400 text-xs"> — {fmtDate(obj.createdAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      }
      return (
        <div>
          <label className="text-gray-400">{label}</label>
          {displayList.length > 0 ? (
            <ul className="text-white font-semibold list-disc list-inside">
              {displayList.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-white font-semibold">No especificado</p>
          )}
        </div>
      );
    }
    return (
      <div>
        <label className="text-gray-400">{label}</label>
        <p className="text-white font-semibold">
          {displayValue}
          {suffix}
        </p>
      </div>
    );
  }

  if (options) {
    return (
      <div>
        <label className="text-gray-400 text-sm">{label}</label>
        <select
          value={editedData[field] ?? value ?? ""}
          onChange={(e) => onInputChange(field, e.target.value)}
          className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
        >
          <option value="">Seleccionar...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div>
        <label className="text-gray-400 text-sm">{label}</label>
        <textarea
          rows={3}
          value={editedData[field] ?? value ?? ""}
          onChange={(e) => onInputChange(field, e.target.value)}
          className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
          placeholder={`Ingresa ${label.toLowerCase()}`}
        />
      </div>
    );
  }

  return (
    <div>
      <label className="text-gray-400 text-sm">{label}</label>
      <input
        type={type}
        value={editedData[field] ?? value ?? ""}
        onChange={(e) => onInputChange(field, e.target.value)}
        className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
        placeholder={`Ingresa ${label.toLowerCase()}`}
        autoComplete="off"
      />
    </div>
  );
});

/* ---------------------- PERFIL DE USUARIO ---------------------- */
const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [editingSection, setEditingSection] = useState(null);
  const [editedData, setEditedData] = useState({});
  const { currentUser } = useAuth();
  const { userData, updateUserProfile } = useUserContext();

  // Modals state
  const [isInjuryModalOpen, setIsInjuryModalOpen] = useState(false);
  // Modal documentación
  const [docs, setDocs] = useState([]);
  const [docsOpen, setDocsOpen] = useState(false);
  const fetchDocs = useCallback(async ()=>{
    try {
      const res = await fetch(`/api/users/${currentUser.id}/medical-docs`);
      const data = await res.json();
      if (data.success) setDocs(data.docs||[]);
    } catch {}
  }, [currentUser?.id]);

  const [injuryForm, setInjuryForm] = useState({
    titulo: "",
    zona: "",
    severidad: "leve",
    fecha: "",
    estado: "activo",
    tratamiento: "",
    limitacion_actual: "",
    notas: "",
  });

  const [isBodyCalcOpen, setIsBodyCalcOpen] = useState(false);
  const [bodyCalcForm, setBodyCalcForm] = useState({
    sexo: toTitleCase(currentUser?.sexo || userData?.sexo || "Masculino"),
    edad: currentUser?.edad || userData?.edad || "",
    peso: currentUser?.peso || userData?.peso || "",
    altura: currentUser?.altura || userData?.altura || "",
    cintura: userData?.cintura || "",
    cuello: userData?.cuello || "",
    cadera: userData?.cadera || "", // usado en mujeres (método US Navy)
  });

  // Función para manejar cambios en inputs - Memoizada para evitar re-renders
  const handleInputChange = useCallback((field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Combinar datos del usuario autenticado con datos del contexto
  const userProfile = {
    ...currentUser,
    ...userData,
  };
  ["sexo", "nivel_actividad", "metodologia_preferida"].forEach((field) => {
    if (userProfile[field]) {
      userProfile[field] = toTitleCase(userProfile[field]);
    }
  });

  // Helper: calcular composición corporal (grasa%, masa muscular, agua%, BMR)
  const computeBodyComposition = useCallback((v) => {
    const sexo = (v.sexo || "Masculino").toLowerCase();
    const edad = Number(v.edad) || 0;
    const peso = Number(v.peso) || 0; // kg
    const altura = Number(v.altura) || 0; // cm
    const cintura = Number(v.cintura) || 0; // cm
    const cuello = Number(v.cuello) || 0; // cm
    const cadera = Number(v.cadera) || 0; // cm (solo mujeres)

    // Conversión cm -> pulgadas
    const cmToIn = (cm) => cm / 2.54;

    let bf = null;
    try {
      if (sexo === "femenino") {
        // US Navy formula (en pulgadas)
        const w = cmToIn(cintura);
        const n = cmToIn(cuello);
        const h = cmToIn(altura);
        const hip = cmToIn(cadera);
        if (w > 0 && n > 0 && h > 0 && hip > 0) {
          bf = 163.205 * Math.log10(w + hip - n) - 97.684 * Math.log10(h) - 78.387;
        }
      } else {
        const w = cmToIn(cintura);
        const n = cmToIn(cuello);
        const h = cmToIn(altura);
        if (w > 0 && n > 0 && h > 0) {
          bf = 86.010 * Math.log10(w - n) - 70.041 * Math.log10(h) + 36.76;
        }
      }
    } catch (_) {}

    // Limitar valores razonables
    if (bf != null) bf = Math.min(Math.max(bf, 2), 60);

    // Masa magra y masa muscular (aprox. igual a masa magra)
    const grasa_corporal = bf != null ? Number(bf.toFixed(2)) : null;
    const masa_muscular = bf != null && peso
      ? Number((peso * (1 - grasa_corporal / 100)).toFixed(2))
      : null;

    // BMR (Mifflin-St Jeor)
    let metabolismo_basal = null;
    if (peso && altura && edad) {
      const base = 10 * peso + 6.25 * altura - 5 * edad;
      metabolismo_basal = Math.round(base + (sexo === "masculino" ? 5 : -161));
    }

    // Agua corporal (Watson)
    let agua_porcentaje = null;
    if (peso && altura) {
      let tbwL;
      if (sexo === "masculino") {
        tbwL = 2.447 - 0.09156 * edad + 0.1074 * altura + 0.3362 * peso;
      } else {
        tbwL = -2.097 + 0.1069 * altura + 0.2466 * peso; // versión sin edad
      }
      if (tbwL && peso) {
        agua_porcentaje = Number(((tbwL / peso) * 100).toFixed(2));
      }
    }

    return {
      grasa_corporal: isFinite(grasa_corporal) ? grasa_corporal : null,
      masa_muscular: isFinite(masa_muscular) ? masa_muscular : null,
      agua_corporal: isFinite(agua_porcentaje) ? agua_porcentaje : null,
      metabolismo_basal: isFinite(metabolismo_basal) ? metabolismo_basal : null,
    };
  }, []);

  // Helpers lesiones: obtener array desde userProfile.limitaciones (JSON o texto)
  const injuries = useMemo(() => {
    const src = userProfile?.limitaciones;
    if (!src) return [];
    try {
      const parsed = JSON.parse(src);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return typeof src === "string" && src.trim()
        ? [{ titulo: src.trim(), estado: "desconocido", fecha: "" }]
        : [];
    }
  }, [userProfile?.limitaciones]);

  // Helpers: parsear campos en array (con soporte coma/salto de línea o JSON)
  const parseArrayField = useCallback((src) => {
    if (!src) return [];
    try {
      const parsed = JSON.parse(src);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return String(src)
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }, []);

  const historialMedicoList = useMemo(
    () => parseArrayField(userProfile?.historial_medico),
    [userProfile?.historial_medico, parseArrayField]
  );

  // parsea array de objetos con fecha a objetos normalizados
  const parseArrayObjects = useCallback((src) => {
    const arr = parseArrayField(src);
    // Si ya vienen strings, conviértelos a objetos con fecha actual
    return arr.map((it) => {
      if (typeof it === 'string') return { nombre: it, createdAt: new Date().toISOString() };
      if (it && typeof it === 'object') {
        const nombre = String(it.nombre ?? it.texto ?? '').trim();
        const createdAt = it.createdAt || new Date().toISOString();
        return nombre ? { nombre, createdAt } : null;
      }
      return null;
    }).filter(Boolean);
  }, [parseArrayField]);
  const alergiasList = useMemo(
    () => parseArrayField(userProfile?.alergias),
    [userProfile?.alergias, parseArrayField]
  );
  const medicamentosList = useMemo(
    () => parseArrayField(userProfile?.medicamentos),
    [userProfile?.medicamentos, parseArrayField]
  );

  // Activar edición de una sección
  const startEdit = (section, sectionFields) => {
    setEditingSection(section);
    setEditedData(sectionFields);
  };

  // Guardar cambios de la sección editada
  const handleSave = useCallback(async () => {
    if (!editingSection) return;

    const payload = { ...editedData };

    if (editingSection === 'health') {
      ["historial_medico", "alergias", "medicamentos"].forEach((field) => {
        if (payload[field] !== undefined) {
          const arr = String(payload[field])
            .split(/[\n,]+/)
            .map((s) => s.trim())
            .filter(Boolean);
          payload[field] = JSON.stringify(arr);
        }
      });
    }

    ["sexo", "nivel_actividad", "metodologia_preferida"].forEach((field) => {
      if (payload[field]) {
        payload[field] = toTitleCase(payload[field]);
      }
    });

    const updated = await updateUserProfile(payload);
    if (updated) {
      setEditingSection(null);
      setEditedData({});
    } else {
      alert("Error al guardar los datos.");
    }
  }, [editingSection, editedData, updateUserProfile]);

  // Cancelar edición
  const handleCancel = useCallback(() => {
    console.log('❌ Cancelando edición de:', editingSection);
    setEditingSection(null);
    setEditedData({});
  }, [editingSection]);

  // Guardar nueva lesión en "limitaciones" (JSON en DB)
  const handleAddInjury = useCallback(async () => {
    // Merge con existentes
    const next = [...injuries, { ...injuryForm }];
    const ok = await updateUserProfile({ limitaciones: JSON.stringify(next) });
    if (ok) {
      setIsInjuryModalOpen(false);
      setInjuryForm({
        titulo: "",
        zona: "",
        severidad: "leve",
        fecha: "",
        estado: "activo",
        tratamiento: "",
        limitacion_actual: "",
        notas: "",
      });
    } else {
      alert("No se pudo guardar la lesión");
    }
  }, [injuryForm, injuries, updateUserProfile]);

  // Guardar composición calculada
  const handleComputeBodyComp = useCallback(async () => {
    const calc = computeBodyComposition(bodyCalcForm);
    const ok = await updateUserProfile(calc);
    if (ok) setIsBodyCalcOpen(false);
    else alert("No se pudo guardar la composición corporal");
  }, [bodyCalcForm, computeBodyComposition, updateUserProfile]);

  if (!currentUser && !userData) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20 pb-24">
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-400">Perfil de Usuario</h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-gray-800 mb-6 overflow-x-auto whitespace-nowrap rounded-lg no-scrollbar">
          <TabsTrigger value="basic" className="px-4 shrink-0">Básicos</TabsTrigger>
          <TabsTrigger value="body" className="px-4 shrink-0">Composición</TabsTrigger>
          <TabsTrigger value="health" className="px-4 shrink-0">Salud</TabsTrigger>
          <TabsTrigger value="goals" className="px-4 shrink-0">Objetivos</TabsTrigger>
          <TabsTrigger value="settings" className="px-4 shrink-0">Configuración</TabsTrigger>
        </TabsList>

        {/* DATOS BÁSICOS */}
        <TabsContent value="basic" className="space-y-6">
          {(() => {
            const isEditing = editingSection === "basic";
            return (
              <Card className="bg-gray-900 border-yellow-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="mr-2 text-yellow-400" /> Datos Básicos
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={handleSave}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Guardar
                          </Button>
                          <Button
                            onClick={handleCancel}
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            startEdit("basic", {
                              nombre: userProfile.nombre,
                              apellido: userProfile.apellido,
                              edad: userProfile.edad,
                              peso: userProfile.peso,
                              altura: userProfile.altura,
                              sexo: userProfile.sexo,
                              nivel_actividad: userProfile.nivel_actividad,
                            })
                          }
                          disabled={editingSection && editingSection !== "basic"}
                          className={`p-2 text-gray-400 hover:text-yellow-400 transition-colors`}
                          title="Editar datos básicos"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <EditableField
                      label="Nombre"
                      field="nombre"
                      value={userProfile.nombre}
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      label="Apellido"
                      field="apellido"
                      value={userProfile.apellido}
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <div>
                      <label className="text-gray-400">Email</label>
                      <p className="text-white font-semibold break-all">
                        {userProfile.email || currentUser?.email}
                      </p>
                      {isEditing && (
                        <p className="text-xs text-gray-500 mt-1">
                          El email no se puede modificar
                        </p>
                      )}
                    </div>
                    <EditableField
                      label="Edad"
                      field="edad"
                      value={userProfile.edad}
                      type="number"
                      suffix=" años"
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      label="Peso Actual"
                      field="peso"
                      value={userProfile.peso}
                      type="number"
                      suffix=" kg"
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      label="Estatura"
                      field="altura"
                      value={userProfile.altura}
                      type="number"
                      suffix=" cm"
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      label="Sexo"
                      field="sexo"
                      value={userProfile.sexo}
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                      options={[
                        { value: "Masculino", label: "Masculino" },
                        { value: "Femenino", label: "Femenino" },
                        { value: "Otro", label: "Otro" },
                      ]}
                    />
                    <div>
                      <label className="text-gray-400">IMC</label>
                      <p className="text-white font-semibold">
                        {(() => {
                          const imc = calculateIMC(
                            userProfile.peso,
                            userProfile.altura
                          );
                          const category = getIMCCategory(imc);
                          const colorClass = getIMCCategoryColor(imc);
                          return imc ? (
                            <>
                              {imc}
                              <span className={`${colorClass} text-sm ml-1`}>
                                ({category})
                              </span>
                            </>
                          ) : (
                            "No calculado"
                          );
                        })()}
                      </p>
                    </div>
                    <EditableField
                      label="Nivel de Actividad"
                      field="nivel_actividad"
                      value={userProfile.nivel_actividad}
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                      options={[
                        { value: "Sedentario", label: "Sedentario" },
                        { value: "Ligero", label: "Ligero" },
                        { value: "Moderado", label: "Moderado" },
                        { value: "Activo", label: "Activo" },
                        { value: "Muy Activo", label: "Muy Activo" },
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Experiencia en entrenamiento */}
          {(() => {
            const isEditing = editingSection === "experience";
            return (
              <Card className="bg-gray-900 border-yellow-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>Experiencia en Entrenamiento</span>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={handleSave}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Guardar
                          </Button>
                          <Button
                            onClick={handleCancel}
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            startEdit("experience", {
                              nivel: userProfile.nivel,
                              años_entrenando: userProfile.años_entrenando,
                              metodologia_preferida: userProfile.metodologia_preferida,
                              frecuencia_semanal: userProfile.frecuencia_semanal,
                            })
                          }
                          disabled={
                            editingSection && editingSection !== "experience"
                          }
                          className={`p-2 text-gray-400 hover:text-yellow-400 transition-colors`}
                          title="Editar experiencia en entrenamiento"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {isEditing ? (
                      <EditableField
                        label="Nivel Actual"
                        field="nivel"
                        value={userProfile.nivel}
                        editing={isEditing}
                        editedData={editedData}
                        onInputChange={handleInputChange}
                        options={[
                          { value: "principiante", label: "Principiante" },
                          { value: "intermedio", label: "Intermedio" },
                          { value: "avanzado", label: "Avanzado" },
                        ]}
                      />
                    ) : (
                      <div>
                        <label className="text-gray-400">Nivel Actual</label>
                        <Badge
                          className={`${
                            userProfile.nivel === "principiante"
                              ? "bg-green-400 text-black"
                              : userProfile.nivel === "intermedio"
                              ? "bg-yellow-400 text-black"
                              : "bg-red-400 text-black"
                          }`}
                        >
                          {userProfile.nivel || "No especificado"}
                        </Badge>
                      </div>
                    )}
                    <EditableField
                      label="Años Entrenando"
                      field="años_entrenando"
                      value={userProfile.años_entrenando}
                      type="number"
                      suffix=" años"
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      label="Metodología Preferida"
                      field="metodologia_preferida"
                      value={userProfile.metodologia_preferida}
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                      options={[
                        { value: "Powerlifting", label: "Powerlifting" },
                        { value: "Bodybuilding", label: "Bodybuilding" },
                        { value: "CrossFit", label: "CrossFit" },
                        { value: "Calistenia", label: "Calistenia" },
                        { value: "Entrenamiento en Casa", label: "Entrenamiento en Casa" },
                        { value: "Heavy Duty", label: "Heavy Duty" },
                        { value: "Entrenamiento Funcional", label: "Entrenamiento Funcional" },
                      ]}
                    />
                    <EditableField
                      label="Frecuencia Semanal"
                      field="frecuencia_semanal"
                      value={userProfile.frecuencia_semanal}
                      type="number"
                      suffix=" días"
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </TabsContent>

        {/* COMPOSICIÓN CORPORAL */}
        <TabsContent value="body" className="space-y-6">
          {(() => {
            const isEditing = editingSection === "bodyComp";
            return (
              <Card className="bg-gray-900 border-yellow-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="mr-2 text-yellow-400" /> Composición
                      Corporal Detallada
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={handleSave}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Guardar
                          </Button>
                          <Button
                            onClick={handleCancel}
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            startEdit("bodyComp", {
                              grasa_corporal: userProfile.grasa_corporal,
                              masa_muscular: userProfile.masa_muscular,
                              agua_corporal: userProfile.agua_corporal,
                              metabolismo_basal: userProfile.metabolismo_basal,
                            })
                          }
                          disabled={editingSection && editingSection !== "bodyComp"}
                          className={`p-2 text-gray-400 hover:text-yellow-400 transition-colors`}
                          title="Editar composición corporal"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {/* Botón calcular */}
                      {!isEditing && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          onClick={() => {
                            setBodyCalcForm({
                              sexo: userProfile.sexo || "Masculino",
                              edad: userProfile.edad || "",
                              peso: userProfile.peso || "",
                              altura: userProfile.altura || "",
                              cintura: userProfile.cintura || "",
                              cuello: userProfile.cuello || "",
                              cadera: userProfile.cadera || "",
                            });
                            setIsBodyCalcOpen(true);
                          }}
                          title="Calcular automáticamente"
                        >
                          <Calculator className="w-4 h-4 mr-1" /> Calcular
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <EditableField
                      label="Grasa Corporal"
                      field="grasa_corporal"
                      value={userProfile.grasa_corporal}
                      type="number"
                      suffix="%"
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      label="Masa Muscular"
                      field="masa_muscular"
                      value={userProfile.masa_muscular}
                      type="number"
                      suffix=" kg"
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      label="Agua Corporal"
                      field="agua_corporal"
                      value={userProfile.agua_corporal}
                      type="number"
                      suffix="%"
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      label="Metabolismo Basal"
                      field="metabolismo_basal"
                      value={userProfile.metabolismo_basal}
                      type="number"
                      suffix=" kcal"
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {(() => {
            const isEditing = editingSection === "bodyMeasures";
            return (
              <Card className="bg-gray-900 border-yellow-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>Medidas Corporales</span>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={handleSave}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Guardar
                          </Button>
                          <Button
                            onClick={handleCancel}
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            startEdit("bodyMeasures", {
                              cintura: userProfile.cintura,
                              pecho: userProfile.pecho,
                              brazos: userProfile.brazos,
                              muslos: userProfile.muslos,
                              cuello: userProfile.cuello,
                              antebrazos: userProfile.antebrazos,
                            })
                          }
                          disabled={
                            editingSection && editingSection !== "bodyMeasures"
                          }
                          className={`p-2 text-gray-400 hover:text-yellow-400 transition-colors`}
                          title="Editar medidas corporales"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <EditableField
                      label="Cintura"
                      field="cintura"
                      value={userProfile.cintura}
                      type="number"
                      suffix=" cm"
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      label="Pecho"
                      field="pecho"
                      value={userProfile.pecho}
                      type="number"
                      suffix=" cm"
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      label="Brazos"
                      field="brazos"
                      value={userProfile.brazos}
                      type="number"
                      suffix=" cm"
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      label="Muslos"
                      field="muslos"
                      value={userProfile.muslos}
                      type="number"
                      suffix=" cm"
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      label="Cuello"
                      field="cuello"
                      value={userProfile.cuello}
                      type="number"
                      suffix=" cm"
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      label="Antebrazos"
                      field="antebrazos"
                      value={userProfile.antebrazos}
                      type="number"
                      suffix=" cm"
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </TabsContent>

        {/* SALUD */}
        <TabsContent value="health" className="space-y-6">
          {(() => {
            const isEditing = editingSection === "health";
            return (
              <Card className="bg-gray-900 border-yellow-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="mr-2 text-yellow-400" /> Historial Médico
                      y Salud
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={handleSave}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Guardar
                          </Button>
                          <Button
                            onClick={handleCancel}
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            Cancelar
                          </Button>
                          {/* ÚNICO icono para subir PDF */}
                          <button
                            onClick={() => document.getElementById('medicalDocInput')?.click()}
                            className="p-2 text-gray-400 hover:text-yellow-400"
                            title="Subir PDF"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                          <input id="medicalDocInput" type="file" accept="application/pdf" className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const form = new FormData();
                                form.append('file', file);
                                const res = await fetch(`/api/users/${currentUser.id}/medical-docs`, { method: 'POST', body: form });
                                const data = await res.json();
                                if (!data.success) throw new Error(data.error || 'Error subiendo PDF');
                                alert('PDF subido correctamente');
                              } catch (err) {
                                alert('No se pudo subir el PDF: ' + err.message);
                              } finally {
                                e.target.value = '';
                              }
                            }} />
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            startEdit("health", {
                              historial_medico: historialMedicoList.join("\n"),
                              alergias: alergiasList.join("\n"),
                              medicamentos: medicamentosList.join("\n"),
                            })
                          }
                          disabled={editingSection && editingSection !== "health"}
                          className={`p-2 text-gray-400 hover:text-yellow-400 transition-colors`}
                          title="Editar historial médico"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="relative">
                      <EditableField
                        label="Historial Médico"
                        field="historial_medico"
                        value={editedData.historial_medico ?? historialMedicoList.join("\n")}
                        editing={isEditing}
                        editedData={editedData}
                        onInputChange={handleInputChange}
                        type="textarea"
                        isList
                      />
                      {isEditing && (
                        <div className="absolute top-0 right-0 mt-6 mr-2 flex items-center gap-2">
                          {/* ÚNICO icono para subir */}
                          <button
                            onClick={() => document.getElementById('medicalDocInput')?.click()}
                            className="p-2 text-gray-400 hover:text-yellow-400"
                            title="Subir PDF"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                          <input id="medicalDocInput" type="file" accept="application/pdf" className="hidden" />
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <div className="mt-2 text-xs text-gray-500">
                        Puedes pegar texto del PDF arriba o subir el documento para que la IA lo resuma.
                      </div>
                    )}


                    <EditableField
                      label="Alergias"
                      field="alergias"
                      value={editedData.alergias ?? alergiasList.join("\n")}
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                      type="textarea"
                      isList
                    />

                    <EditableField
                      label="Medicamentos"
                      field="medicamentos"
                      value={editedData.medicamentos ?? medicamentosList.join("\n")}
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                      type="textarea"
                      isList
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="w-full flex items-center justify-between">
                  <span>Lesiones y Limitaciones</span>
                  <Button
                    size="sm"
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                    onClick={() => setIsInjuryModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Añadir lesión
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {injuries.length === 0 ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white">Sin limitaciones actuales</p>
                      <p className="text-gray-400 text-sm">Evaluación IA continua</p>
                    </div>
                    <Badge className="bg-green-400 text-black">Activo</Badge>
                  </div>
                ) : (
                  injuries.map((inj, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div>
                        <p className="text-white">{inj.titulo || inj.zona || "Lesión"} {inj.severidad ? `- ${inj.severidad}` : ""}</p>
                        <p className="text-gray-400 text-sm">
                          {inj.estado === "recuperado" ? "Recuperado" : "En seguimiento"}
                          {inj.fecha ? ` - ${inj.fecha}` : ""}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          inj.estado === "recuperado"
                            ? "border-green-400 text-green-400"
                            : "border-yellow-400 text-yellow-400"
                        }
                      >
                        {inj.estado === "recuperado" ? "Recuperado" : "Activo"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OBJETIVOS */}
        <TabsContent value="goals" className="space-y-6">
          {(() => {
            const isEditing = editingSection === "goals";
            return (
              <Card className="bg-gray-900 border-yellow-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <Target className="mr-2 text-yellow-400" /> Objetivos y
                      Metas
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={handleSave}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Guardar
                          </Button>
                          <Button
                            onClick={handleCancel}
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            startEdit("goals", {
                              objetivo_principal: userProfile.objetivo_principal,
                              meta_peso: userProfile.meta_peso,
                              meta_grasa: userProfile.meta_grasa,
                            })
                          }
                          disabled={editingSection && editingSection !== "goals"}
                          className={`p-2 text-gray-400 hover:text-yellow-400 transition-colors`}
                          title="Editar objetivos y metas"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <EditableField
                      label="Objetivo Principal"
                      field="objetivo_principal"
                      value={userProfile.objetivo_principal}
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      label="Meta de Peso"
                      field="meta_peso"
                      value={userProfile.meta_peso}
                      type="number"
                      suffix=" kg"
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      label="Meta de Grasa Corporal"
                      field="meta_grasa"
                      value={userProfile.meta_grasa}
                      type="number"
                      suffix="%"
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {(() => {
            const isEditing = editingSection === "preferences";
            return (
              <Card className="bg-gray-900 border-yellow-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>Preferencias de Entrenamiento</span>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={handleSave}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Guardar
                          </Button>
                          <Button
                            onClick={handleCancel}
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            startEdit("preferences", {
                              enfoque: userProfile.enfoque,
                              horario_preferido: userProfile.horario_preferido,
                              comidas_diarias: userProfile.comidas_diarias,
                              suplementacion: userProfile.suplementacion,
                              alimentos_excluidos: userProfile.alimentos_excluidos,
                            })
                          }
                          disabled={
                            editingSection && editingSection !== "preferences"
                          }
                          className={`p-2 text-gray-400 hover:text-yellow-400 transition-colors`}
                          title="Editar preferencias de entrenamiento"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <EditableField
                      label="Enfoque Seleccionado"
                      field="enfoque"
                      value={userProfile.enfoque}
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      label="Horario Preferido"
                      field="horario_preferido"
                      value={userProfile.horario_preferido}
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      label="Comidas diarias"
                      field="comidas_diarias"
                      value={userProfile.comidas_diarias}
                      type="number"
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      label="Suplementación"
                      field="suplementacion"
                      value={userProfile.suplementacion}
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      label="Alimentos Excluidos"
                      field="alimentos_excluidos"
                      value={userProfile.alimentos_excluidos}
                      editing={isEditing}
                      editedData={editedData}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </TabsContent>

        {/* CONFIGURACIÓN */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="mr-2 text-yellow-400" /> Configuración de
                Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-yellow-400">
                  Cambiar Contraseña
                </h3>
                <p className="text-gray-400">
                  Esta funcionalidad estará disponible próximamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Modal: Añadir lesión */}
      <Dialog open={isInjuryModalOpen} onOpenChange={setIsInjuryModalOpen}>
        <DialogContent className="bg-gray-900 text-white border-yellow-400/20">
          <DialogHeader>
            <DialogTitle>Añadir una lesión</DialogTitle>
            <DialogDescription className="text-gray-400">
              Registra una lesión o limitación para adaptar el entrenamiento.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <label className="text-sm text-gray-400">Título</label>
              <input className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                value={injuryForm.titulo}
                onChange={(e)=>setInjuryForm({...injuryForm, titulo: e.target.value})}/>
            </div>
            <div>
              <label className="text-sm text-gray-400">Zona</label>
              <input className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                value={injuryForm.zona}
                onChange={(e)=>setInjuryForm({...injuryForm, zona: e.target.value})}/>
            </div>
            <div>
              <label className="text-sm text-gray-400">Severidad</label>
              <select className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                value={injuryForm.severidad}
                onChange={(e)=>setInjuryForm({...injuryForm, severidad: e.target.value})}>
                <option value="leve">Leve</option>
                <option value="moderada">Moderada</option>
                <option value="grave">Grave</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Fecha</label>
              <input type="date" className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                value={injuryForm.fecha}
                onChange={(e)=>setInjuryForm({...injuryForm, fecha: e.target.value})}/>
            </div>
            <div>
              <label className="text-sm text-gray-400">Estado</label>
              <select className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                value={injuryForm.estado}
                onChange={(e)=>setInjuryForm({...injuryForm, estado: e.target.value})}>
                <option value="activo">Activo</option>
                <option value="recuperado">Recuperado</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Limitación actual</label>
              <input className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                value={injuryForm.limitacion_actual}
                onChange={(e)=>setInjuryForm({...injuryForm, limitacion_actual: e.target.value})}/>
            </div>
            <div className="col-span-2">
              <label className="text-sm text-gray-400">Tratamiento</label>
              <input className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                value={injuryForm.tratamiento}
                onChange={(e)=>setInjuryForm({...injuryForm, tratamiento: e.target.value})}/>
            </div>
            <div className="col-span-2">
              <label className="text-sm text-gray-400">Notas</label>
              <textarea className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                rows={3}
                value={injuryForm.notas}
                onChange={(e)=>setInjuryForm({...injuryForm, notas: e.target.value})}/>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-gray-600 text-gray-300" onClick={()=>setIsInjuryModalOpen(false)}>Cancelar</Button>
      {/* Modal Documentación */}
      <Dialog open={docsOpen} onOpenChange={setDocsOpen}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-3xl">
          <DialogHeader>
            <DialogTitle>Documentación</DialogTitle>
            <DialogDescription className="text-gray-400">Archivos PDF subidos del historial médico</DialogDescription>
          </DialogHeader>
          <div className="mt-2 border border-gray-800 rounded-lg overflow-hidden">
            {docs.length === 0 ? (
              <div className="p-4 text-gray-400 text-sm">No hay documentos</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-800 text-gray-300">
                  <tr>
                    <th className="text-left px-3 py-2">Archivo</th>
                    <th className="text-left px-3 py-2">Tamaño</th>
                    <th className="text-left px-3 py-2">Subido</th>
                    <th className="text-left px-3 py-2">IA</th>
                    <th className="px-3 py-2 w-64 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d) => (
                    <tr key={d.id} className="border-t border-gray-800">
                      <td className="px-3 py-2"><a className="text-yellow-400 hover:underline" href={d.url} target="_blank" rel="noreferrer">{d.originalName || d.filename}</a></td>
                      <td className="px-3 py-2 text-gray-400">{Math.round((d.size||0)/1024)} KB</td>
                      <td className="px-3 py-2 text-gray-400">{new Date(d.uploadedAt).toLocaleString()}</td>
                      <td className="px-3 py-2">{d.ai ? <span className="text-green-400">Listo</span> : <span className="text-gray-400">Pendiente</span>}</td>
                      <td className="px-3 py-2 flex gap-2 justify-end">
                        {/* Botón para indexar con IA (extraer + resumir) */}
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          onClick={async ()=>{
                            try {
                              const ex = await fetch(`/api/users/${currentUser.id}/medical-docs/${d.id}/extract`, { method: 'POST' });
                              const exData = await ex.json();
                              if (!exData.success) throw new Error(exData.error || 'Error extrayendo texto');
                              const su = await fetch(`/api/users/${currentUser.id}/medical-docs/${d.id}/summarize`, {
                                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plainText: exData.plainText || '' })
                              });
                              const suData = await su.json();
                              if (!suData.success) throw new Error(suData.error || 'Error resumiendo');
                              await fetchDocs();
                            } catch (e) {
                              alert('No se pudo analizar: ' + e.message);
                            }
                          }}
                        >Indexar con IA</Button>
                        {d.ai && (
                          <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black"
                            onClick={() => {
                              try {
                                const res = d.ai.result || {};
                                const als = Array.isArray(res.alergias) ? res.alergias : [];
                                const meds = Array.isArray(res.medicacion_actual) ? res.medicacion_actual : [];
                                const hist = Array.isArray(res.antecedentes) ? res.antecedentes : [];
                                startEdit('health', {
                                  historial_medico: hist.join('\n'),
                                  alergias: als.join('\n'),
                                  medicamentos: meds.join('\n'),
                                });
                                setDocsOpen(false);
                              } catch {}
                            }}
                          >Aplicar al perfil</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800" onClick={()=>setDocsOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

            <Button className="bg-green-500 hover:bg-green-600" onClick={handleAddInjury}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Calcular composición corporal */}
      <Dialog open={isBodyCalcOpen} onOpenChange={setIsBodyCalcOpen}>
        <DialogContent className="bg-gray-900 text-white border-yellow-400/20">
          <DialogHeader>
            <DialogTitle>Calcular composición corporal</DialogTitle>
            <DialogDescription className="text-gray-400">
              Puedes estimar el % de grasa, masa magra, agua corporal y metabolismo basal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <label className="text-sm text-gray-400">Sexo</label>
              <select className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                value={bodyCalcForm.sexo}
                onChange={(e)=>setBodyCalcForm({...bodyCalcForm, sexo: e.target.value})}>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Edad</label>
              <input type="number" className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                value={bodyCalcForm.edad}
                onChange={(e)=>setBodyCalcForm({...bodyCalcForm, edad: e.target.value})}/>
            </div>
            <div>
              <label className="text-sm text-gray-400">Peso (kg)</label>
              <input type="number" className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                value={bodyCalcForm.peso}
                onChange={(e)=>setBodyCalcForm({...bodyCalcForm, peso: e.target.value})}/>
            </div>
            <div>
              <label className="text-sm text-gray-400">Altura (cm)</label>
              <input type="number" className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                value={bodyCalcForm.altura}
                onChange={(e)=>setBodyCalcForm({...bodyCalcForm, altura: e.target.value})}/>
            </div>
            <div>
              <label className="text-sm text-gray-400">Cintura (cm)</label>
              <input type="number" className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                value={bodyCalcForm.cintura}
                onChange={(e)=>setBodyCalcForm({...bodyCalcForm, cintura: e.target.value})}/>
            </div>
            <div>
              <label className="text-sm text-gray-400">Cuello (cm)</label>
              <input type="number" className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                value={bodyCalcForm.cuello}
                onChange={(e)=>setBodyCalcForm({...bodyCalcForm, cuello: e.target.value})}/>
            </div>
            {bodyCalcForm.sexo === 'Femenino' && (
              <div className="col-span-2">
                <label className="text-sm text-gray-400">Cadera (cm)</label>
                <input type="number" className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  value={bodyCalcForm.cadera}
                  onChange={(e)=>setBodyCalcForm({...bodyCalcForm, cadera: e.target.value})}/>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="border-gray-600 text-gray-300" onClick={()=>setIsBodyCalcOpen(false)}>Cancelar</Button>
            <Button className="bg-green-500 hover:bg-green-600" onClick={handleComputeBodyComp}>Calcular y Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileScreen;


