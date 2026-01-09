import { useEffect, useState } from "react";
import "./Juego.css";
import cartaReverso from "./assets/carta-reverso.png";

interface Carta {
    valor: string;
    palo: string;
    color: string;
    ruta: string;
}

interface JuegoProps {
    jugadores: string[];
    onVolverInicio: () => void;
}

export default function Juego({ jugadores, onVolverInicio }: JuegoProps) {
    const [contador, setContador] = useState(3);
    const [empezado, setEmpezado] = useState(false);
    const [ronda, setRonda] = useState(1);
    const [turnoActual, setTurnoActual] = useState(0);
    const [mensaje, setMensaje] = useState("¿Están listos?");
    const [mostrarMensaje, setMostrarMensaje] = useState<string | null>(null);
    const [finJuego, setFinJuego] = useState(false);
    const [mazo, setMazo] = useState<Carta[]>([]);
    const [cartasJugadores, setCartasJugadores] = useState<Carta[][]>(
        () => jugadores.map(() => [])
    );
    const [cartaActual, setCartaActual] = useState<Carta | null>(null);
    const [girando, setGirando] = useState(false);
    const [moviendo, setMoviendo] = useState<"izquierda" | "derecha" | null>(null);
    const [mostrandoNuevaCarta, setMostrandoNuevaCarta] = useState(false);
    const [cartaNueva, setCartaNueva] = useState<Carta | null>(null);

    // Crear y barajar mazo una sola vez
    useEffect(() => {
        const palos = [
            { nombre: "Corazones", color: "Rojo" },
            { nombre: "Diamantes", color: "Rojo" },
            { nombre: "Picas", color: "Negro" },
            { nombre: "Trebol", color: "Negro" },
        ];
        const valores = [
            "As", "2", "3", "4", "5", "6", "7", "8",
            "9", "10", "Jack", "Reyna", "Rey",
        ];

        const nuevoMazo: Carta[] = [];
        palos.forEach((p) =>
            valores.forEach((v) =>
                nuevoMazo.push({
                    valor: v,
                    palo: p.nombre,
                    color: p.color,
                    ruta: `/src/assets/cartas/${p.nombre}/${v} de ${p.nombre}.png`,
                })
            )
        );

        // Mezclar el mazo (Fisher-Yates)
        for (let i = nuevoMazo.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nuevoMazo[i], nuevoMazo[j]] = [nuevoMazo[j], nuevoMazo[i]];
        }

        setMazo(nuevoMazo);
    }, []);

    // Contador inicial
    useEffect(() => {
        if (contador > 0) {
            const timer = setTimeout(() => setContador(contador - 1), 1000);
            return () => clearTimeout(timer);
        } else if (contador === 0 && !empezado) {
            setMensaje("¡START!");
            setTimeout(() => setEmpezado(true), 1000);
        }
    }, [contador]);

    // ✅ Sacar carta del mazo (sin repeticiones y síncrono)
    const sacarCarta = (): Carta | null => {
        if (mazo.length === 0) return null;

        const cartaSeleccionada = mazo[0]; // Toma la primera carta (ya barajado)
        const nuevoMazo = mazo.slice(1);   // Resto del mazo
        setMazo(nuevoMazo);                // Actualiza el mazo
        return cartaSeleccionada;
    };

    // ---------- RONDA 1 ----------
    const manejarEleccionRonda1 = (color: string) => {
        const cartaSacada = sacarCarta();
        if (!cartaSacada) return;

        setGirando(true);
        setTimeout(() => {
            setCartaActual(cartaSacada);
            setGirando(false);
            const acierto = cartaSacada.color === color;
            setMostrarMensaje(acierto ? "¿QUIÉN TOMA?" : "¡TOMAS PUÑETAS!");

            setCartasJugadores((prev) => {
                const nuevo = [...prev];
                nuevo[turnoActual] = [...(nuevo[turnoActual] || []), cartaSacada];
                return nuevo;
            });

            setTimeout(() => {
                setMostrarMensaje(null);
                setCartaActual(null);
                siguienteTurno();
            }, 2000);
        }, 1000);
    };

    // ---------- RONDA 2 ----------
    const manejarEleccionRonda2 = (eleccion: "Mayor" | "Menor") => {
        const nueva = sacarCarta();
        if (!nueva) return;
        setCartaNueva(nueva);
        setMostrandoNuevaCarta(true);
        setMoviendo(eleccion === "Mayor" ? "derecha" : "izquierda");
        setTimeout(() => setGirando(true), 800);

        setTimeout(() => {
            setGirando(false);
            const cartasPrevias = cartasJugadores[turnoActual];
            const primeraCarta = cartasPrevias[0];
            const valores = ["As", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Reyna", "Rey"];
            const valor1 = valores.indexOf(primeraCarta.valor);
            const valor2 = valores.indexOf(nueva.valor);

            const acierto =
                (eleccion === "Mayor" && valor2 > valor1) ||
                (eleccion === "Menor" && valor2 < valor1);

            setMostrarMensaje(acierto ? "¿QUIÉN TOMA?" : "¡TOMAS PUÑETAS!");

            setCartasJugadores((prev) => {
                const nuevo = [...prev];
                nuevo[turnoActual] = [...(nuevo[turnoActual] || []), nueva];
                return nuevo;
            });

            setTimeout(() => {
                setMostrarMensaje(null);
                setCartaNueva(null);
                setMostrandoNuevaCarta(false);
                setMoviendo(null);
                siguienteTurno();
            }, 2000);
        }, 2000);
    };

    // ---------- RONDA 3 ----------
    const manejarEleccionRonda3 = (eleccion: "Adentro" | "Afuera") => {
        const nueva = sacarCarta();
        if (!nueva) return;
        setCartaNueva(nueva);
        setMostrandoNuevaCarta(true);
        setMoviendo(eleccion === "Adentro" ? null : "derecha");
        setTimeout(() => setGirando(true), 800);

        setTimeout(() => {
            setGirando(false);
            const cartasPrevias = cartasJugadores[turnoActual];
            const [c1, c2] = cartasPrevias;
            const valores = ["As", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Reyna", "Rey"];
            const v1 = valores.indexOf(c1.valor);
            const v2 = valores.indexOf(c2.valor);
            const vMin = Math.min(v1, v2);
            const vMax = Math.max(v1, v2);
            const v3 = valores.indexOf(nueva.valor);

            const acierto =
                (eleccion === "Adentro" && v3 > vMin && v3 < vMax) ||
                (eleccion === "Afuera" && (v3 < vMin || v3 > vMax));

            setMostrarMensaje(acierto ? "¿QUIÉN TOMA?" : "¡TOMAS PUÑETAS!");

            setCartasJugadores((prev) => {
                const nuevo = [...prev];
                nuevo[turnoActual] = [...(nuevo[turnoActual] || []), nueva];
                return nuevo;
            });

            setTimeout(() => {
                setMostrarMensaje(null);
                setCartaNueva(null);
                setMostrandoNuevaCarta(false);
                siguienteTurno();
            }, 2000);
        }, 2000);
    };

    // ---------- RONDA 4 ----------
    const manejarEleccionRonda4 = (paloElegido: string) => {
        const nueva = sacarCarta();
        if (!nueva) return;
        setCartaNueva(nueva);
        setMostrandoNuevaCarta(true);
        setGirando(true);

        setTimeout(() => {
            setGirando(false);
            const acierto = nueva.palo === paloElegido;
            setMostrarMensaje(acierto ? "¿QUIÉN TOMA?" : "¡TOMAS PUÑETAS!");

            setCartasJugadores((prev) => {
                const nuevo = [...prev];
                nuevo[turnoActual] = [...(nuevo[turnoActual] || []), nueva];
                return nuevo;
            });

            setTimeout(() => {
                setMostrarMensaje(null);
                setCartaNueva(null);
                setMostrandoNuevaCarta(false);
                siguienteTurno();
            }, 2000);
        }, 1500);
    };

    // ---------- AVANZAR TURNO ----------
    const siguienteTurno = () => {
        if (turnoActual < jugadores.length - 1) {
            setTurnoActual(turnoActual + 1);
        } else {
            if (ronda < 4) {
                setRonda(ronda + 1);
                setTurnoActual(0);
            } else {
                setFinJuego(true);
            }
        }
    };

    // ---------- UI ----------
    if (!empezado)
        return (
            <div className="juego-container">
                <h1 className="contador-texto">{mensaje}</h1>
                {contador > 0 && <h2 className="contador-num">{contador}</h2>}
            </div>
        );

    if (finJuego)
        return (
            <div className="juego-container">
                <h1 className="contador-texto">🎉 ¡Fin del juego! 🎉</h1>
                <p>Todos los jugadores completaron las rondas.</p>
                <button className="btn-negro" onClick={onVolverInicio}>
                    Volver al menú
                </button>
            </div>
        );

    const cartasJugador = cartasJugadores[turnoActual];

    return (
        <div className="juego-container">
            <h2 className="ronda-text">Ronda: {ronda}</h2>
            <h3 className="turno-text">
                Turno de: <span className="turno-nombre">{jugadores[turnoActual]}</span>
            </h3>

            {/* --- CARTAS --- */}
            <div className="carta-container">
                {ronda === 4 ? (
                    <div className="carta-container ronda4">
                        {cartasJugador.slice(0, 3).map((carta, i) => (
                            <div key={i} className={`carta fija-centro pos-${i}`}>
                                <img src={carta.ruta} alt={`Carta ${i + 1}`} />
                            </div>
                        ))}
                        {mostrandoNuevaCarta && (
                            <div className={`carta nueva-carta top ${girando ? "girada" : ""}`}>
                                <div className="cara frente">
                                    <img
                                        src={cartaNueva ? cartaNueva.ruta : cartaReverso}
                                        alt="Carta frente"
                                    />
                                </div>
                                <div className="cara reverso">
                                    <img src={cartaReverso} alt="Carta reverso" />
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}

                {/* --- Rondas 1, 2 y 3 --- */}
                {ronda === 1 && (
                    <div className={`carta ${girando ? "girada" : ""}`}>
                        <div className="cara frente">
                            <img
                                src={cartaActual ? cartaActual.ruta : cartaReverso}
                                alt="Carta frente"
                            />
                        </div>
                        <div className="cara reverso">
                            <img src={cartaReverso} alt="Carta reverso" />
                        </div>
                    </div>
                )}

                {ronda === 2 && (
                    <>
                        {cartasJugador[0] && (
                            <div className="carta fija-centro">
                                <img src={cartasJugador[0].ruta} alt="Carta 1" />
                            </div>
                        )}
                        {mostrandoNuevaCarta && (
                            <div
                                className={`carta nueva-carta ${moviendo ? `mover-${moviendo}` : ""} ${girando ? "girada" : ""}`}
                            >
                                <div className="cara frente">
                                    <img
                                        src={cartaNueva ? cartaNueva.ruta : cartaReverso}
                                        alt="Carta frente"
                                    />
                                </div>
                                <div className="cara reverso">
                                    <img src={cartaReverso} alt="Carta reverso" />
                                </div>
                            </div>
                        )}
                    </>
                )}

                {ronda === 3 && (
                    <div className="carta-container ronda3">
                        {cartasJugador[0] && (
                            <div className="carta fija-centro izquierda">
                                <img src={cartasJugador[0].ruta} alt="Carta 1" />
                            </div>
                        )}
                        {cartasJugador[1] && (
                            <div className="carta fija-centro derecha">
                                <img src={cartasJugador[1].ruta} alt="Carta 2" />
                            </div>
                        )}
                        {mostrandoNuevaCarta && (
                            <div
                                className={`carta nueva-carta ${girando ? "girada" : ""} ${moviendo === "derecha" ? "afuera" : "adentro"}`}
                            >
                                <div className="cara frente">
                                    <img
                                        src={cartaNueva ? cartaNueva.ruta : cartaReverso}
                                        alt="Carta frente"
                                    />
                                </div>
                                <div className="cara reverso">
                                    <img src={cartaReverso} alt="Carta reverso" />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- BOTONES --- */}
            <div className="botones-container">
                {ronda === 1 && (
                    <>
                        <button className="btn-rojo" onClick={() => manejarEleccionRonda1("Rojo")}>
                            🔴 Rojo
                        </button>
                        <button className="btn-negro" onClick={() => manejarEleccionRonda1("Negro")}>
                            ⚫ Negro
                        </button>
                    </>
                )}

                {ronda === 2 && (
                    <>
                        <button className="btn-negro" onClick={() => manejarEleccionRonda2("Menor")}>
                            🔽 Menor
                        </button>
                        <button className="btn-rojo" onClick={() => manejarEleccionRonda2("Mayor")}>
                            🔼 Mayor
                        </button>
                    </>
                )}

                {ronda === 3 && (
                    <>
                        <button className="btn-rojo" onClick={() => manejarEleccionRonda3("Adentro")}>
                            🔻 Adentro
                        </button>
                        <button className="btn-negro" onClick={() => manejarEleccionRonda3("Afuera")}>
                            🔺 Afuera
                        </button>
                    </>
                )}

                {ronda === 4 && (
                    <div className="palos-grid">
                        <button className="btn-palo rojo" onClick={() => manejarEleccionRonda4("Corazones")}>
                            ❤️ Corazones
                        </button>
                        <button className="btn-palo rojo" onClick={() => manejarEleccionRonda4("Diamantes")}>
                            ♦️ Diamantes
                        </button>
                        <button className="btn-palo negro" onClick={() => manejarEleccionRonda4("Picas")}>
                            ♠️ Picas
                        </button>
                        <button className="btn-palo negro" onClick={() => manejarEleccionRonda4("Trebol")}>
                            ♣️ Tréboles
                        </button>
                    </div>
                )}
            </div>

            {mostrarMensaje && (
                <div
                    className={`mensaje-overlay ${mostrarMensaje.includes("PUÑETAS") ? "mensaje-rojo" : "mensaje-verde"
                        }`}
                >
                    {mostrarMensaje}
                </div>
            )}
        </div>
    );
}
