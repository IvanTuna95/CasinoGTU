// ==========================================
// LÓGICA DE LA INTERFAZ (POP-UP)
// ==========================================

// Función para mostrar el pop-up del juego sobre la página
function abrirBlackjack() {
    document.getElementById('popup-blackjack').style.display = 'flex';
    
    // De una vez le decimos que prepare las cartas al abrir la mesa
    console.log("¡Mesa abierta! Preparando la baraja...");
    crearBaraja();
}

// Función para ocultar el pop-up y regresar al menú
function cerrarBlackjack() {
    document.getElementById('popup-blackjack').style.display = 'none';
}


// ==========================================
// LÓGICA DEL JUEGO DE CARTAS (FASE 1)
// ==========================================

let baraja = [];
const palos = ['C', 'D', 'T', 'P']; // Corazones, Diamantes, Tréboles, Picas
const valores = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Función para construir la baraja de 52 cartas
function crearBaraja() {
    baraja = []; // Vaciamos la baraja por si acaso
    
    // Este ciclo junta cada número con cada palo (ej. 2 + C = 2C)
    for (let palo of palos) {
        for (let valor of valores) {
            baraja.push(valor + palo); 
        }
    }
    
    // Imprimimos la baraja en la consola para comprobar que se hizo bien
    console.log("Baraja generada:", baraja);
    return baraja;
}