# 📸 Integración de Galería de Servicios con Cloudinary

## ✅ Componentes Creados

### 1. ServiceGalleryUpload.tsx
Componente para subir imágenes a Cloudinary desde la app móvil.

**Ubicación:** `components/ServiceGalleryUpload.tsx`

**Características:**
- ✅ Selección múltiple de imágenes (hasta 10)
- ✅ Tomar fotos con la cámara
- ✅ Vista previa antes de subir
- ✅ Indicador de progreso
- ✅ Subida automática a Cloudinary
- ✅ Manejo de errores

**Uso:**
```tsx
import { ServiceGalleryUpload } from '@/components/ServiceGalleryUpload';

<ServiceGalleryUpload
  serviceId={serviceId}
  providerId={providerId}
  maxImages={10}
  onUploadComplete={(images) => {
    console.log('Uploaded:', images);
  }}
/>
```

### 2. ServiceGalleryView.tsx
Componente para visualizar y gestionar las imágenes existentes.

**Ubicación:** `components/ServiceGalleryView.tsx`

**Características:**
- ✅ Muestra todas las imágenes del servicio
- ✅ Vista horizontal scroll
- ✅ Eliminar imágenes (modo editable)
- ✅ Refresh manual
- ✅ Indicador de estado (pendiente/aprobado)

**Uso:**
```tsx
import { ServiceGalleryView } from '@/components/ServiceGalleryView';

<ServiceGalleryView
  serviceId={serviceId}
  editable={true}
  onImageDeleted={() => {
    console.log('Image deleted');
  }}
/>
```

## 🔧 Integración Actual

### Pantalla: `app/provider/add-service.tsx`

**Flujo implementado:**
1. Usuario llena el formulario del servicio
2. Hace clic en "Crear Servicio"
3. El servicio se crea en la BD
4. Aparece el componente `ServiceGalleryUpload` automáticamente
5. Usuario puede agregar fotos o finalizar sin fotos
6. Las fotos se suben a Cloudinary y se vinculan al servicio

**Mejoras implementadas:**
- ✅ Botón "Agregar fotos ahora" / "Agregar fotos después"
- ✅ Botón "Finalizar sin fotos" después de crear el servicio
- ✅ El botón de crear servicio se desactiva después de crearlo
- ✅ Obtención automática del `providerId`

## 📡 Endpoints Utilizados

### Backend (Service Manager - Puerto 3004)

**Subir imagen única:**
```
POST /gallery/upload
Content-Type: multipart/form-data

Body:
- image (File)
- providerId (string)
- serviceId (string, opcional)
- imageTitle (string, opcional)
- imageDescription (string, opcional)
```

**Subir múltiples imágenes:**
```
POST /gallery/upload-multiple
Content-Type: multipart/form-data

Body:
- images (File[])
- providerId (string)
- serviceId (string, opcional)
```

**Obtener imágenes de un servicio:**
```
GET /gallery/service/:serviceId
```

**Eliminar imagen:**
```
DELETE /gallery/:galleryId
```

## 🎨 Personalización

### Cambiar la IP del servidor

Actualiza en `components/ServiceGalleryUpload.tsx`:
```tsx
const API_URL = 'http://TU_IP:3004';
```

O usa la configuración global:
```tsx
import { Config } from '@/constants/Config';
const API_URL = Config.SERVICE_MANAGER_URL;
```

### Cambiar el máximo de imágenes

```tsx
<ServiceGalleryUpload
  serviceId={serviceId}
  providerId={providerId}
  maxImages={20}
/>
```

## 🚀 Cómo Probar

1. **Inicia el service-manager:**
   ```bash
   cd services/service-manager
   npm run start:dev
   ```

2. **Inicia la app móvil:**
   ```bash
   cd apps/mobile-app/skilllink
   npx expo start
   ```

3. **Flujo de prueba:**
   - Inicia sesión como proveedor
   - Ve a "Mis Servicios"
   - Clic en "Agregar Servicio"
   - Llena el formulario
   - Clic en "Crear Servicio"
   - Aparecerá la sección de galería
   - Selecciona imágenes o toma fotos
   - Clic en "Subir X imagen(es)"
   - Las imágenes se suben a Cloudinary

## 📋 Próximas Mejoras Sugeridas

1. **Editar Servicio:** Agregar `ServiceGalleryView` y `ServiceGalleryUpload` en `edit-service.tsx`

2. **Ver Servicio:** Agregar `ServiceGalleryView` (solo lectura) en la vista de detalle del servicio

3. **Ordenar imágenes:** Implementar drag & drop para reordenar

4. **Comprimir imágenes:** Agregar compresión antes de subir para ahorrar ancho de banda

5. **Caché de imágenes:** Implementar caché local de las URLs

## 🐛 Troubleshooting

### Error: "No se pudieron subir las imágenes"
- Verifica que el service-manager esté corriendo en el puerto 3004
- Confirma la IP en `Config.ts`
- Revisa las credenciales de Cloudinary en el `.env`

### Las imágenes no aparecen
- Verifica la conexión de red
- Revisa la consola del service-manager
- Confirma que el `serviceId` es correcto

### Error de permisos
- En iOS: Verifica los permisos en `Info.plist`
- En Android: Verifica los permisos en `AndroidManifest.xml`
- La app solicitará permisos automáticamente

## 📝 Notas Importantes

- Las imágenes se optimizan automáticamente en Cloudinary (max 1200x1200px)
- El formato se convierte a WebP cuando es posible (mejor compresión)
- Las URLs de Cloudinary son permanentes hasta que se eliminen
- Al eliminar una imagen de la BD, también se elimina de Cloudinary
- El plan gratuito de Cloudinary tiene límites de almacenamiento

## 🔗 Referencias

- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [Service Manager README](../../services/service-manager/README.md)
