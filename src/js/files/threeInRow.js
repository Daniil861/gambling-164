import { showFinalScreen } from './script.js';

//game
export const configThreeGame = {

	countRows: 8, //количество строк
	countCols: 6, // количество столбиков
	countImages: 6, // указываем сколько картинок будет в массиве imagesCoin 

	offsetBorder: 10, // размер отступа

	gemSize: 53, //размер блока

	movesConst: 30,
	movesCurrent: 30,

	imagesCoin: [
		'img/game/icon-1.png',
		'img/game/icon-2.png',
		'img/game/icon-3.png',
		'img/game/icon-4.png',
		'img/game/icon-5.png',
		'img/game/icon-6.png'
	], // массив с картинками

	gemClass: 'gem', // префикс для классов
	gemClassHeart: 'gem-heart',
	gemClassSnow: 'gem-snow',

	gemIdPrefix: 'gem', // префикс для id
	gameStates: ['pick', 'switch', 'revert', 'remove', 'refill'], // массив состояний игры
	gameState: '', // текущее состояние игры

	movingItems: 0, //количество элементов, которые в данный момент можно двигать

	countScore: 0, // количество набранных очков
	score_1: 0,
	score_2: 0,
	score_3: 0,

	count_move: 0,

	crystall_cord_x: null,
	crystall_cord_y: null,

	timer: false,
	timeConst: 30,
	timeCurrent: 0
}

const fieldMoves = document.querySelector('.footer-game__moves');
const score_1 = document.querySelector('[data-score="1"] .footer-game__score');
const score_2 = document.querySelector('[data-score="2"] .footer-game__score');
const score_3 = document.querySelector('[data-score="3"] .footer-game__score');
// let innerField;


// Здесь хранятся индексы элементов которые выбрали
const player = {
	selectedRow: -1,
	selectedCol: -1,
	posX: '',
	posY: ''
}

// Проверяем размер экрана и в зависимости от этого меняем размер картинки
if (innerHeight <= 710) {
	configThreeGame.gemSize = 45;
}
if (innerHeight > 700 && innerWidth > 700) {
	configThreeGame.gemSize = 70;
}
if (document.querySelector('._game-3') && innerHeight <= 650) {
	configThreeGame.gemSize = 35;
}

//Здесь распологаем все элементы которые будут использованы в игре
const components = {
	container: document.createElement('div'),
	content: document.createElement('div'),
	wrapper: document.createElement('div'),
	cursor: document.createElement('div'),
	score: document.createElement('div'),
	gems: new Array(),
}

// Объявляем слушатель событий touchstart - для управления передвижением кристалла
document.addEventListener('touchstart', handleTouchStart, false);

document.addEventListener('touchend', handleTouchEnd, false);

// Объявляем слушатель событий touchmove - для управления передвижением кристалла
document.addEventListener('touchmove', handleTouchMove, false);

// Start game
if (document.querySelector('.game')) {
	//проверяем сколько ранее куплено бонусов - записываем количество на странице в соответствующие блоки

	initGame();
	document.body.classList.add('_hold');

	configThreeGame.countScore = 0;
}


//Фукнция определяет положение кристалла по которому кликнули в момент первого приконовения к экрану
function handleTouchStart(e) {
	let targetElement = e.target;
	configThreeGame.count_move = 0;
	if (targetElement.closest('.gem')) {
		let row = parseInt(targetElement.getAttribute("id").split("_")[1]);
		let col = parseInt(targetElement.getAttribute("id").split("_")[2]);

		player.selectedRow = row;
		player.selectedCol = col;

		configThreeGame.crystall_cord_x = e.touches[0].clientX;
		configThreeGame.crystall_cord_y = e.touches[0].clientY;
	}
}

function handleTouchEnd() {
	setTimeout(() => {
		player.selectedRow = -1;
		player.selectedCol = -1;
	}, 250); // было 500
}

// Функция перемещает кристалл в зависимости от направления свайпа
function handleTouchMove(e) {

	if (configThreeGame.count_move >= 1) {
		return false;
	}
	if (e.target.closest('.block-game__wrapper')) {
		configThreeGame.count_move++;

		// Записываем постоянно меняющуюся координату кристалла
		let crystall_cord_x2 = e.touches[0].clientX;
		let crystall_cord_y2 = e.touches[0].clientY;

		// Записываем в переменную разность между начальной координатой и той координатой, куда свайпает пользователь (влево или вправо)
		let xDiff = crystall_cord_x2 - configThreeGame.crystall_cord_x;
		let yDiff = crystall_cord_y2 - configThreeGame.crystall_cord_y;

		// определить строку и столбец
		let row = player.selectedRow;
		let col = player.selectedCol;

		// Проверяем в какую сторону мы скроллим больше (вверх или вниз), в зависимости от этого запускаем необходимые условия
		if (Math.abs(xDiff) > Math.abs(yDiff)) {
			if (xDiff > 0) {
				check_collision(col + 1, row);
			} else {
				check_collision(col - 1, row);
			}
		}
		else {
			if (yDiff > 0) {
				check_collision(col, row + 1);
			} else {
				check_collision(col, row - 1);
			}
		}
	}
}

function check_collision(col, row) {

	// После выбора меняем состояние игры
	configThreeGame.gameState = configThreeGame.gameStates[1];

	// сохранить позицию второго выбранного гема
	player.posX = col;
	player.posY = row;

	// поменять их местами
	gemSwitch();

	countMoves();
}

function countMoves() {
	// Уменьшаем количество ходов
	configThreeGame.movesCurrent--;

	// Выводим на экран сколько ходов осталось
	fieldMoves.textContent = `${configThreeGame.movesCurrent} moves`;

	// Проверяем есть ли еще ходы
	checkMoves();
}

function checkMoves() {
	if (configThreeGame.movesCurrent <= 0) {
		let count = (configThreeGame.score_1 + configThreeGame.score_2 + configThreeGame.score_3) * 3;
		showFinalScreen(count);
	}
}

// Инициализация всех составляющих игры
export function initGame() {
	createContentPage();
	createWrapper();
	createGrid();
	// Переключаем статус игры на "выбор"
	configThreeGame.gameState = configThreeGame.gameStates[0];
}

// Создание обертки для поля
function createContentPage() {
	components.content.style.padding = configThreeGame.offsetBorder + "px";
	components.content.style.width = (configThreeGame.gemSize * configThreeGame.countCols) +
		(configThreeGame.offsetBorder * 2) + "px";
	components.content.style.height = (configThreeGame.gemSize * configThreeGame.countRows) +
		(configThreeGame.offsetBorder * 2) + "px";
	document.querySelector('.block-game__field').append(components.content);
}

// Создание поля
function createWrapper() {
	components.wrapper.classList.add('block-game__wrapper');
	components.content.append(components.wrapper);
}

// Добавление очков
function scoreInc(count, num) {

	if (num === 2) {
		configThreeGame.score_1 < 50 ? configThreeGame.score_1 += count : configThreeGame.score_1 = 50;

		if (configThreeGame.score_1 < 50) {
			score_1.textContent = `${configThreeGame.score_1}/50`;
		} else {
			score_1.textContent = `50/50`;
		}

	} else if (num === 5) {
		configThreeGame.score_2 < 50 ? configThreeGame.score_2 += count : configThreeGame.score_2 = 50;

		if (configThreeGame.score_2 < 50) {
			score_2.textContent = `${configThreeGame.score_2}/50`;
		} else {
			score_2.textContent = `50/50`;
		}

	} else if (num === 6) {
		configThreeGame.score_3 < 50 ? configThreeGame.score_3 += count : configThreeGame.score_3 = 50;

		if (configThreeGame.score_3 < 50) {
			score_3.textContent = `${configThreeGame.score_3}/50`;
		} else {
			score_3.textContent = `50/50`;
		}

	}

}

// Создание блока. t - top, l - left, row - номер ряда, col - номер колонки, img - изображение
function createGem(t, l, row, col, img, num) {
	let crystall = document.createElement("div");

	crystall.classList.add(configThreeGame.gemClass);
	crystall.id = `${configThreeGame.gemIdPrefix}_${row}_${col}`;
	crystall.style.top = `${t}px`;
	crystall.style.left = `${l}px`;
	crystall.style.backgroundImage = `url('${img}')`;
	crystall.setAttribute('data-gem', +num + 1);

	components.wrapper.append(crystall);
}

// Создание и наполнение сетки для кристалов
function createGrid() {
	// Создание пустой сетки
	// Первый цикл запускается столько раз - сколько определено рядов
	for (let i = 0; i < configThreeGame.countRows; i++) {
		// в созданном массиве создаем массив - на каждый ряд
		components.gems[i] = new Array();
		// второй цикл запускается количество раз  - кратное количеству колонок
		for (let j = 0; j < configThreeGame.countCols; j++) {
			// в каждый ряд записываем -1 (в одном ряду будет -1, -1, -1, -1, -1, -1) - это начальный скелет поля
			components.gems[i][j] = -1;
		}
	}
	// В поле записываем случайные номера, которые соответствуют разным картинкам кристалов

	for (let i = 0; i < configThreeGame.countRows; i++) {
		for (let j = 0; j < configThreeGame.countCols; j++) {
			// заходим в ряд и для каждой ячейки записываем случайный номер
			do {
				components.gems[i][j] = Math.floor(Math.random() * (configThreeGame.countImages - 0) + 0);
			} while (isStreak(i, j));
			createGem(i * configThreeGame.gemSize, j * configThreeGame.gemSize, i, j, configThreeGame.imagesCoin[components.gems[i][j]], components.gems[i][j]);
		}
	}

}

// Проверка на группу сбора
function isStreak(row, col) {
	return isVerticalStreak(row, col) || isHorizontalStreak(row, col);
}

// Проверка на группу сбора по колонкам
function isVerticalStreak(row, col) {
	if (row != -1 && col != -1) {
		let gemValue = components.gems[row][col];
		let streak = 0;
		let tmp = row;
		while (tmp > 0 && components.gems[tmp - 1][col] == gemValue) {
			streak++;
			tmp--;
		}

		tmp = row;

		while (tmp < configThreeGame.countRows - 1 && components.gems[tmp + 1][col] == gemValue) {
			streak++;
			tmp++;
		}
		return streak > 1;
	} else {
		return false;
	}

}
// Проверка на группу сбора по строкам
function isHorizontalStreak(row, col) {
	if (row != -1 && col != -1) {
		let gemValue = components.gems[row][col];
		let streak = 0;
		let tmp = col;

		while (tmp > 0 && components.gems[row][tmp - 1] == gemValue) {
			streak++;
			tmp--;
		}

		tmp = col;

		while (tmp < configThreeGame.countCols - 1 && components.gems[row][tmp + 1] == gemValue) {
			streak++;
			tmp++;
		}

		return streak > 1;
	} else {
		return false;
	}

}

// Меняем гемы местами
function gemSwitch() {
	if (player.selectedRow >= 0 && player.selectedCol >= 0 && player.posY >= 0 && player.posX >= 0) {
		let yOffset = player.selectedRow - player.posY;
		let xOffset = player.selectedCol - player.posX;
		// Метка для гемов, которые нужно двигать
		document.querySelector("#" + configThreeGame.gemIdPrefix + "_" + player.selectedRow + "_" + player.selectedCol).classList.add("switch");
		document.querySelector("#" + configThreeGame.gemIdPrefix + "_" + player.selectedRow + "_" + player.selectedCol).setAttribute("dir", "-1");

		document.querySelector("#" + configThreeGame.gemIdPrefix + "_" + player.posY + "_" + player.posX).classList.add("switch");
		document.querySelector("#" + configThreeGame.gemIdPrefix + "_" + player.posY + "_" + player.posX).setAttribute("dir", "1");

		// меняем местами гемы
		$(".switch").each(function () {
			configThreeGame.movingItems++;

			$(this).animate({
				left: "+=" + xOffset * configThreeGame.gemSize * $(this).attr("dir"),
				top: "+=" + yOffset * configThreeGame.gemSize * $(this).attr("dir")
			},
				{
					duration: 250,
					complete: function () {
						//Проверяем доступность данного хода
						checkMoving();
					}
				}
			);

			$(this).removeClass("switch");
		});

		// поменять идентификаторы гемов
		document.querySelector("#" + configThreeGame.gemIdPrefix + "_" + player.selectedRow + "_" + player.selectedCol).setAttribute("id", "temp");
		document.querySelector("#" + configThreeGame.gemIdPrefix + "_" + player.posY + "_" + player.posX).setAttribute("id", configThreeGame.gemIdPrefix + "_" + player.selectedRow + "_" + player.selectedCol);
		document.querySelector("#temp").setAttribute("id", configThreeGame.gemIdPrefix + "_" + player.posY + "_" + player.posX);

		// поменять гемы в сетке
		let temp = components.gems[player.selectedRow][player.selectedCol];
		components.gems[player.selectedRow][player.selectedCol] = components.gems[player.posY][player.posX];
		components.gems[player.posY][player.posX] = temp;
	}
	else {
		return false;
	}
}

// Проверка перемещенных гемов
function checkMoving() {
	configThreeGame.movingItems--;

	// Действуем только после всех перемещений
	if (configThreeGame.movingItems == 0) {

		// Действия в зависимости от состояния игры
		switch (configThreeGame.gameState) {

			// После передвижения гемов проверяем на появление групп сбора
			case configThreeGame.gameStates[1]:
			case configThreeGame.gameStates[2]:
				// проверяем, появились ли группы сбора
				if (!isStreak(player.selectedRow, player.selectedCol) && !isStreak(player.posY, player.posX)) {
					// Далее проверяем - не является ли перемещаемый элемент блоком с сердцем, если нет - тогда возвращаем блок назад. Если сердце - то просто перемещаем его в соседнюю клетку
					if (player.selectedRow >= 0 && player.selectedCol >= 0 && player.posY >= 0 && player.posX >= 0) {
						// Если групп сбора нет, нужно отменить совершенное движение
						// а если действие уже отменяется, то вернуться к исходному состоянию ожидания выбора
						if (configThreeGame.gameState != configThreeGame.gameStates[2]) {
							configThreeGame.gameState = configThreeGame.gameStates[2];
							gemSwitch();
						} else {
							configThreeGame.gameState = configThreeGame.gameStates[0];
							player.selectedRow = -1;
							player.selectedCol = -1;
						}
					}

				} else {
					// Если группы сбора есть, нужно их удалить
					configThreeGame.gameState = configThreeGame.gameStates[3]

					// Отметим все удаляемые гемы
					if (isStreak(player.selectedRow, player.selectedCol)) {
						removeGems(player.selectedRow, player.selectedCol);
					}

					if (isStreak(player.posY, player.posX)) {
						removeGems(player.posY, player.posX);
					}

					// Убираем с поля
					gemFade();
				}
				break;
			// После удаления нужно заполнить пустоту
			case configThreeGame.gameStates[3]:
				checkFalling();
				break;
			case configThreeGame.gameStates[4]:
				placeNewGems();
				break;
		}
	}
}

// Отмечаем элементы для удаления и убираем их из сетки
function removeGems(row, col) {
	let gemValue = components.gems[row][col];
	let tmp = row;

	document.querySelector("#" + configThreeGame.gemIdPrefix + "_" + row + "_" + col).classList.add("remove");
	let countRemoveGem = document.querySelectorAll(".remove").length;


	if (isVerticalStreak(row, col)) {
		while (tmp > 0 && components.gems[tmp - 1][col] == gemValue) {
			document.querySelector("#" + configThreeGame.gemIdPrefix + "_" + (tmp - 1) + "_" + col).classList.add("remove");
			components.gems[tmp - 1][col] = -1;
			tmp--;
			countRemoveGem++;
		}

		tmp = row;

		while (tmp < configThreeGame.countRows - 1 && components.gems[tmp + 1][col] == gemValue) {
			document.querySelector("#" + configThreeGame.gemIdPrefix + "_" + (tmp + 1) + "_" + col).classList.add("remove");
			components.gems[tmp + 1][col] = -1;
			tmp++;
			countRemoveGem++;
		}
	}

	if (isHorizontalStreak(row, col)) {
		tmp = col;

		while (tmp > 0 && components.gems[row][tmp - 1] == gemValue) {
			document.querySelector("#" + configThreeGame.gemIdPrefix + "_" + row + "_" + (tmp - 1)).classList.add("remove");
			components.gems[row][tmp - 1] = -1;
			tmp--;
			countRemoveGem++;
		}

		tmp = col;

		while (tmp < configThreeGame.countCols - 1 && components.gems[row][tmp + 1] == gemValue) {
			document.querySelector("#" + configThreeGame.gemIdPrefix + "_" + row + "_" + (tmp + 1)).classList.add("remove");
			components.gems[row][tmp + 1] = -1;
			tmp++;
			countRemoveGem++;
		}
	}
	components.gems[row][col] = -1;

	const gems = document.querySelectorAll(".remove");
	let numGem = 0;
	gems.forEach(gem => {
		numGem = +gem.dataset.gem;
	})
	scoreInc(countRemoveGem, numGem);
}

// Удаляем гемы
function gemFade() {
	$(".remove").each(function () {
		configThreeGame.movingItems++;

		$(this).animate({
			opacity: 0
		},
			{
				duration: 200,
				complete: function () {
					$(this).remove();
					checkMoving();
				}
			}
		);
	});
}

// Заполняем пустоту
function checkFalling() {
	let fellDown = 0;
	for (let j = 0; j < configThreeGame.countCols; j++) {
		for (let i = configThreeGame.countRows - 1; i > 0; i--) {
			if (components.gems[i][j] == -1 && components.gems[i - 1][j] >= 0) {
				document.querySelector("#" + configThreeGame.gemIdPrefix + "_" + (i - 1) + "_" + j).classList.add("fall");
				document.querySelector("#" + configThreeGame.gemIdPrefix + "_" + (i - 1) + "_" + j).setAttribute("id", configThreeGame.gemIdPrefix + "_" + i + "_" + j);
				components.gems[i][j] = components.gems[i - 1][j];
				components.gems[i - 1][j] = -1;
				fellDown++;
			}
		}
	}

	$(".fall").each(function () {
		configThreeGame.movingItems++;

		$(this).animate({
			top: "+=" + configThreeGame.gemSize
		},
			{
				duration: 100,
				complete: function () {
					$(this).removeClass("fall");
					checkMoving();
				}
			}
		);
	});

	// Если все элементы передвинули,
	// то сменить состояние игры
	if (fellDown == 0) {
		configThreeGame.gameState = configThreeGame.gameStates[4];
		configThreeGame.movingItems = 1;
		checkMoving();
	}
}

// Создание новых гемов
function placeNewGems() {
	let gemsPlaced = 0;

	// Поиск мест, в которых необходимо создать гем
	for (let i = 0; i < configThreeGame.countCols; i++) {
		if (components.gems[0][i] == -1) {
			components.gems[0][i] = Math.floor(Math.random() * (configThreeGame.countImages - 0) + 0);
			createGem(0, i * configThreeGame.gemSize, 0, i, configThreeGame.imagesCoin[components.gems[0][i]], components.gems[0][i]);
			gemsPlaced++;
		}
	}

	// Если мы создали гемы, то проверяем необходимость их сдвинуть вниз.
	if (gemsPlaced) {
		configThreeGame.gameState = configThreeGame.gameStates[3];
		checkFalling();
	} else {
		// Проверка на группы сбора
		let combo = 0

		for (let i = 0; i < configThreeGame.countRows; i++) {
			for (let j = 0; j < configThreeGame.countCols; j++) {

				if (j <= configThreeGame.countCols - 3 && components.gems[i][j] == components.gems[i][j + 1] && components.gems[i][j] == components.gems[i][j + 2]) {
					combo++;
					removeGems(i, j);
				}
				if (i <= configThreeGame.countRows - 3 && components.gems[i][j] == components.gems[i + 1][j] && components.gems[i][j] == components.gems[i + 2][j]) {
					combo++;
					removeGems(i, j);
				}

			}
		}

		// удаляем найденные группы сбора
		if (combo > 0) {
			configThreeGame.gameState = configThreeGame.gameStates[3];
			gemFade();
		} else {
			// Запускаем основное состояние игры
			configThreeGame.gameState = configThreeGame.gameStates[0];
			player.selectedRow = -1;
		}
	}
}

// function timer() {
// 	const timeBlock = document.querySelector('.info-box__time');
// 	configThreeGame.timeCurrent = configThreeGame.timeConst;
// 	configThreeGame.timer = setInterval(() => {
// 		--configThreeGame.timeCurrent;

// 		if (configThreeGame.timeCurrent >= 10) timeBlock.textContent = `0:${configThreeGame.timeCurrent}`;
// 		else timeBlock.textContent = `0:0${configThreeGame.timeCurrent}`;

// 		// Если время закончилось
// 		if (configThreeGame.timeCurrent <= 0) {
// 			clearInterval(configThreeGame.timer);
// 			showFinalScreen();
// 		}
// 	}, 1000);
// }


