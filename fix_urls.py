import os
import re

# Archivos a actualizar
files_to_update = [
    r'C:\Users\mikea\Desktop\Sistema-de-Arresto-V2\frontend\src\components\Dashboard.js',
    r'C:\Users\mikea\Desktop\Sistema-de-Arresto-V2\frontend\src\App.js',
    r'C:\Users\mikea\Desktop\Sistema-de-Arresto-V2\frontend\src\components\FacialSearch.js',
    r'C:\Users\mikea\Desktop\Sistema-de-Arresto-V2\frontend\src\components\HistoryArrestModal.js',
    r'C:\Users\mikea\Desktop\Sistema-de-Arresto-V2\frontend\src\components\PersonReport.js',
    r'C:\Users\mikea\Desktop\Sistema-de-Arresto-V2\frontend\src\components\SearchPeople.js',
]

for file_path in files_to_update:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Verificar si ya tiene el import
        if 'import API_BASE_URL from' not in content:
            # Buscar la última línea de import
            imports_match = re.findall(r'^import .*?;$', content, re.MULTILINE)
            if imports_match:
                last_import = imports_match[-1]
                content = content.replace(
                    last_import,
                    last_import + "\nimport API_BASE_URL from '../config';"
                )
        
        # Reemplazar todas las URLs
        content = content.replace('http://localhost:5000', '${API_BASE_URL}')
        content = content.replace('"http://localhost:5000', '`${API_BASE_URL}')
        content = content.replace("'http://localhost:5000", '`${API_BASE_URL}')
        
        # Arreglar comillas mixtas
        content = content.replace('`${API_BASE_URL}/', '${API_BASE_URL}/')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Actualizado: {os.path.basename(file_path)}")
    else:
        print(f"No encontrado: {file_path}")

print("\nTodas las URLs actualizadas correctamente!")
