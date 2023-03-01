import glob from 'glob';
import translatte from 'translatte';
import path from 'path';
import fs from 'fs/promises';

const iconsParse = async ({ source, dest, mock }) => {
	try {
		const files = await glob(source);
		const icons = [];

		console.log('Начинаем перевод');

		let count = 0;

		for (const file of files) {
			const fileName = path.basename(file);
			const name = fileName.replace('.svg', '');

			const { text: translatedName } = mock
				? { text: 'translated' }
				: await translatte(name, { to: 'ru' });

			const category = name.includes('filled') ? 'filled' : 'outlined';
			const tags = [...name.split('-'), ...translatedName.split('-')];

			icons.push({
				name,
				category,
				tags,
			});

			count++;

			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			process.stdout.write(`${count} из ${files.length}`);
		}

		console.log('\nНачинаем записывать файлы');

		const res = {
			path: '/_s/images/svg/tabler/',
			outline: [1, 1.25, 1.5, 1.75, 2],
			list: icons,
		};

		await fs.writeFile(dest, JSON.stringify(res, null, 4));

		console.log('Начинаем радоваться, что этот ад закончился');
	} catch (e) {
		console.error(e);
	}
};

iconsParse({
	source: './icons/**/*.svg',
	dest: './dest/tabler.json',
	mock: true,
});
