import { deleteMoney, addRemoveClass, checkRemoveAddClass, noMoney, getRandom, addMoney, getRandom_2 } from './functions.js';
import { initStartData, rotateDrum, getTargetBlock, checkTargetItem, config_game } from './script.js';
import { configSlot } from './slot.js';

import { startData } from './startData.js';

const preloader = document.querySelector('.preloader');

// Объявляем слушатель событий "клик"

document.addEventListener('click', (e) => {
	initStartData();

	let targetElement = e.target;

	const preloader = document.querySelector('.preloader');
	const wrapper = document.querySelector('.wrapper');

	const money = +sessionStorage.getItem('money');
	const currentBet = +sessionStorage.getItem('current-bet');

	if (targetElement.closest('[data-btn="privacy"]')) {
		window.location.href = 'index.html';
	}

	if (targetElement.closest('.preloader__button')) {
		window.location.href = 'main.html';
	}

	if (targetElement.closest('[data-btn="drum"]')) {
		wrapper.classList.add('_drum');
	}

	if (targetElement.closest('[data-btn="drum-home"]')) {
		wrapper.classList.remove('_drum');
	}

	if (targetElement.closest('[data-btn="slot"]')) {
		wrapper.classList.add('_slot');
	}

	if (targetElement.closest('[data-btn="slot-home"]')) {
		wrapper.classList.remove('_slot');
		if (configSlot.isAutMode) {
			clearInterval(configSlot.autospin);
			configSlot.isAutMode = false;

			document.querySelector('[data-btn="slot-start"]').classList.remove('_hold');
			document.querySelector('[data-btn="slot-max"]').classList.remove('_hold');
			document.querySelector('[data-btn="slot-auto"]').classList.remove('_hold');
			document.querySelector('.controls-slot__body').classList.remove('_hold');
		}
	}
	//========================================================================================================================================================
	if (targetElement.closest('.circle__button')) {
		if (+sessionStorage.getItem('money') >= config_game.priceStep) {
			rotateDrum();
			deleteMoney(config_game.priceStep, '.score', 'money');
			addRemoveClass('.circle__button', '_hold', 2500);

			setTimeout(() => {
				let block = getTargetBlock();
				checkTargetItem(block);
			}, 2100);
		}

	}
	//========================================================================================================================================================
	if (targetElement.closest('.final__button') && document.querySelector('.final').classList.contains('_visible')) {
		document.querySelector('.final').classList.remove('_visible');
	}

})
