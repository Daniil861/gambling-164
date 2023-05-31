import { deleteMoney, checkRemoveAddClass, noMoney, getRandom, addMoney, getRandom_2 } from './functions.js';
import { startData } from './startData.js';


export function initStartData() {

	if (sessionStorage.getItem('money')) {
		writeScore();
	} else {
		sessionStorage.setItem('money', startData.bank);
		writeScore();
	}

}

function writeScore() {
	if (document.querySelector(startData.nameScore)) {
		document.querySelectorAll(startData.nameScore).forEach(el => {
			el.textContent = sessionStorage.getItem('money');
		})
	}
}


initStartData();

//========================================================================================================================================================
//game-drum

export const config_game = {
	last_rotate: 0,
	count_win: 0,
	priceStep: 300,
}
export function rotateDrum() {
	config_game.last_rotate += getRandom(100, 2000);
	document.querySelector('.circle__drum-box').style.transform = `rotate(${config_game.last_rotate}deg)`;
	document.querySelector('.circle__drum-box').style.transition = '2s';
}
export function getTargetBlock() {
	let arrow_top = document.querySelector('.circle__dot').getBoundingClientRect().top;
	let arrow_left = document.querySelector('.circle__dot').getBoundingClientRect().left;

	let target_block2 = document.elementFromPoint(arrow_left, arrow_top);

	return target_block2;
}

export function checkTargetItem(block) {
	let value = +block.dataset.target;
	showFinalScreen(value);
	addMoney(value, '.score', 1000, 2000);
}


//========================================================================================================================================================
export function showFinalScreen(count) {
	const final = document.querySelector('.final');
	const finalCheck = document.querySelector('.final-check');

	finalCheck.textContent = `${count}`;

	setTimeout(() => {
		final.classList.add('_visible');
	}, 250);
}
