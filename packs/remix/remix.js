import glob from 'glob';
import path from 'path';
import fs from 'fs/promises';
import remixTags from './tags.json' assert { type: 'json' };
import { translateArray, formatIcons } from '../../helpers.js';

export async function remix() {
	try {
		console.log('Remix:');

		const tagsList = Object.assign(...Object.values(remixTags));
		const categoriesMap = new Map([
			['line', 'Outlined'],
			['fill', 'Filled'],
		]);

		const files = await glob('packs/remix/icons/**/*.svg');
		const icons = [];

		for (const file of files) {
			const filename = path.basename(file);
			const name = filename.replace('.svg', '');
			const [_, key, category] = name.match(/^(.*)-(line|fill)$/) ?? [
				filename,
				name,
				'line',
			];

			const tags = tagsList[key].filter(
				(tag) => !/\p{Script=Hani}+/u.test(tag)
			);
			const normalizedTags = tags.length ? tags : key.split('-');

			icons.push({
				name: `${name}.svg`,
				category: categoriesMap.get(category),
				tags: normalizedTags,
			});
		}

		console.log(' -Переводим теги');

		const tags = icons.map(({ tags }) => tags.join(', '));
		const translatedTags = await translateArray(tags);

		console.log(' -Записываем JSON');

		icons.map((icon, index) => {
			const regular = tags[index].toLowerCase().split(', ');
			const translated = translatedTags[index].toLowerCase().split(', ');

			// Убираем дубликаты, если есть
			icon.tags = Array.from(new Set([...regular, ...translated]));

			return icon;
		});

		const res = {
			path: '/_s/images/svg/remix/',
			list: icons,
		};

		await fs.writeFile('dest/remix.json', JSON.stringify(res, null, 4));

		console.log(' -Форматируем иконки');

		await formatIcons('packs/remix/icons/**/*.svg', 'remix');

		console.log(' -Готово');
	} catch (e) {
		console.error(e);
	}
}
