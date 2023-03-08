import glob from 'glob';
import fs from 'fs/promises';
import path from 'path';
import { translateArray, formatIcons } from '../../helpers.js';

export async function lucide() {
	try {
		console.log('Lucide:');

		const files = await glob('packs/lucide/icons/*.json');
		const icons = [];

		for (const file of files) {
			const filename = path.basename(file);
			const raw = await fs.readFile(file);
			const item = JSON.parse(raw);

			icons.push({
				name: filename,
				category: item.categories[0],
				tags: item.tags,
			});
		}

		console.log(' -Переводим теги');

		const tags = icons.map(({ tags }) => tags.join(', '));
		const translatedTags = await translateArray(tags, true);

		console.log(' -Записываем JSON');

		icons.map((icon, index) => {
			const regular = tags[index].toLowerCase().split(', ');
			const translated = translatedTags[index].toLowerCase().split(', ');

			// Убираем дубликаты, если есть
			icon.tags = Array.from(new Set([...regular, ...translated]));

			return icon;
		});

		const res = {
			path: '/_s/images/svg/lucide/',
			outline: [0.5, 1, 1.5, 2, 2.5, 3],
			list: icons,
		};

		await fs.writeFile('dest/lucide.json', JSON.stringify(res, null, 4));

		console.log(' -Форматируем иконки');

		await formatIcons('packs/lucide/icons/*.svg', 'lucide');

		console.log(' -Готово');
	} catch (e) {
		console.error(e);
	}
}
