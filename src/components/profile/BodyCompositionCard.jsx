import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Save, Pencil, Calculator } from "lucide-react";
import { EditableField } from "../EditableField";

export const BodyCompositionCard = (props) => {
  const {
    userProfile,
    editingSection,
    editedData,
    startEdit,
    handleSave,
    handleCancel,
    handleInputChange,
    setBodyCalcForm,
    setIsBodyCalcOpen,
  } = props;
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
                className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                title="Editar composición corporal"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {/* Botón para abrir el modal de cálculo */}
            {!isEditing && (
              <Button
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => {
                  setBodyCalcForm({
                    sexo: userProfile.sexo || "masculino",
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
};