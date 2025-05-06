import pandas as pd
import re

# Lista de presentaciones válidas
PRESENTACIONES_VALIDAS = [
    'BLISTR', 'CAJA', 'FCO', 'SUSP', 'JERINGA', 'TUBO', 'AMP', 'KIT',
    'SOBRES', 'SOBRE', 'VIAL', 'AMPOLLA', 'GEL', 'FRASCO', 'GEL CAPS', 'GELCAPS',
    'BOLSA', 'JBE', 'JARABE', 'BLIST', 'BLISTER', 'CAPS', 'LATITA', 'VIAL PANAL',
    'TAB', 'INYEC', 'GEL', 'BLIS', 'CAJ', 'PERSERVATIVOS', 'PERSERVATIVO', 'CJA', 'CREMA', 'AGUJA', 'ACEITE', 'SPRAY','GOTAS', 'GOTA', 'BLS','TABS'
]

# Presentaciones líquidas (cantidad siempre 1)
PRESENTACIONES_LIQUIDAS = [
    'FCO', 'FRASCO', 'SUSP', 'JBE', 'JARABE', 'LATITA', 'GOTAS', 'GOTA'
]

# Mapeo para normalizar nombres
MAPEO_NORMALIZADO = {
    'CAJA': 'CAJA',
    'CJA': 'CAJA',
    'CAJ': 'CAJA',
    'BLISTR': 'BLISTER',
    'BLIST': 'BLISTER',
    'BLISTER': 'BLISTER',
    'FCO': 'FRASCO',
    'FRASCO': 'FRASCO',
    'SUSP': 'SUSPENSION',
    'JBE': 'JARABE',
    'JARABE': 'JARABE',
    'JERINGA': 'JERINGA PRELLENADA',
    'TUBO': 'TUBO',
    'AMP': 'AMPOLLA',
    'AMPOLLA': 'AMPOLLA',
    'GEL': 'GELATINA BLANDA',
    'GEL CAPS': 'GELATINA BLANDA',
    'GELCAPS': 'GELATINA BLANDA',
    'BOLSA': 'BOLSA',
    'VIAL': 'VIAL',
    'VIAL PANAL': 'VIAL',
    'CAPS': 'CAPSULA',
    'LATITA': 'FRASCO',   # asumimos LATITA como FRASCO
    'TAB': 'TABLETA',
    'INYEC': 'AMPOLLA',
    'SOBRE': 'SOBRE',
    'SOBRES': 'SOBRE',
    'PERSERVATIVOS': 'SACHET',   # ejemplo de agrupación
    'PERSERVATIVO': 'SACHET',
    'CREMA': 'CREMA',
    'AGUJA': 'JERINGA PRELLENADA',
    'ACEITE': 'BOTE',
    'GOTA':'FRASCO',
    'GOTAS':'FRASCO',
    'BLS': 'BLISTER',
    'TABS': 'TABLETA'
    
}

# Cargar el DataFrame
df = pd.read_csv('./data/ BYF.csv', sep=',')

# Función para extraer y normalizar presentaciones
def extraer_presentacion(texto):
    presentaciones = {}

    # 1. Buscar todos los patrones "PRESENTACION X CANTIDAD"
    matches_x = re.findall(r'([A-Z/]+)\s+X\s+(\d+)', texto)
    for nombre, cantidad in matches_x:
        if nombre in PRESENTACIONES_VALIDAS:
            nombre_norm = MAPEO_NORMALIZADO.get(nombre, nombre)
            if nombre in PRESENTACIONES_LIQUIDAS:
                presentaciones[nombre_norm] = 1
            else:
                presentaciones[nombre_norm] = 1

    # 2. Buscar presentaciones solas sin cantidad
    matches_simple = re.findall(r'\b(' + '|'.join(PRESENTACIONES_VALIDAS) + r')\b', texto)
    for nombre in matches_simple:
        nombre_norm = MAPEO_NORMALIZADO.get(nombre, nombre)
        if nombre_norm not in presentaciones:
            presentaciones[nombre_norm] = 1

    if 'CAJA' in presentaciones and 'BLISTER' in presentaciones:
         blister_valor = presentaciones['BLISTER']
         presentaciones.clear()
         presentaciones['BLISTER'] = blister_valor

    if ('ML' in texto or 'LITRO' in texto) and presentaciones == {}:
      presentaciones['FRASCO'] = 1

    return presentaciones

# Aplicar función
df['presentaciones'] = df['ARTICULO'].apply(extraer_presentacion)

# Mostrar resultados
df_show = df[['No', 'ARTICULO', 'presentaciones']]
print(df_show)

# Guardar en CSV
df_show.to_csv('presentaciones_add.csv', index=False)
