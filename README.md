# Temponovo — Catálogos App

App de catálogos para vendedores. Genera PDFs dinámicos desde la API de Odoo con productos en stock.

## Archivos

```
index.html      → App principal (renombrar temponovo-final.html)
sw.js           → Service Worker (funciona offline)
manifest.json   → Config PWA (instalación en iPad)
```

## Subir a GitHub

1. Ve a https://github.com/natischnitzler/app
2. Borra todo lo que esté ahí
3. Sube estos 3 archivos:
   - `temponovo-final.html` → **RENOMBRAR A `index.html`**
   - `sw.js`
   - `manifest.json`

## Deploy en Render

Ya está configurado. Render detectará los cambios automáticamente y deployará en 1-2 minutos.

URL final: https://temponovo.onrender.com

## Instalar en iPad

1. Abrir Safari en el iPad
2. Ir a: https://temponovo.onrender.com
3. Botón compartir → "Añadir a pantalla de inicio"
4. La app queda instalada

## Funcionamiento

- **Primera apertura con wifi:** Descarga todos los productos de Odoo
- **Filtra por stock:** Solo muestra productos con stock > 0
- **Agrupa por categoría:** Genera un catálogo por Parent_category
- **Offline completo:** Todo se guarda en IndexedDB
- **Actualización automática:** Una vez al día cuando hay wifi
- **Compartir:** Botón para enviar catálogo por WhatsApp

## Conexión API

- URL: https://cmcorpcl-temponovo.odoo.com/api/stock
- Auth: Header Authorization con API Key
- Si da error CORS, necesitaremos un backend proxy

## Troubleshooting

**Error CORS:** La API bloquea peticiones desde el navegador
- Solución: Crear backend proxy en Render (5 minutos)

**No carga productos:** 
- Abrir consola del navegador (F12)
- Ver mensaje de error
- Probablemente sea CORS

**Actualización:** 
- Cada 24 horas automático
- O manualmente recargando la página

## Próximos pasos

Si funciona bien con la API directa, podemos:
1. Agregar generación de PDFs reales descargables
2. Panel admin para forzar actualización
3. Notificaciones cuando hay stock nuevo
