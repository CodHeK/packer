import { sum } from './ops/main.js';


const $e = document.getElementById('app');
$e.innerText = `${5 + sum(1, 5)}`;