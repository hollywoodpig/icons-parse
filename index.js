import fs from 'fs/promises';
import { tabler, lucide, remix, material, mingcute } from './packs/index.js';

async function start() {
	await fs.mkdir('dest', { recursive: true });

	await tabler();
	await lucide();
	await remix();
	await material();
	await mingcute();
}

start();
