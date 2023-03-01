import glob from 'glob';
import translate from 'translate';
import path from 'path';
import fs from 'fs/promises';

function* chunkify(arr, n) {
	for (let i = 0; i < arr.length; i += n) {
		yield arr.slice(i, i + n);
	}
}

async function iconsParse({ source, dest }) {
	try {
		const tags = [];
		const icons = [];

		console.log('Ищем файлы');

		const files = await glob(source);

		for (const file of files) {
			const name = path.basename(file);
			const tag = name.replace('.svg', '').replaceAll('-', ' ');
			const category = tag.includes('filled') ? 'filled' : 'outlined';
			const item = {
				name,
				category,
				tags: [],
			};

			tags.push(tag);
			icons.push(item);
		}

		const chunkedTags = [...chunkify(tags, 500)];
		const chunkedTranslatedTags = [];

		let count = 0;

		for (const chunk of chunkedTags) {
			const translatedChunk = await translate(chunk.join('; '), 'ru');

			chunkedTranslatedTags.push(translatedChunk.split('; '));

			count++;
			const percent = ((count / chunkedTags.length) * 100).toFixed();

			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			process.stdout.write(`Переводим теги: ${percent}%`);
		}

		console.log('\nЗаписываем файлы');

		const translatedTags = chunkedTranslatedTags.flat();

		icons.map((icon, index) => {
			const tag = tags[index];
			const translatedTag = translatedTags[index];
			const allTags = [...tag.split(' '), ...translatedTag.split(' ')];

			icon.tags = [...new Set(allTags)];

			return icon;
		});

		const res = {
			path: '/_s/images/svg/tabler/',
			outline: [1, 1.25, 1.5, 1.75, 2],
			list: icons,
		};

		await fs.writeFile(dest, JSON.stringify(res, null, 4));

		console.log('Готово');
	} catch (e) {
		console.error(e);
	}
}

iconsParse({
	source: './icons/**/*.svg',
	dest: './dest/tabler.json',
});
