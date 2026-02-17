# Temponovo — Catálogos PWA

App de catálogos para vendedores en terreno. Funciona sin internet.

## Estructura
```
index.html   → App principal
sw.js        → Service Worker (offline)
manifest.json → Configuración PWA (instalación en iPad)
```

## Despliegue en Render.com (gratis)

1. Crear cuenta en https://render.com
2. New → Static Site
3. Conectar repositorio de GitHub con estos archivos
4. Build command: (dejar vacío)
5. Publish directory: .
6. Deploy ✓

La app queda en: `https://tu-nombre.onrender.com`

## Instalar en iPad

1. Abrir Safari en el iPad
2. Ir a la URL de la app
3. Botón compartir → "Añadir a pantalla de inicio"
4. La app se instala como nativa

## Configuración inicial (Admin)

1. Abrir la app → pestaña Admin
2. Tocar "Sincronizar ahora" → carga todos los productos de Odoo
3. Opcionalmente configurar URL de fotos (Google Drive)
4. Agregar características por SKU si se desea

## Fotos desde Google Drive

Para que las fotos funcionen:
1. Subir fotos a Google Drive con nombre = SKU del producto (ej: ZP200HD.jpg)
2. Hacer la carpeta pública
3. En Admin → Fotos → pegar la URL base
   Formato: https://drive.google.com/uc?export=view&id=FILE_ID

## API

- URL: https://cmcorpcl-temponovo.odoo.com/api/stock
- Auth: Header Authorization con API Key
- Sincronización automática al abrir la app con conexión
- Datos guardados localmente en IndexedDB para uso offline

## Funcionamiento offline

- Al abrir con internet: sincroniza automáticamente
- Al abrir sin internet: usa últimos datos descargados
- Al recuperar internet: sincroniza en segundo plano
