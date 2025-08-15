# FEATURE — Entrenamiento en casa (Selección + Generación)

## 1) UI / patrón
- Patrón: **Radio Card Group** (exclusión mutua) en dos grupos:
  - **Equipamiento**: `minimo` | `basico` | `avanzado`
  - **Estilo**: `funcional` | `hiit` | `fuerza`
- Componente: usar `Card` de `src/components/ui/` o Tailwind + estado “seleccionado”.

## 2) Enumeraciones
```ts
type Equipment = "minimo" | "basico" | "avanzado";
type Style = "funcional" | "hiit" | "fuerza";
