import csv
import json
import requests
import time
import ast

# Configuration
API_URL_PRODUCT = 'http://localhost:3000/insertProduct'
API_URL_PRESENTATION = 'http://localhost:3000/insertPresentacionesProducto'
TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2wiOiJhZG1pbiIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3NDY1MjUxNjQsImV4cCI6MTc0NjcwNTE2NH0.YcnZB0zW18Ub73SLgPPBRFV65GqDAKZRu4tD3o4OdW8'
ID_SUPPLIER = '2'

# Load presentation IDs from CSV
def load_presentation_ids(csv_path):
    presentation_map = {}
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # Map presentation name to its ID
                presentation_map[row['presentacion'].strip().upper()] = row['id']
        
        print(f"Loaded {len(presentation_map)} presentation IDs")
        return presentation_map
    except Exception as e:
        print(f"Error loading presentation IDs: {str(e)}")
        return {}

# Function to process presentation as JSON
def procesar_presentacion(presentacion_str):
    if not presentacion_str or presentacion_str.strip() == '':
        return json.dumps({"default": [1, 1]})
    
    try:
        # Replace single quotes with double quotes for valid JSON format
        clean_str = presentacion_str.replace("'", '"')
        # Try to validate as JSON
        json.loads(clean_str)
        return clean_str
    except json.JSONDecodeError:
        try:
            # If it fails, try with ast.literal_eval to evaluate Python dictionaries
            presentacion_dict = ast.literal_eval(presentacion_str.replace('"', "'"))
            return json.dumps(presentacion_dict)
        except Exception as e:
            print(f"Error processing presentation: {presentacion_str} - Error: {e}")
            return json.dumps({"default": [1, 1]})

# Function to ensure values aren't empty
def ensure_value(value, default=''):
    return value if value and value.strip() != '' else default

# Function to parse the presentation JSON and extract data
def parse_presentation_data(presentation_json_str):
    try:
        # Handle both string and dict inputs
        if isinstance(presentation_json_str, str):
            presentation_data = json.loads(presentation_json_str)
        else:
            presentation_data = presentation_json_str
            
        result = []
        
        # Process each presentation type (BLISTER, CAJA, etc.)
        for tipo, valores in presentation_data.items():
            if isinstance(valores, list) and len(valores) >= 2:
                # Extract quantity and price values
                cantidad = valores[0]
                precio = valores[1]
                result.append({
                    'tipo': tipo.strip().upper(),
                    'cantidad': cantidad,
                    'precio': precio
                })
        
        return result
    except Exception as e:
        print(f"Error parsing presentation data: {str(e)}")
        return []

# Function to insert presentation for a product
def insertar_presentacion(product_id, presentation_type, quantity, price, presentation_ids):
    try:
        # Get the presentation ID from the map
        presentation_id = presentation_ids.get(presentation_type)
        
        if not presentation_id:
            print(f"Warning: No ID found for presentation type '{presentation_type}'. Skipping.")
            return None
            
        # Prepare the data
        data = {
            'token': TOKEN,
            'pp': price,  # precio de presentación
            'cantidad_presentacion': quantity,
            'presentacion_id': presentation_id,
            'product_id': product_id
        }
        
        # Set proper headers
        headers = {
            'Content-Type': 'application/json'
        }
        
        # Make the API call
        print(f"Inserting presentation for product {product_id}: {presentation_type}, Quantity: {quantity}, Price: {price}")
        response = requests.post(API_URL_PRESENTATION, json=data, headers=headers)
        
        if response.status_code == 200:
            print(f"Presentation inserted successfully: {response.json()}")
            return response.json()
        else:
            print(f"Error inserting presentation: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"Exception inserting presentation: {str(e)}")
        return None

# Function to insert a product
def insertar_producto(producto, presentation_ids):
    try:
        # Prepare the product data with default values for empty fields
        data = {
            'token': TOKEN,
            'nombre': ensure_value(producto['medicamento'], 'Sin nombre'),
            'forma_f': ensure_value(producto['forma_farmaceutica'], 'No especificada'),
            'presentacion': procesar_presentacion(producto['presentacion']),
            'id_supplier': ID_SUPPLIER,
            'activo_principal': ensure_value(producto['principio_activo'], 'No especificado'),
            'isControlado': 'false',  # Default not controlled
            'descripcion': ensure_value(producto['descripcion_de_uso'], 'Sin descripción'),
            'dosificacion': ensure_value(producto['dosificacion'], 'No especificada'),
            'accion_farmacologica': ensure_value(producto['accion_farmacologica'], 'No especificada')
        }
        
        # Print the request data for debugging
        print(f"Sending data for {producto['medicamento']}:")
        for key, value in data.items():
            print(f"  {key}: {value[:50]}..." if isinstance(value, str) and len(value) > 50 else f"  {key}: {value}")
        
        # Set proper headers for JSON content
        headers = {
            'Content-Type': 'application/json'
        }
        
        # Send as JSON data
        response = requests.post(API_URL_PRODUCT, json=data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            print(f"Product inserted: {producto['medicamento']} - Response: {result}")
            
            # Extract the product ID from the response
            product_id = result.get('id')
            
            if product_id:
                # Parse the presentation data
                presentation_json = data['presentacion']
                presentations = parse_presentation_data(json.loads(presentation_json))
                
                # Insert each presentation type
                for pres in presentations:
                    insertar_presentacion(
                        product_id, 
                        pres['tipo'], 
                        pres['cantidad'], 
                        pres['precio'],
                        presentation_ids
                    )
            
            return product_id
        else:
            print(f"Error inserting {producto['medicamento']}: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"Exception inserting {producto.get('medicamento', 'unknown')}: {str(e)}")
        return None

# Main function to process the CSV
def procesar_csv(productos_csv_path, presentaciones_csv_path):
    # Load presentation IDs mapping
    presentation_ids = load_presentation_ids(presentaciones_csv_path)
    
    if not presentation_ids:
        print("Error: Unable to load presentation IDs. Aborting.")
        return
    
    productos = []
    
    # Read the products CSV file
    with open(productos_csv_path, 'r', encoding='utf-8') as file:
        # Define column names based on the provided header
        reader = csv.DictReader(file)
        for row in reader:
            # Remap the fields according to the endpoint format
            producto = {
                'id': row.get('id', ''),
                'medicamento': row.get('medicamento', ''),
                'presentacion': row.get('presentacion', ''),
                'forma_farmaceutica': row.get('Forma Farmaceutica', ''),
                'descripcion_de_uso': row.get('Descripcion de Uso', ''),
                'principio_activo': row.get('principio_activo', ''),
                'dosificacion': row.get('dosificacion', ''),
                'accion_farmacologica': row.get('accion_farmacologica', '')
            }
            productos.append(producto)
    
    print(f"Found {len(productos)} products in the CSV")
    
    # Insert products sequentially
    successful_inserts = 0
    for producto in productos:
        product_id = insertar_producto(producto, presentation_ids)
        if product_id:
            successful_inserts += 1
        # Wait a brief moment between insertions to not overload the server
        time.sleep(0.5)
    
    print(f"Process completed. Successfully inserted {successful_inserts} out of {len(productos)} products.")

if __name__ == "__main__":
    # Define file paths
    PRODUCTS_CSV_PATH = './data_first_sprint/byf.csv'  # Path to products CSV
    PRESENTATIONS_CSV_PATH = './presentaciones.csv'  # Path to presentations CSV with IDs
    
    # Start processing
    procesar_csv(PRODUCTS_CSV_PATH, PRESENTATIONS_CSV_PATH)