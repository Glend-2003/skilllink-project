# Gallery Service con Cloudinary - Guía de Uso

## 📸 Integración de Cloudinary para Service Gallery

Este servicio permite la gestión de imágenes para los servicios de SkillLink utilizando Cloudinary como almacenamiento en la nube.

## 🚀 Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del service-manager con las siguientes variables:

```env
PORT=3004

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_DATABASE=skilllink_db

# JWT
JWT_SECRET=tu_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 2. Obtener Credenciales de Cloudinary

1. Ve a [Cloudinary](https://cloudinary.com/)
2. Crea una cuenta gratuita o inicia sesión
3. En el Dashboard encontrarás:
   - Cloud Name
   - API Key
   - API Secret
4. Copia estos valores a tu archivo `.env`

## 📡 Endpoints Disponibles

### 1. Subir una Imagen

**POST** `/gallery/upload`

Sube una sola imagen a Cloudinary y la registra en la base de datos.

**Content-Type:** `multipart/form-data`

**Body (FormData):**
- `image` (File, requerido): Archivo de imagen
- `providerId` (string, requerido): ID del proveedor
- `serviceId` (string, opcional): ID del servicio
- `imageTitle` (string, opcional): Título de la imagen
- `imageDescription` (string, opcional): Descripción
- `displayOrder` (string, opcional): Orden de visualización

**Ejemplo con Fetch:**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('providerId', '1');
formData.append('serviceId', '5');
formData.append('imageTitle', 'Trabajo realizado');
formData.append('imageDescription', 'Instalación de sistema eléctrico');

const response = await fetch('http://localhost:3004/gallery/upload', {
  method: 'POST',
  body: formData
});
```

**Ejemplo con Axios:**
```javascript
const formData = new FormData();
formData.append('image', file);
formData.append('providerId', '1');
formData.append('serviceId', '5');

const response = await axios.post('http://localhost:3004/gallery/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
```

### 2. Subir Múltiples Imágenes

**POST** `/gallery/upload-multiple`

Sube hasta 10 imágenes simultáneamente.

**Content-Type:** `multipart/form-data`

**Body (FormData):**
- `images` (File[], requerido): Array de archivos (máx 10)
- `providerId` (string, requerido): ID del proveedor
- `serviceId` (string, opcional): ID del servicio

**Ejemplo:**
```javascript
const formData = new FormData();
for (let file of files) {
  formData.append('images', file);
}
formData.append('providerId', '1');
formData.append('serviceId', '5');

const response = await fetch('http://localhost:3004/gallery/upload-multiple', {
  method: 'POST',
  body: formData
});
```

### 3. Crear Entrada con URL (Método Anterior)

**POST** `/gallery`

Crea una entrada de galería con una URL existente.

**Content-Type:** `application/json`

**Body:**
```json
{
  "serviceId": 5,
  "providerId": 1,
  "imageUrl": "https://example.com/image.jpg",
  "imageTitle": "Título",
  "imageDescription": "Descripción",
  "displayOrder": 0
}
```

### 4. Obtener Imágenes de un Servicio

**GET** `/gallery/service/:serviceId`

Retorna todas las imágenes asociadas a un servicio.

**Ejemplo:**
```javascript
const response = await fetch('http://localhost:3004/gallery/service/5');
const images = await response.json();
```

### 5. Obtener una Imagen

**GET** `/gallery/:id`

Obtiene los detalles de una imagen específica.

### 6. Eliminar una Imagen

**DELETE** `/gallery/:id`

Elimina una imagen tanto de la base de datos como de Cloudinary.

**Ejemplo:**
```javascript
await fetch('http://localhost:3004/gallery/15', {
  method: 'DELETE'
});
```

### 7. Aprobar/Desaprobar Imagen

**PATCH** `/gallery/:id/approve`

Alterna el estado de aprobación de una imagen.

## 🎨 Características de Cloudinary

Las imágenes subidas se optimizan automáticamente:
- **Tamaño máximo:** 1200x1200px (mantiene proporciones)
- **Calidad:** Automática (balance entre calidad y tamaño)
- **Formato:** Automático (WebP cuando sea posible)
- **Carpeta:** `skilllink/services/`

## 📱 Integración con React Native / Expo

### Ejemplo con expo-image-picker:

```javascript
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    quality: 0.8,
  });

  if (!result.canceled) {
    await uploadImages(result.assets);
  }
};

const uploadImages = async (assets) => {
  const formData = new FormData();
  
  assets.forEach((asset, index) => {
    formData.append('images', {
      uri: asset.uri,
      type: 'image/jpeg',
      name: `image_${index}.jpg`,
    });
  });
  
  formData.append('providerId', providerId);
  formData.append('serviceId', serviceId);

  try {
    const response = await fetch('http://localhost:3004/gallery/upload-multiple', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const result = await response.json();
    console.log('Uploaded:', result);
  } catch (error) {
    console.error('Upload error:', error);
  }
};
```

## 🔒 Seguridad

- ✅ Verifica que el proveedor sea dueño del servicio antes de permitir uploads
- ✅ Límite de 10 archivos por solicitud múltiple
- ✅ Las imágenes eliminadas de la BD también se eliminan de Cloudinary
- ✅ Validación de campos requeridos

## 🗄️ Base de Datos

La tabla `service_gallery` mantiene su estructura actual:

```sql
gallery_id (PK)
service_id (FK, nullable)
provider_id (FK)
image_url (VARCHAR 500) - Almacena la URL de Cloudinary
image_title (VARCHAR 200, nullable)
image_description (TEXT, nullable)
display_order (INT, default 0)
is_approved (BOOLEAN, default true)
uploaded_at (TIMESTAMP)
approval_date (TIMESTAMP, nullable)
```

## 🚦 Iniciar el Servicio

```bash
cd services/service-manager

# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 🐳 Docker

El servicio ya está configurado para Docker. Asegúrate de pasar las variables de entorno de Cloudinary en el docker-compose.yml:

```yaml
service-manager:
  build: ./services/service-manager
  environment:
    - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
    - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
    - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
```

## 📝 Notas Importantes

1. **Límite de tamaño:** Cloudinary (plan gratuito) tiene límites de almacenamiento
2. **Formatos soportados:** JPG, PNG, GIF, WebP
3. **Las URLs de Cloudinary son permanentes** hasta que se eliminen explícitamente
4. **Backup automático:** Cloudinary mantiene las imágenes de forma segura

## 🔧 Troubleshooting

### Error: "No se proporcionó ningún archivo"
- Verifica que el campo del formulario se llame `image` (singular) o `images` (múltiple)
- Asegúrate de usar `Content-Type: multipart/form-data`

### Error: "Error al subir la imagen a Cloudinary"
- Verifica las credenciales en el archivo `.env`
- Confirma que tu cuenta de Cloudinary esté activa
- Revisa los límites de tu plan de Cloudinary

### Error: "El providerId es requerido"
- El `providerId` es obligatorio en todas las operaciones de upload
- Debe ser un número válido

