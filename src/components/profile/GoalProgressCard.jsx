import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Save, Pencil } from "lucide-react";
import { EditableField } from "../EditableField";

export const GoalProgressCard = ({
  userProfile,
  editingSection,
  editedData,
  startEdit,
  handleSave,
  handleCancel,
  handleInputChange,
}) => {
  const isEditing = editingSection === "goalProgress";

  return (
    <Card className="bg-gray-900 border-yellow-400/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="mr-2 text-yellow-400" /> Seguimiento de Progreso
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
                  startEdit("goalProgress", {
                    fecha_inicio_objetivo: userProfile.fecha_inicio_objetivo,
                    fecha_meta_objetivo: userProfile.fecha_meta_objetivo,
                    notas_progreso: userProfile.notas_progreso,
                  })
                }
                disabled={editingSection && editingSection !== "goalProgress"}
                className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                title="Editar seguimiento de progreso"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <EditableField
              label="Fecha de Inicio"
              field="fecha_inicio_objetivo"
              value={userProfile.fecha_inicio_objetivo}
              type="date"
              editing={isEditing}
              editedData={editedData}
              onInputChange={handleInputChange}
            />
            <EditableField
              label="Fecha Meta"
              field="fecha_meta_objetivo"
              value={userProfile.fecha_meta_objetivo}
              type="date"
              editing={isEditing}
              editedData={editedData}
              onInputChange={handleInputChange}
            />
          </div>
          <div className="space-y-4">
            <EditableField
              label="Notas de Progreso"
              field="notas_progreso"
              value={userProfile.notas_progreso}
              type="textarea"
              editing={isEditing}
              editedData={editedData}
              onInputChange={handleInputChange}
            />
          </div>
        </div>

        {/* Timeline visualization */}
        {!isEditing && userProfile.fecha_inicio_objetivo && userProfile.fecha_meta_objetivo && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-300 mb-4">Línea de Tiempo del Objetivo</h4>
            <div className="relative">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Inicio: {new Date(userProfile.fecha_inicio_objetivo).toLocaleDateString()}</span>
                <span>Meta: {new Date(userProfile.fecha_meta_objetivo).toLocaleDateString()}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 relative">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-green-400 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0,
                      ((new Date() - new Date(userProfile.fecha_inicio_objetivo)) /
                      (new Date(userProfile.fecha_meta_objetivo) - new Date(userProfile.fecha_inicio_objetivo))) * 100
                    ))}%`
                  }}
                ></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-white opacity-50"></div>
              </div>
              <div className="flex justify-center text-xs text-gray-400 mt-1">
                <span>Hoy</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};