
const MEDIA_BASE = 15;
const ALTURA = 25;

const VERTEX_HEIGHT = 50;
const VERTEX_WIDTH = 50;

const CURVE_WIDTH = 10;
const CURVE_HEIGHT = 10;


let vertices = [];
let arcos = [];


function dibujarArcos() {
	let lineas = document.querySelectorAll('.linea');
	lineas.forEach((linea) => {
		linea.remove();
	});
	let grafo = document.getElementById('grafo');

	readTextareas();

	arcos.forEach((arco) => {
		let elementos = arco.split(",");
		let inicio = elementos[0];
		let final = elementos[1];
		final = final.split(")").join("");

		let nombreInicio = vertices.find((vertice) => vertice.nombre === inicio).nombre;
		let nombreFinal = vertices.find((vertice) => vertice.nombre === final).nombre;

		let divInicio = document.getElementById(nombreInicio);
		let divFinal = document.getElementById(nombreFinal);

		render(divInicio, divFinal);
	});

}

















// WARNING: YA TERMINE ESTO DE ABAJO, NO TOCAR, YA PUEDE RENDERIZAR LA FLECHA EN LOS 4 CUADRANTES, Y ESCOGER EL PUNTO MÁS CERCANO

// ESTO DE ACA ES PARA GENERAR LOS VERTICES ALEATORIAMENTE
function getRandomPos() {
	let grafoEl = document.getElementById('grafo');
	let grafo = grafoEl.getBoundingClientRect();

	let x = Math.random() * (grafo.right - grafo.left - VERTEX_WIDTH) + grafo.left;
	let y = Math.random() * (grafo.bottom - grafo.top - VERTEX_HEIGHT) + grafo.top;

	return {
		x: x,
		y: y
	}
}
// ESTO DE ACA LEE LOS TEXTAREAS
function readTextareas() {
	let verticesString = document.getElementById('vertices').value;
	let arcosString = document.getElementById('arcos').value;

	arcosString = arcosString.replace(/\s/g, "");
	verticesString = verticesString.replace(/\s/g, "");

	arcosString = arcosString.split('(').join('')

	nombresVertices = verticesString.split(",");
	nombresVertices.forEach((nombre) => {
		if (nombre == "") return;
		vertices.push({
			nombre: nombre,
			x: getRandomPos().x,
			y: getRandomPos().y
		});
	});

	arcos = arcosString.split("),");
}

// ESTO DE ACA CAMBIA LOS VERTICES SEGUN CAMBIE LO QUE ESTA EN EL TEXTAREA
function actualizarVertices() {
	let grafo = document.getElementById('grafo');
	grafo.innerHTML = "";
	
	vertices = [];
	readTextareas();

	vertices.forEach((vertice) => {
		if (vertice == "") return;
		let div = document.createElement('div');
		div.className = 'bloque';
		div.id = vertice.nombre;
		div.position = 'absolute';
		div.height = VERTEX_HEIGHT;
		div.width = VERTEX_WIDTH;
		div.style.left = getRandomPos().x + "px";
		div.style.top = getRandomPos().y + "px";
		let text = document.createElement('p');

		text.innerHTML = vertice.nombre;

		div.appendChild(text);
		grafo.appendChild(div);
	});

	actualizarMovimiento();
}

// ESTO DE ACA ES PARA CALCULAR QUÉ PUNTOS SE VAN A UNIR
function calcularPuntos(div) {
	div = div.getBoundingClientRect();
	let puntos = {};
	puntos['arriba'] = {
		x: div.right - div.width / 2, 
		y: div.top 
	}
	puntos['abajo'] = {
		x: div.right - div.width / 2,
		y: div.bottom
	}
	puntos['izquierda'] = {
		x: div.left,
		y: div.top + div.height / 2
	}
	puntos['derecha'] = {
		x: div.right,
		y: div.top + div.height / 2
	}
	return puntos;
}

function calcularDistanciaMasCorta(inicio, final) {
	let puntosInicio = calcularPuntos(inicio);
	let puntosFinal = calcularPuntos(final);
	let distanciaFinal = 50000000;

	for (let puntoInicio in puntosInicio) {
		for (let puntoFinal in puntosFinal) {
			let distancia = calcularDistancia(puntosInicio[puntoInicio], puntosFinal[puntoFinal]);
			if (distancia < distanciaFinal) {
				distanciaFinal = distancia;
				inicio = puntosInicio[puntoInicio];
				final = puntosFinal[puntoFinal];
			}
		}
	}
	return {inicio: inicio, final: final};
}

function calcularDistancia(punto1, punto2) {
	let distancia = Math.sqrt(Math.pow(punto1.x - punto2.x, 2) + Math.pow(punto1.y - punto2.y, 2));
	return distancia;
}
// HASTA ACÁ EL CÁLCULO DE LA DISTANCIA MÁS CORTA



// ESTO ES PARA DIBUJAR LA LÍNEA
function render(divInicio, divFinal) {

    const grafo = document.getElementById('grafo');

	let puntos = calcularDistanciaMasCorta(divInicio, divFinal);
    let inicio = puntos.inicio;
    let final = puntos.final;

	// let puntosControl = getControlPoints(inicio, final);
    grafo.innerHTML +=
    `
    <svg width="100%" height="100%" class="linea">
        <path d="M ${inicio.x} ${inicio.y} L ${final.x} ${final.y}
		Z" stroke="white" stroke-width="2" />
    </svg>
    `

    puntaFlecha(inicio, final);
}



// ESTO ES PARA DIBUJAR LA PUNTA DE LA FLECHA
function puntaFlecha(inicio, punta){
    const grafo = document.getElementById('grafo');

    const slope = (inicio.y - punta.y) / (punta.x - inicio.x);
    // pendiente del segmento

    let alfa = Math.atan(slope);
    // angulo en radianes del segmento

    let deltaX = ALTURA * Math.cos(alfa);
    let deltaY = ALTURA * Math.sin(alfa);

	if (punta.x < inicio.x) {
		deltaX = -deltaX;
		deltaY = -deltaY;
	}

    let centro = {
        x: punta.x - deltaX,
        y: punta.y + deltaY
    }
    // coordenadas del centro de la base de la flecha

    let beta = Math.PI - alfa - Math.PI / 2;
    let deltaXBase = MEDIA_BASE * Math.cos(beta);
    let deltaYBase = MEDIA_BASE * Math.sin(beta);

    let puntaInferiorDerecha = {
        x: centro.x + deltaXBase,
        y: centro.y + deltaYBase
    }


    let c = Math.PI / 2 - alfa;
    let gamma = Math.PI / 2 - c - Math.PI;
    let deltaXBase2 = MEDIA_BASE * Math.sin(gamma);
    let deltaYBase2 = MEDIA_BASE * Math.cos(gamma);

    let puntaInferiorIzquierda = {
        x: centro.x + deltaXBase2,
        y: centro.y + deltaYBase2
    }


    grafo.innerHTML +=
    `
    <svg width="100%" height="100%" class="linea">
        <path d="M ${punta.x} ${punta.y} 
         L ${puntaInferiorDerecha.x} ${puntaInferiorDerecha.y}
         L ${puntaInferiorIzquierda.x} ${puntaInferiorIzquierda.y} Z"
         stroke="white" stroke-width="2" fill="white" />
    </svg>
    `;
}

// WARNING: LO DE ARRIBA YA ESTA TERMINADO, NO TOCAR


// SCRIPT QUE PERMITE MOVER LOS VERTICES
function actualizarMovimiento(){
	var chooseElement;
	let selected = false;
	const bloques = document.querySelectorAll(".bloque");

	bloques.forEach(bloque => {
		bloque.addEventListener("mousedown", function(){
			bloque.style.position = "absolute";
			chooseElement = bloque;
			selected = true;

			document.onmousemove = (e) => {
				if(selected){
					var x = e.pageX;
					var y = e.pageY;

					var bloqueInfo = bloque.getBoundingClientRect();

					chooseElement.style.left = x - bloqueInfo.width/2 + "px";
					chooseElement.style.top = y - bloqueInfo.height/ 2 + "px";
				}
			}
		});
	});
	document.onmouseup = function(e){
		chooseElement = null;
		selected = false;
	}
};
