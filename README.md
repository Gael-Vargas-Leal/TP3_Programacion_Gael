## Modelo de datos

```mermaid
erDiagram
    USUARIOS {
      int id PK
      varchar nombre
      varchar email UK
      varchar password
    }
    VEHICULOS {
      int id PK
      varchar marca
      varchar modelo
      varchar patente UK
      int anio
      decimal capacidad_carga
    }
    CONDUCTORES {
      int id PK
      varchar nombre
      varchar apellido
      varchar numero_documento UK
      varchar numero_licencia UK
      date fecha_alta_licencia
      date fecha_vencimiento_licencia
    }
    VIAJES {
      int id PK
      int vehiculo_id FK
      int conductor_id FK
      datetime fecha_salida
      datetime fecha_llegada
      varchar origen
      varchar destino
      decimal kilometros
      text observaciones
    }
    VEHICULOS ||--o{ VIAJES : realiza
    CONDUCTORES ||--o{ VIAJES : conduce
```

## Decisiones de diseño

- La tabla `viajes` resuelve la relación muchos a muchos entre vehículos y conductores.
- Restricciones `UNIQUE` en email, patente, número de documento y número de licencia.
- Sin `ON DELETE CASCADE`, para no perder el historial de viajes: no se puede borrar un vehículo o conductor con viajes asociados.
- `DECIMAL` para los kilómetros y la capacidad de carga.
- Contraseñas encriptadas con bcrypt.
- JWT con expiración de 4 horas.
- Rutas protegidas con Passport (`passport-jwt`).