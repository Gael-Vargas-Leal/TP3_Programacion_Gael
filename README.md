## Decisiones de diseño

### Base de datos

- **Tabla `viajes` como tabla intermedia:** un vehículo puede hacer muchos viajes y un conductor también. Cada viaje une a un vehículo con un conductor, así se puede consultar el historial de cualquiera de los dos.
- **Datos únicos (`UNIQUE`):** email, patente, número de documento y número de licencia no se pueden repetir, porque identifican a una sola persona o vehículo.
- **Sin `ON DELETE CASCADE`:** si se borrara un vehículo o conductor, se borrarían sus viajes y se perdería el historial. Por eso la base rechaza el borrado y la API avisa "No se puede eliminar: tiene viajes asociados".
- **`DECIMAL` para kilómetros y capacidad de carga:** guarda valores exactos con decimales, sin errores de redondeo como los que tiene `FLOAT`.

### Seguridad

- **Contraseñas con bcrypt:** se guarda un hash y nunca la contraseña real. Aunque alguien vea la base de datos, no puede leerlas.
- **JWT con vencimiento de 4 horas:** tras iniciar sesión, el servidor entrega un token que el frontend envía en cada pedido. Si se vence, hay que volver a ingresar.
- **Rutas protegidas con Passport (`passport-jwt`):** vehículos, conductores y viajes solo responden si el token es válido. Sin token, la API devuelve 401.

### Reglas de negocio

- **Licencia vencida:** no se registra un viaje con un conductor cuya licencia esté vencida (error 403).
- **Fechas coherentes:** la llegada no puede ser anterior a la salida.
- **Validación doble:** los datos se validan en el frontend (para avisar rápido al usuario) y en el backend con `express-validator` (porque el frontend se puede saltear).