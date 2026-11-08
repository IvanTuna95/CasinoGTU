// ==========================================
// 1. VARIABLES GLOBALES Y ESTADO DEL JUEGO
// ==========================================
let baraja = [];
const palos = ['C', 'D', 'T', 'P']; // Corazones, Diamantes, Tréboles, Picas
const valores = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let banco = 100;
let apuestaActual = 0;
const LIMITE_APUESTA = 100;

let manoJugador = [];
let manoDealer = [];

// ==========================================
// 2. LÓGICA DE LA INTERFAZ Y APUESTAS
// ==========================================

function abrirBlackjack() {
    document.getElementById('popup-blackjack').style.display = 'flex';
    actualizarPantallaDinero();
}

function cerrarBlackjack() {
    document.getElementById('popup-blackjack').style.display = 'none';
}

function actualizarPantallaDinero() {
    document.getElementById('banco-jugador').innerText = `$${banco}`;
    document.getElementById('ficha-apuesta-actual').innerText = apuestaActual;
    document.getElementById('ficha-apuesta-activa').innerText = apuestaActual;
}
function sumarApuesta(monto) {
    if (apuestaActual + monto > LIMITE_APUESTA) {
        mostrarAdvertencia("¡El límite máximo de apuesta por mano es de 100 monedas!");
        return;
    }
    if (apuestaActual + monto > banco) {
        mostrarAdvertencia("¡No tienes fondos suficientes para esa apuesta!");
        return;
    }
    apuestaActual += monto;
    actualizarPantallaDinero();
}

function empezarMano() {
    if (apuestaActual === 0) {
        mostrarAdvertencia("¡Agrega un monto para tu apuesta antes de empezar!");
        return;
    }
    banco -= apuestaActual;
    actualizarPantallaDinero();
    
    document.getElementById('zona-apuestas').style.display = 'none';
    document.getElementById('zona-acciones').style.display = 'flex';
    
    repartirCartasIniciales();
}


function limpiarApuesta() {
    apuestaActual = 0;
    actualizarPantallaDinero();
}



// ==========================================
// 3. LÓGICA DE LAS CARTAS (EL CEREBRO)
// ==========================================

function crearYMezclarBaraja() {
    baraja = []; 
    for (let palo of palos) {
        for (let valor of valores) {
            baraja.push(valor + palo); 
        }
    }
    // Mezclar (Fisher-Yates)
    for (let i = baraja.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [baraja[i], baraja[j]] = [baraja[j], baraja[i]];
    }
}

function calcularPuntaje(mano) {
    let puntaje = 0;
    let ases = 0;
    for (let carta of mano) {
        let valor = carta.substring(0, carta.length - 1);
        if (valor === 'J' || valor === 'Q' || valor === 'K') {
            puntaje += 10;
        } else if (valor === 'A') {
            puntaje += 11;
            ases += 1;
        } else {
            puntaje += parseInt(valor);
        }
    }
    // Ajustar los Ases si nos pasamos de 21
    while (puntaje > 21 && ases > 0) {
        puntaje -= 10;
        ases -= 1;
    }
    return puntaje;
}

function renderizarCarta(carta, oculta = false) {
    let div = document.createElement('div');
    div.classList.add('carta-demo');

    if (oculta) {
        div.classList.add('carta-dorso');
        div.id = "carta-oculta"; // Para voltearla después
        return div;
    }

    let valor = carta.substring(0, carta.length - 1);
    let palo = carta.substring(carta.length - 1);
    let simbolo = '';
    
    if (palo === 'C') { simbolo = '♥'; div.classList.add('carta-roja'); }
    if (palo === 'D') { simbolo = '♦'; div.classList.add('carta-roja'); }
    if (palo === 'T') { simbolo = '♣'; }
    if (palo === 'P') { simbolo = '♠'; }

    div.innerHTML = `${valor} ${simbolo}`;
    return div;
}

function repartirCartasIniciales() {
    crearYMezclarBaraja();
    manoJugador = [];
    manoDealer = [];
    
    document.getElementById('player-cartas').innerHTML = '';
    document.getElementById('dealer-cartas').innerHTML = '';

    // Repartir 2 cartas a cada quien
    manoJugador.push(baraja.pop(), baraja.pop());
    manoDealer.push(baraja.pop(), baraja.pop()); // La primera del dealer irá oculta

    // Dibujar Jugador
    manoJugador.forEach(c => document.getElementById('player-cartas').appendChild(renderizarCarta(c)));
    document.getElementById('player-score').innerText = calcularPuntaje(manoJugador);
    document.getElementById('player-score-container').style.display = 'block';

    // Dibujar Dealer (Primera oculta, segunda visible)
    document.getElementById('dealer-cartas').appendChild(renderizarCarta(manoDealer[0], true));
    document.getElementById('dealer-cartas').appendChild(renderizarCarta(manoDealer[1]));
    document.getElementById('dealer-score').innerText = calcularPuntaje([manoDealer[1]]); // Solo suma la visible
    document.getElementById('dealer-score-container').style.display = 'block';
    
    // Si el jugador saca 21 de inicio (Blackjack natural)
    if (calcularPuntaje(manoJugador) === 21) {
        setTimeout(() => terminarTurno(true), 1000);
    }
}

// ==========================================
// 4. ACCIONES DEL JUEGO (HIT / STAND)
// ==========================================

function pedirCarta() {
    let nuevaCarta = baraja.pop();
    manoJugador.push(nuevaCarta);
    document.getElementById('player-cartas').appendChild(renderizarCarta(nuevaCarta));
    
    let puntosJugador = calcularPuntaje(manoJugador);
    document.getElementById('player-score').innerText = puntosJugador;

    if (puntosJugador > 21) {
        setTimeout(() => resolverJuego("te_pasaste"), 500);
    }
}

function plantarse() {
    terminarTurno(false);
}

function terminarTurno(esBlackjackNatural) {
    // Voltear la carta oculta del dealer
    let zonaDealer = document.getElementById('dealer-cartas');
    zonaDealer.removeChild(document.getElementById('carta-oculta'));
    zonaDealer.insertBefore(renderizarCarta(manoDealer[0]), zonaDealer.firstChild);
    
    let puntosDealer = calcularPuntaje(manoDealer);
    document.getElementById('dealer-score').innerText = puntosDealer;

    if (esBlackjackNatural) {
        resolverJuego("blackjack_natural");
        return;
    }

    // El dealer pide cartas si tiene menos de 17 (Regla oficial de casino)
    let robarCartasDealer = setInterval(() => {
        puntosDealer = calcularPuntaje(manoDealer);
        if (puntosDealer < 17) {
            let cartaExtra = baraja.pop();
            manoDealer.push(cartaExtra);
            zonaDealer.appendChild(renderizarCarta(cartaExtra));
            document.getElementById('dealer-score').innerText = calcularPuntaje(manoDealer);
        } else {
            clearInterval(robarCartasDealer);
            resolverGanador();
        }
    }, 800); // Pausa dramática de 0.8s entre cartas
}

function resolverGanador() {
    let puntosJugador = calcularPuntaje(manoJugador);
    let puntosDealer = calcularPuntaje(manoDealer);

    if (puntosDealer > 21) {
        resolverJuego("dealer_se_pasa");
    } else if (puntosJugador > puntosDealer) {
        resolverJuego("jugador_gana");
    } else if (puntosDealer > puntosJugador) {
        resolverJuego("dealer_gana");
    } else {
        resolverJuego("empate");
    }
}
function resolverJuego(resultado) {
    let mensaje = "";

    switch(resultado) {
        case "te_pasaste":
            mensaje = "¡Te pasaste de 21!\nGana la casa.";
            break;
        case "dealer_se_pasa":
            mensaje = "¡El dealer se pasó!\nTú ganas.";
            banco += apuestaActual * 2;
            break;
        case "jugador_gana":
            mensaje = "¡Le ganaste a la casa!";
            banco += apuestaActual * 2;
            break;
        case "dealer_gana":
            mensaje = "La casa gana.\nSuerte para la próxima.";
            break;
        case "empate":
            mensaje = "Empate.\nRecuperas tu apuesta.";
            banco += apuestaActual;
            break;
        case "blackjack_natural":
            mensaje = "¡BLACKJACK!\nGanas 2.5 veces tu apuesta.";
            banco += Math.floor(apuestaActual * 2.5); // El BJ paga 3 a 2
            break;
    }

    // En lugar de alert(), mostramos nuestro modal dorado
    document.getElementById('mensaje-resultado').innerText = mensaje;
    document.getElementById('modal-resultado').style.display = 'flex';
}

// Nueva función que limpia la mesa AL DARLE CLIC al botón "Aceptar"
function cerrarModalResultado() {
    // Ocultar el modal
    document.getElementById('modal-resultado').style.display = 'none';

    // Resetear dinero y botones para la siguiente ronda
    apuestaActual = 0;
    actualizarPantallaDinero();
    document.getElementById('zona-acciones').style.display = 'none';
    document.getElementById('zona-apuestas').style.display = 'flex';
    
    // Ocultar los marcadores de puntos
    document.getElementById('player-score-container').style.display = 'none';
    document.getElementById('dealer-score-container').style.display = 'none';

    // Limpiar las cartas de la mesa visualmente
    document.getElementById('player-cartas').innerHTML = '';
    document.getElementById('dealer-cartas').innerHTML = '';
}
// ==========================================
// 5. MODAL DE ADVERTENCIAS Y ERRORES
// ==========================================

function mostrarAdvertencia(mensaje) {
    // Busca las "¡" y "!" y las envuelve en un span con la clase roja
    let mensajeFormateado = mensaje
        .replace(/¡/g, '<span class="exclamacion-roja">¡</span>')
        .replace(/!/g, '<span class="exclamacion-roja">!</span>');
    
    document.getElementById('mensaje-advertencia').innerHTML = mensajeFormateado;
    document.getElementById('modal-advertencia').style.display = 'flex';
}

function cerrarAdvertencia() {
    document.getElementById('modal-advertencia').style.display = 'none';
}