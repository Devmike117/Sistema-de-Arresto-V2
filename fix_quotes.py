import os
import re

# Archivos a actualizar
files = [
    r'C:\Users\mikea\Desktop\Sistema-de-Arresto-V2\frontend\src\components\Dashboard.js',
    r'C:\Users\mikea\Desktop\Sistema-de-Arresto-V2\frontend\src\App.js',
    r'C:\Users\mikea\Desktop\Sistema-de-Arresto-V2\frontend\src\components\FacialSearch.js',
    r'C:\Users\mikea\Desktop\Sistema-de-Arresto-V2\frontend\src\components\HistoryArrestModal.js',
    r'C:\Users\mikea\Desktop\Sistema-de-Arresto-V2\frontend\src\components\PersonReport.js',
    r'C:\Users\mikea\Desktop\Sistema-de-Arresto-V2\frontend\src\components\SearchPeople.js',
]

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Corregir todas las variantes de sintaxis incorrecta
        # Patrón: `${API_BASE_URL}/ruta" -> `${API_BASE_URL}/ruta`
        content = re.sub(r'`\$\{API_BASE_URL\}([^`"\']*)"', r'`${API_BASE_URL}\1`', content)
        
        # Patrón: `${API_BASE_URL}/ruta' -> `${API_BASE_URL}/ruta`
        content = re.sub(r"`\$\{API_BASE_URL\}([^`\"']*)'", r'`${API_BASE_URL}\1`', content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Corregido: {os.path.basename(file_path)}")
    else:
        print(f"No encontrado: {file_path}")

print("\nTodas las comillas corregidas!")
