import fs from 'fs/promises';
import path from 'path';
import translateGoogle from 'translate-google';
import glob from 'glob';
import replace from 'replace-in-file';
import tablerTags from './tags.json' assert { type: 'json' };
import { chunkify } from '../../helpers.js';

export async function tabler(chunkSize = 200) {
	try {
		console.log('Tabler:');

		const icons = Object.values(tablerTags).map((item) => ({
			name: `${item.name}.svg`,
			category: item.category || 'Other',
			tags: item.tags,
		}));
		const tags = icons.map(({ tags }) => tags);
		const chunkedTags = [...chunkify(tags, chunkSize)];
		const chunkedTranslatedTags = [];

		let count = 0;

		for (const chunk of chunkedTags) {
			const translatedChunk = await translateGoogle(chunk, {
				from: 'en',
				to: 'ru',
			});

			chunkedTranslatedTags.push(translatedChunk);

			count++;
			const percent = ((count / chunkedTags.length) * 100).toFixed();

			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			process.stdout.write(` -Переводим теги: ${percent}%`);
		}

		console.log('\n -Создаем JSON');

		const translatedTags = chunkedTranslatedTags.flat();

		icons.map((icon, index) => {
			const tag = tags[index];
			const translatedTag = translatedTags[index];
			const allTags = [...tag, ...translatedTag];

			icon.tags = [...new Set(allTags)];

			return icon;
		});

		const res = {
			path: '/_s/images/svg/tabler/',
			outline: [1, 1.25, 1.5, 1.75, 2],
			list: icons,
		};

		await fs.writeFile('dest/tabler.json', JSON.stringify(res, null, 4));

		console.log(' -Изменяем иконки');

		const files = await glob('packs/tabler/svg/*.svg');

		await fs.mkdir('dest/tabler', { recursive: true });

		for (const file of files) {
			const basename = path.basename(file);

			await fs.copyFile(file, `dest/tabler/${basename}`);
		}

		await replace({
			files: 'dest/tabler/*.svg',
			from: '<svg',
			to: '<svg id="icon"',
		});

		console.log(' -Готово');
	} catch (e) {
		console.error(e);
	}
}
