# 📚 Guía de Estructura de Código

## 🎯 Estructura Recomendada para Componentes React

### Dashboard.js - Estructura Actual

```
Línea 1-18:    Imports y configuración
Línea 19-114:  CustomSelect (componente auxiliar)
Línea 115-155: Configuración de opciones (year, month, day)
Línea 156-XXX: Dashboard (componente principal)
Línea 686-740: StatCard (componente auxiliar)
Línea 743-762: ChartCard (componente auxiliar)
Línea 765-905: Estilos (styles, thStyle, tdStyle)
```

---

## ✅ Estructura Ideal Recomendada

```javascript
// ============================================
// 1. IMPORTS
// ============================================
import React from 'react';
import OtrosImports from './ruta';

// ============================================
// 2. CONSTANTES Y CONFIGURACIONES
// ============================================
const CONSTANTES = {
  // configuraciones globales del componente
};

const yearOptions = [...];
const monthOptions = [...];

// ============================================
// 3. COMPONENTES AUXILIARES (UI)
// ============================================

/**
 * CustomSelect - Dropdown personalizado
 */
function CustomSelect(props) {
  // ...
}

/**
 * StatCard - Tarjeta de estadística
 */
function StatCard(props) {
  // ...
}

/**
 * ChartCard - Contenedor de gráficos
 */
function ChartCard(props) {
  // ...
}

// ============================================
// 4. COMPONENTE PRINCIPAL
// ============================================

/**
 * Dashboard - Componente principal del tablero
 */
export default function Dashboard(props) {
  // ===== 4.1 ESTADO =====
  const [state, setState] = useState();
  
  // ===== 4.2 EFECTOS =====
  useEffect(() => {
    // ...
  }, []);
  
  // ===== 4.3 FUNCIONES/HANDLERS =====
  const handleClick = () => {
    // ...
  };
  
  // ===== 4.4 RENDERIZADO =====
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// ============================================
// 5. ESTILOS
// ============================================
const styles = {
  // ...
};
```

---

## 🔧 Cómo Reorganizar tu Código

### Paso 1: Identificar Secciones
1. **Imports** → Todo lo que empieza con `import`
2. **Constantes** → Variables globales, opciones, configuraciones
3. **Componentes Auxiliares** → Componentes pequeños reutilizables
4. **Componente Principal** → El componente que se exporta
5. **Estilos** → Objetos de estilos al final

### Paso 2: Mover Componentes
- Mueve `StatCard` y `ChartCard` ANTES del componente `Dashboard`
- Agrúpalos en una sección comentada

### Paso 3: Agrupar Constantes
- Mueve todas las opciones (yearOptions, monthOptions, etc.) después de imports
- Antes de cualquier componente

### Paso 4: Organizar Estado en Dashboard
Dentro del componente Dashboard, agrupa:
```javascript
// ===== ESTADO =====
const [summary, setSummary] = useState(...);
const [filter, setFilter] = useState(...);
// ... resto del estado

// ===== EFECTOS =====
useEffect(() => {...}, []);

// ===== FUNCIONES =====
const fetchDashboard = async () => {...};
const handleOpenModal = async () => {...};
```

---

## 📦 Ventajas de Esta Estructura

✅ **Fácil navegación**: Sabes dónde está cada cosa
✅ **Mantenibilidad**: Fácil de modificar y extender
✅ **Escalabilidad**: Puedes extraer componentes a archivos separados
✅ **Colaboración**: Otros desarrolladores entienden rápido
✅ **Debugging**: Encuentras errores más rápido

---

## 🚀 Sugerencias Avanzadas

### Opción 1: Mantener Todo en un Archivo
- Usa la estructura de secciones con comentarios
- Ideal para componentes medianos (<1000 líneas)

### Opción 2: Separar en Múltiples Archivos
```
components/
  Dashboard/
    index.js           (componente principal)
    StatCard.js        (componente auxiliar)
    ChartCard.js       (componente auxiliar)
    CustomSelect.js    (componente auxiliar)
    Dashboard.styles.js (estilos)
    constants.js       (configuraciones)
```

---

## 💡 Tips Rápidos

1. **Usa Outline en VS Code**: Ver → Outline (muestra estructura del archivo)
2. **Usa Breadcrumbs**: Ctrl+Shift+. para navegar jerárquicamente
3. **Pliega secciones**: Usa las flechitas para colapsar funciones
4. **Busca símbolos**: Ctrl+Shift+O para ver todos los componentes/funciones
5. **Comenta secciones**: Usa comentarios `// ===== SECCIÓN =====`

---

## 🎨 Ejemplo de Comentarios de Sección

```javascript
// ============================================
// SECCIÓN PRINCIPAL (mayúsculas, línea completa)
// ============================================

// ===== Subsección (mayúsculas, línea corta) =====

/**
 * Comentario JSDoc para funciones
 * @param {type} nombre - descripción
 */
```

---

Creado para: Sistema de Arresto V2
Fecha: 15 de octubre de 2025
