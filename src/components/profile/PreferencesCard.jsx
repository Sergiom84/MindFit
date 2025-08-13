import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Save, Pencil } from "lucide-react";
import { EditableField } from "../EditableField";

export const PreferencesCard = ({
  userProfile,
  editingSection,
  editedData,
  startEdit,
  handleSave,
  handleCancel,
  handleInputChange,
  enfoqueOptions,
  horarioOptions,
  getEnfoqueLabel,
  getHorarioLabel,
  suplementacionList,
  alimentosList,
  suplementacionObjList,
  alimentosObjList,
}) => {
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
                    // Es importante pasar una copia de las listas
                    suplementacion: [...suplementacionList],
                    alimentos_excluidos: [...alimentosList],
                  })
                }
                disabled={editingSection && editingSection !== "preferences"}
                className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                title="Editar preferencias de entrenamiento"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Primera fila: Enfoque y Horario */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EditableField
            label="Enfoque Seleccionado"
            field="enfoque"
            value={userProfile.enfoque}
            displayValue={getEnfoqueLabel(userProfile.enfoque)}
            editing={isEditing}
            editedData={editedData}
            onInputChange={handleInputChange}
            options={enfoqueOptions}
          />
          <EditableField
            label="Horario Preferido"
            field="horario_preferido"
            value={userProfile.horario_preferido}
            displayValue={getHorarioLabel(userProfile.horario_preferido)}
            editing={isEditing}
            editedData={editedData}
            onInputChange={handleInputChange}
            options={horarioOptions}
          />
        </div>

        {/* Segunda fila: Suplementación y Alimentos Excluidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-4">
            <EditableField
              label="Suplementación"
              field="suplementacion"
              value={suplementacionList}
              editing={isEditing}
              editedData={editedData}
              onInputChange={handleInputChange}
              isList={true}
              displayObjects={suplementacionObjList}
            />
            {/* Comidas diarias debajo de Suplementación */}
            <EditableField
              label="Comidas diarias"
              field="comidas_diarias"
              value={userProfile.comidas_diarias}
              type="number"
              editing={isEditing}
              editedData={editedData}
              onInputChange={handleInputChange}
            />
          </div>
          <EditableField
            label="Alimentos Excluidos"
            field="alimentos_excluidos"
            value={alimentosList}
            editing={isEditing}
            editedData={editedData}
            onInputChange={handleInputChange}
            isList={true}
            displayObjects={alimentosObjList}
          />
        </div>
      </CardContent>
    </Card>
  );
};