import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useUserContext } from "../contexts/UserContext";
import { Button } from "@/components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.jsx";
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
} from "lucide-react";

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [editingSection, setEditingSection] = useState(null);
  const [editedData, setEditedData] = useState({});
  const { currentUser } = useAuth();
  const { updateUserData } = useUserContext();

  const startEdit = (section, sectionFields) => {
    setEditingSection(section);
    setEditedData(sectionFields);
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editingSection) return;
    const ok = await updateUserData(editedData);
    if (ok) {
      setEditingSection(null);
      setEditedData({});
    } else {
      alert("Error al guardar los datos.");
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditedData({});
  };

  const EditableField = ({
    label,
    field,
    value,
    editing,
    type = "text",
    options = null,
    suffix = "",
  }) => {
    const displayValue = value ?? "No especificado";

    if (!editing) {
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
            value={editedData[field] ?? ""}
            onChange={(e) => handleInputChange(field, e.target.value)}
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

    return (
      <div>
        <label className="text-gray-400 text-sm">{label}</label>
        <input
          type={type}
          value={editedData[field] ?? ""}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
          placeholder={`Ingresa ${label.toLowerCase()}`}
        />
      </div>
    );
  };

  if (!currentUser) return <div>Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      {/* El contenido completo del componente ya está incluido arriba */}
    </div>
  );
};

export default ProfileScreen;
