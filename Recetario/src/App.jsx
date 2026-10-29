import { useEffect, useRef, useState } from "react";
import "./App.css";

const CLAVE_ALMACEN = "recetario:recetas";

function cargarRecetas() {
  try {
    const guardado = localStorage.getItem(CLAVE_ALMACEN);
    return guardado ? JSON.parse(guardado) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [recetas, setRecetas] = useState(cargarRecetas);
  const [nombre, setNombre] = useState("");
  const [preparacion, setPreparacion] = useState("");
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [idPorEliminar, setIdPorEliminar] = useState(null);

  const nombreRef = useRef(null);
  const preparacionRef = useRef(null);

  // Guarda las recetas cada vez que cambian
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(recetas));
    } catch {
      /* si el almacenamiento falla, la app sigue funcionando en memoria */
    }
  }, [recetas]);

  // El mensaje de confirmación desaparece solo
  useEffect(() => {
    if (!mensaje) return;
    const temporizador = setTimeout(() => setMensaje(""), 4000);
    return () => clearTimeout(temporizador);
  }, [mensaje]);

  function validar() {
    const nuevos = {};
    if (!nombre.trim()) {
      nuevos.nombre = "Escribe el nombre de la receta.";
    }
    if (!preparacion.trim()) {
      nuevos.preparacion = "Escribe los ingredientes y los pasos.";
    }
    return nuevos;
  }

  function guardarReceta(evento) {
    evento.preventDefault();
    const nuevos = validar();
    setErrores(nuevos);

    if (nuevos.nombre) {
      nombreRef.current?.focus();
      return;
    }
    if (nuevos.preparacion) {
      preparacionRef.current?.focus();
      return;
    }

    const receta = {
      id: Date.now(),
      nombre: nombre.trim(),
      preparacion: preparacion.trim(),
    };
    setRecetas((actuales) => [receta, ...actuales]);
    setNombre("");
    setPreparacion("");
    setMensaje(`Receta guardada: ${receta.nombre}`);
    nombreRef.current?.focus();
  }

  function eliminarReceta(id) {
    setRecetas((actuales) => actuales.filter((r) => r.id !== id));
    setIdPorEliminar(null);
    setMensaje("Receta eliminada");
  }

  function alEscribir(campo, valor) {
    if (campo === "nombre") setNombre(valor);
    else setPreparacion(valor);
    // Quita el error en cuanto la persona empieza a corregirlo
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: undefined }));
  }

  return (
    <div className="app">
      <header className="cabecera">
        <h1>Mi recetario</h1>
        <p>Guarda tus recetas y consúltalas cuando cocines.</p>
      </header>

      <main className="contenido">
        <section className="panel-formulario" aria-labelledby="titulo-formulario">
          <h2 id="titulo-formulario">Nueva receta</h2>

          <form onSubmit={guardarReceta} noValidate>
            <div className="campo">
              <label htmlFor="nombre">Nombre de la receta</label>
              <input
                id="nombre"
                ref={nombreRef}
                type="text"
                value={nombre}
                maxLength={80}
                placeholder="Ejemplo: Pozole rojo"
                autoComplete="off"
                onChange={(e) => alEscribir("nombre", e.target.value)}
                aria-invalid={errores.nombre ? "true" : "false"}
                aria-describedby={errores.nombre ? "error-nombre" : undefined}
              />
              {errores.nombre && (
                <p id="error-nombre" className="error">
                  {errores.nombre}
                </p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="preparacion">Ingredientes y preparación</label>
              <p id="ayuda-preparacion" className="ayuda">
                Usa una línea por ingrediente o por paso.
              </p>
              <textarea
                id="preparacion"
                ref={preparacionRef}
                rows={8}
                value={preparacion}
                onChange={(e) => alEscribir("preparacion", e.target.value)}
                aria-invalid={errores.preparacion ? "true" : "false"}
                aria-describedby={
                  errores.preparacion
                    ? "ayuda-preparacion error-preparacion"
                    : "ayuda-preparacion"
                }
              />
              {errores.preparacion && (
                <p id="error-preparacion" className="error">
                  {errores.preparacion}
                </p>
              )}
            </div>

            <button type="submit" className="boton boton-primario">
              Guardar receta
            </button>
          </form>

          {/* Anuncia los cambios a lectores de pantalla y los muestra a todos */}
          <p className="mensaje" role="status" aria-live="polite">
            {mensaje}
          </p>
        </section>

        <section className="panel-lista" aria-labelledby="titulo-lista">
          <h2 id="titulo-lista">
            Mis recetas <span className="contador">({recetas.length})</span>
          </h2>

          {recetas.length === 0 ? (
            <p className="vacio">
              Aún no tienes recetas guardadas. Completa el formulario para
              agregar la primera.
            </p>
          ) : (
            <ul className="lista">
              {recetas.map((receta) => (
                <li key={receta.id} className="receta">
                  <details>
                    <summary>{receta.nombre}</summary>
                    <div className="receta-detalle">
                      <p className="receta-texto">{receta.preparacion}</p>

                      {idPorEliminar === receta.id ? (
                        <div className="confirmacion" role="group" aria-label="Confirmar eliminación">
                          <span>¿Eliminar esta receta?</span>
                          <button
                            type="button"
                            className="boton boton-peligro"
                            onClick={() => eliminarReceta(receta.id)}
                          >
                            Eliminar
                          </button>
                          <button
                            type="button"
                            className="boton boton-secundario"
                            onClick={() => setIdPorEliminar(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="boton boton-secundario"
                          onClick={() => setIdPorEliminar(receta.id)}
                        >
                          Eliminar receta
                        </button>
                      )}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}