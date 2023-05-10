import { sum } from './ops/main.js';
import { mully } from './ops/mul.js';

const $e = document.getElementById('app');
$e.innerHTML = `<div>
    <h1>This is text and the sum is: </h1>
    <h2 style="color: green;">${sum(1, 0)}</h2>

    <h1>This is text and the multiplied value is:</h1>
    <h2 style="color: red;">${mully(1, 0)}</h2>
</div>
`