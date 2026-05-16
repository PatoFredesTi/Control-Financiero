# Versión 3.0 — Inicio real, producto final y presentación profesional

## Objetivo

La versión v3.0 transforma el inicio de la aplicación en una experiencia más cercana a producto real.

Antes, la ruta principal `/` mostraba directamente el catálogo completo de módulos y capacidades del sistema. Desde esta versión, el usuario llega primero a una pantalla de inicio clara, con propuesta de valor, botones de inicio de sesión y registro.

El catálogo completo de funcionalidades queda separado en una vista dedicada: `/features`.

## Cambios principales

- Nueva landing principal en `/`.
- Nuevas pantallas visuales:
  - `/login`
  - `/register`
- Nueva vista separada para capacidades del sistema:
  - `/features`
- Footer público con acceso a funcionalidades, guía demo, planes y legal.
- Navegación móvil ajustada para no aparecer en pantallas públicas.
- Botón flotante móvil oculto en landing, login, registro y páginas públicas.
- Flujo demo local:
  - Login visual redirige a `/dashboard`.
  - Registro visual redirige a `/onboarding`.
- Mensaje de producto más claro:
  - primero el usuario entiende la propuesta y accede/crea cuenta;
  - luego entra al programa;
  - el detalle de todo lo que hace la app queda disponible como apartado secundario.

## Rutas nuevas o destacadas

```txt
/
/login
/register
/features
/dashboard
/onboarding
/demo-guide
```

## Nota técnica

Las pantallas de login y registro de esta versión son una experiencia visual/demo preparada para presentación. El backend puede seguir evolucionando hacia autenticación productiva con sesiones, refresh tokens, recuperación de contraseña y verificación real de email.
