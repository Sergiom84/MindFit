const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\Sergio\\Desktop\\MindFit\\src\\components\\ProfileScreen.jsx';

// Leer el archivo
let content = fs.readFileSync(filePath, 'utf8');

// Expresión regular para encontrar todas las instancias de EditableField sin las nuevas props
const editableFieldRegex = /(<EditableField[^>]*?editing=\{[^}]+\})/g;

// Función para añadir las props faltantes
function addMissingProps(match) {
  // Si ya tiene editedData y onInputChange, no hacer nada
  if (match.includes('editedData=') && match.includes('onInputChange=')) {
    return match;
  }
  
  // Añadir las props faltantes antes del cierre
  return `${match  }\n                      editedData={editedData}\n                      onInputChange={handleInputChange}`;
}

// Reemplazar todas las instancias
content = content.replace(editableFieldRegex, addMissingProps);

// Escribir el archivo actualizado
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Archivo actualizado correctamente');
