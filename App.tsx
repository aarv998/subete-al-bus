import { useState } from "react";
import { Play, UserPlus, X } from "lucide-react";
import "./App.css";
import Juego from "./Juego";

export default function SubeteAlBus() {
    const [jugadores, setJugadores] = useState<string[]>([]);
    const [nuevoJugador, setNuevoJugador] = useState("");
    const [juegoIniciado, setJuegoIniciado] = useState(false);

    const agregarJugador = () => {
        const nombre = nuevoJugador.trim();
        if (nombre !== "" && !jugadores.includes(nombre)) {
            setJugadores([...jugadores, nombre]);
            setNuevoJugador("");
        }
    };

    const eliminarJugador = (nombre: string) => {
        setJugadores(jugadores.filter((j) => j !== nombre));
    };

    const iniciarJuego = () => {
        if (jugadores.length >= 2) {
            setJuegoIniciado(true);
        } else {
            alert("Agrega al menos 2 jugadores para comenzar 🎲");
        }
    };

    // 👇 Nuevo: función para volver al menú
    const reiniciarJuego = () => {
        setJugadores([]);
        setNuevoJugador("");
        setJuegoIniciado(false);
    };

    // 👇 Aquí enviamos la prop onVolverInicio al componente del juego
    if (juegoIniciado)
        return <Juego jugadores={jugadores} onVolverInicio={reiniciarJuego} />;

    return (
        <div className="flex flex-col items-center justify-center text-center bg-white/20">
            {/* Logo del juego */}
            <img
                src="https://i.ibb.co/GfcD8hwd/Subete-al-bus.png"
                alt="Súbete al Bus"
                className="logo-img animate-fadeIn"
            />

            {/* Campo para añadir jugadores */}
            <div className="input-group">
                <UserPlus size={20} />
                <input
                    type="text"
                    placeholder="Añadir jugador..."
                    value={nuevoJugador}
                    onChange={(e) => setNuevoJugador(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && agregarJugador()}
                />
                <button className="add-player" onClick={agregarJugador}>
                    +
                </button>
            </div>

            {/* Lista de jugadores */}
            <div className="jugadores-container">
                {jugadores.map((jugador, index) => (
                    <div
                        key={index}
                        className="flex items-center bg-[#ff5b5b] text-white"
                    >
                        <span>{jugador}</span>
                        <button onClick={() => eliminarJugador(jugador)}>
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Botón principal (Play) */}
            <button className="bg-black rounded-full" onClick={iniciarJuego}>
                <Play size={48} />
            </button>

            {/* Texto decorativo */}
            <p className="text-center text-sm text-gray-700">
                🚌🚌🚌 Listo para pistear en el Bus?... 🚌🚌🚌
            </p>
        </div>
    );
}
