import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Save, Pencil, FileText } from 'lucide-react'
import { EditableField } from '../EditableField'

export const HealthTab = (props) => {
  const {
    editingSection,
    editedData,
    startEdit,
    handleSave,
    handleCancel,
    handleInputChange,
    docs,
    fetchDocs,
    setDocsOpen,
    fileInputRef,
    handlePdfUpload,
    alergiasList,
    medicamentosList,
    alergiasObjList,
    medicamentosObjList
  } = props

  const isEditing = editingSection === 'health'

  return (
    <Card className="bg-gray-900 border-yellow-400/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Historial Médico y Salud</span>
          <div className="flex items-center gap-2">
            {isEditing
              ? (
              <>
                <Button onClick={handleSave} size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                  <Save className="w-4 h-4 mr-1" /> Guardar
                </Button>
                <Button onClick={handleCancel} size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  Cancelar
                </Button>
              </>
                )
              : (
              <button
                onClick={() => {
                  startEdit('health', {
                    alergias: [...alergiasList],
                    medicamentos: [...medicamentosList]
                  })
                }}
                disabled={!!(editingSection && editingSection !== 'health')}
                className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                title="Editar historial médico"
              >
                <Pencil className="w-4 h-4" />
              </button>
                )}

            <Button
              onClick={async () => {
                await fetchDocs()
                setDocsOpen(true)
              }}
              size="sm"
              variant="outline"
              className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400/50"
              title="Ver documentos médicos subidos"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Documentación
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          await handlePdfUpload(file)
          e.target.value = ''
        }}
      />

      <CardContent className="space-y-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-yellow-400 mb-4">Historial Médico</h3>
          <div className="bg-gray-800/50 rounded-lg p-4 min-h-[150px] flex items-center justify-center">
            {docs && docs.length > 0
              ? (
              <p className="text-gray-300">Tienes {docs.length} documento(s) subido(s). Haz clic en 'Documentación' para verlos.</p>
                )
              : (
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">No hay documentos médicos subidos</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium"
                >
                  Subir Documentación
                </button>
              </div>
                )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EditableField
            label="Alergias"
            field="alergias"
            editing={isEditing}
            isList={true}
            value={alergiasList}
            editedData={editedData}
            onInputChange={handleInputChange}
            displayObjects={alergiasObjList}
            {...props}
          />

          <EditableField
            label="Medicamentos"
            field="medicamentos"
            editing={isEditing}
            isList={true}
            value={medicamentosList}
            editedData={editedData}
            onInputChange={handleInputChange}
            displayObjects={medicamentosObjList}
            {...props}
          />
        </div>
      </CardContent>
    </Card>
  )
}
