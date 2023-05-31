import { deleteMoney, checkRemoveAddClass, noMoney, getRandom, addMoney, getRandom_2 } from './functions.js';
import { writeCurrentBet } from './script.js';
import { startData } from './startData.js';


export const config_game = {
	state: 1, // (1 - готов начать игру, 2 - летим, 3 - проиграли)
	height_field: document.querySelector('.game') ? document.querySelector('.field__body').clientHeight : false,

	current_win: 0,

	current_coeff: 0,
	start_coeff: 0,
	coeff_up: 0.01,

	startX: -15,
	startRotate: 0,

	speed_up: 0.2,
	speed_right: 0.4,

	timerId: false,
	timerCoeff: false,
	timerDraw: false
}

const config_canvas = {
	width: 0,
	height: 0,
	color_line: 0,
	xOffset: 100,
	yOffset: -170
}

const window_height = document.documentElement.clientHeight;
const button = document.querySelector('[data-btn="aviator-start"]');
const betBox = document.querySelector('.game .block-bet');
const autoButtons = document.querySelector('.game .footer-avia__buttons');

if (document.querySelector('.game')) {
	checkBet();
	drawMeasureSvgCircle();

	setCanvas();
}


function checkBet() {
	const bet = +sessionStorage.getItem('current-bet');
	document.querySelectorAll('[data-bet]').forEach(item => {
		if (item.dataset.bet == bet) item.classList.add('_active');
	})
}

function drawMeasureSvgCircle() {
	let svg = document.querySelector('.field__circle circle');
	let svg_m = document.querySelector('.field__circle svg');

	svg.setAttribute('r', config_game.height_field * 4);
	svg.setAttribute('stroke-width', config_game.height_field * 8);

	svg_m.setAttribute('width', config_game.height_field * 8);
	svg_m.setAttribute('height', config_game.height_field * 8);

	document.querySelector('.field__circle').style.left = `-${config_game.height_field * 4}px`;
	document.querySelector('.field__circle').style.bottom = `${config_game.height_field * 3}px`;
	if (window_height >= 600) svg.setAttribute('stroke-dasharray', 300);
}
function addRotateCircleBg() {
	document.querySelector('.field__circle svg').classList.add('_rotate');
}
function removeRotateCircleBg() {
	if (document.querySelector('.field__circle svg').classList.contains('_rotate')) {
		document.querySelector('.field__circle svg').classList.remove('_rotate');
	}
}

export function startGame() {
	config_game.state = 2;
	generateCoeff();

	deleteMoney(+sessionStorage.getItem('current-bet'), '.score');

	addRotateCircleBg();
	generateStartSpeed();
	generateLineColor();
	moovePlayer();
	intervalCoeff();

	// Записываем в кнопку bet слово cash
	writeTextBtnBet();

	button.classList.add('_cash');
	betBox.classList.add('_hold');
	autoButtons.classList.add('_hold');
}

function generateCoeff() {
	let state = getRandom(1, 10);
	if (state > 1 && state <= 3) {
		config_game.current_coeff = getRandom_2(1.1, 2);
	} else if (state > 3 && state <= 7) {
		config_game.current_coeff = getRandom_2(2, 5);
	} else if (state > 7) {
		config_game.current_coeff = getRandom_2(5, 10);
	}
}

function generateStartSpeed() {
	config_game.speed_up = getRandom_2(0.11, 0.25);
	config_game.speed_right = getRandom_2(0.4, 0.7);
}

function generateLineColor() {
	config_canvas.color_line = `${getRandom(0, 255)},${getRandom(0, 255)},${getRandom(0, 255)}`;
}

function moovePlayer() {
	let player = document.querySelector('.field__airplane');

	let bottom = 7;
	let left = config_game.startX;
	let rotate = config_game.startRotate;

	drawCanvas();

	config_game.timerId = setInterval(() => {
		if (left <= 15) {
			bottom += config_game.speed_up;
		} else if (left > 15 && left <= 30) {
			bottom += config_game.speed_up * 1.5;
		} else if (left > 30 && left <= 45) {
			bottom += config_game.speed_up * 2;
		} else if (left > 45) {
			bottom += config_game.speed_up * 4;
		}
		left += config_game.speed_right;

		if (rotate >= -20) {
			rotate -= 0.2;
		}

		player.style.bottom = `${bottom}%`;
		player.style.left = `${left}%`;
		player.style.transform = `rotate(${rotate}deg)`;

		if (left >= 50 || bottom >= 70) {
			clearInterval(config_game.timerId);
			player.style.transition = `all 1s ease 0s`;
			player.style.transform = `rotate(0deg)`;
			document.querySelector('.field__body').classList.add('_fly');
		}
	}, 35);
}

function checkGameOver() {
	if (config_game.start_coeff >= config_game.current_coeff) {
		flyAirplaneWhenLoose();
		config_game.state = 3;
		stopAnimation();
		addLooseColorButtons();
		button.classList.add('_hold');

		setTimeout(() => {
			resetGame();
		}, 2000);
	}
}

function addLooseColorButtons() {
	button.classList.add('_loose');
	if (button.classList.contains('_cash')) button.classList.remove('_cash');
}

function writeTextBtnBet() {
	const btn = document.querySelector('[data-btn="aviator-start"] span');
	if (config_game.state === 2) {
		btn.textContent = 'stop';
	} else btn.textContent = 'Start';
}

function flyAirplaneWhenLoose() {
	let player = document.querySelector('.field__airplane');
	player.style.transition = `all 2s ease 0s`;
	player.style.left = `150%`;
	player.style.bottom = `110%`;
}

//========
//canvas
function setCanvas() {
	let canvas = document.querySelector('.ctx');

	let block = document.querySelector('.field__body');
	config_canvas.width = block.clientWidth;
	config_canvas.height = block.clientHeight;

	canvas.setAttribute('width', `${config_canvas.width}px`);
	canvas.setAttribute('height', `${config_canvas.height}px`);
}

function drawCanvas() {
	let pin = document.querySelector('.field__pin');
	let canvas = document.querySelector('.ctx');
	let ctx = canvas.getContext('2d');

	config_game.timerDraw = setInterval(() => {
		if (config_game.state == 3) {
			setTimeout(() => {
				clearInterval(config_game.timerDraw);
			}, 800);
		}
		let coord_x = pin.getBoundingClientRect().left + config_canvas.xOffset;
		let coord_y = pin.getBoundingClientRect().top + config_canvas.yOffset;

		ctx.clearRect(0, 0, config_canvas.width, config_canvas.height);
		createShapeCanvas(coord_x, coord_y, config_canvas.color_line, 10, 15);
		createLineCanvas(coord_x, coord_y, config_canvas.color_line, 0, '4', 10, 15);
	}, 50);
}

function createShapeCanvas(xTop, yTop, color, rx, ry) {
	let canvas = document.querySelector('.ctx');
	let ctx = canvas.getContext('2d');

	const gradient = ctx.createLinearGradient(xTop, yTop, 0, config_canvas.height);

	gradient.addColorStop(0, `rgba(${color},0.6)`);
	gradient.addColorStop(1, `rgba(${color},0.1)`);

	ctx.fillStyle = gradient;


	ctx.beginPath();

	// устанавливаем первую точку фигуры
	ctx.moveTo(0, config_canvas.height);

	// вторая точка - кривая линия, повторяющая основную линию

	ctx.quadraticCurveTo(xTop - rx, yTop + ry, xTop, yTop);

	// третья точка - динамическая
	ctx.lineTo(xTop, config_canvas.height);

	ctx.closePath();

	ctx.fill();
}

function createLineCanvas(x, y, color, start_position, lineWidth, rx, ry) {
	let canvas = document.querySelector('.ctx');
	let ctx = canvas.getContext('2d');

	ctx.lineWidth = lineWidth;

	let gradient = ctx.createLinearGradient(0, config_canvas.height, x, y);

	gradient.addColorStop(0, `rgba(${color},0.1)`);
	gradient.addColorStop(1, `rgba(${color},1)`);
	ctx.strokeStyle = gradient;

	ctx.beginPath();
	ctx.moveTo(start_position, config_canvas.height);
	ctx.quadraticCurveTo(x - rx, y + ry, x, y);

	ctx.stroke();
}

function clearCanvas() {
	let canvas = document.querySelector('.ctx');
	let ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, config_canvas.width, config_canvas.height);
}

window.addEventListener('resize', () => {
	setCanvas();
})

//======
function intervalCoeff() {
	config_game.timerCoeff = setInterval(() => {
		config_game.start_coeff += config_game.coeff_up;
		drawCurrentCoeff();
		drawCurrentCount();
		checkGameOver();
	}, 20);
}

function drawCurrentCount() {
	let bet = +sessionStorage.getItem('current-bet');
	config_game.current_win = Math.floor(bet * config_game.start_coeff);
}

function drawCurrentCoeff() {
	document.querySelector('.field__coeff').textContent = `${config_game.start_coeff.toFixed(2)}`;
}

export function stopAnimation() {
	clearInterval(config_game.timerId);
	clearInterval(config_game.timerCoeff);
	if (document.querySelector('.field__body').classList.contains('_fly'))
		document.querySelector('.field__body').classList.remove('_fly');
}

function removeGameColorButtons() {
	if (button.classList.contains('_loose'))
		button.classList.remove('_loose');

	if (button.classList.contains('_cash'))
		button.classList.remove('_cash');
}

export function resetGame() {
	let player = document.querySelector('.field__airplane');

	config_game.current_win = 0;
	config_game.start_coeff = 0;
	config_game.state = 1;

	player.style.transition = `none`;
	player.style.left = `${config_game.startX}%`;
	player.style.bottom = `7%`;
	player.style.transform = `rotate(${config_game.startRotate}deg)`;

	document.querySelector('.field__coeff').textContent = '0';

	removeRotateCircleBg();
	removeGameColorButtons();

	clearCanvas();

	document.querySelector('.field__body').classList.add('_loader');

	if (document.querySelector('.field__body') && document.querySelector('.field__body').classList.contains('_fly')) {
		document.querySelector('.field__body').classList.remove('_fly');
	}

	writeTextBtnBet();

	setTimeout(() => {
		resetBet();

		document.querySelector('.field__body').classList.remove('_loader');

		if (button && button.classList.contains('_hold')) {
			button.classList.remove('_hold');
		}
		if (autoButtons && autoButtons.classList.contains('_hold')) {
			autoButtons.classList.remove('_hold');
		}

		if (betBox && betBox.classList.contains('_hold')) {
			betBox.classList.remove('_hold');
		}
		checkRemoveAddClass('.footer-avia__button', '_active', document.querySelector('[data-footer-button="bet"]'));
	}, 5000);
}
function resetBet() {
	sessionStorage.setItem('current-bet', startData.countBet);
	writeCurrentBet();
}

export function autoMode() {
	let bet = getRandomBet();
	setTimeout(() => {
		sessionStorage.setItem('current-bet', bet);
		writeCurrentBet();
	}, 500);
	setTimeout(() => {
		startGame();
	}, 1500);
}

function getRandomBet() {
	let money = +sessionStorage.getItem('money');
	let random_bet = getRandom(5, money);
	if (random_bet % 5 != 0) {
		random_bet = random_bet - random_bet % 5;
	}
	return random_bet;
}