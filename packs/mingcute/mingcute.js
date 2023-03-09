import glob from 'glob';
import path from 'path';
import fs from 'fs/promises';
import mingcuteTags from './tags.json' assert { type: 'json' };
import { translateArray, formatIcons } from '../../helpers.js';

export async function mingcute() {
	try {
		console.log('Mingcute:');

		const categoriesMap = new Map([
			['line', 'Outlined'],
			['fill', 'Filled'],
		]);
		const files = await glob('packs/mingcute/icons/**/*.svg');
		const icons = [];

		for (const file of files) {
			const filename = path.basename(file).replaceAll('_', '-');
			const name = filename.replace('.svg', '');
			const [_, key, category] = name.match(/^(.*)-(line|fill)$/) ?? [
				filename,
				name,
				'line',
			];

			const tags = (mingcuteTags[key] ?? key.split('-')).filter(
				(tag) => !/\p{Script=Hani}+/u.test(tag)
			);

			icons.push({
				name: `${name}.svg`,
				category: categoriesMap.get(category),
				tags,
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
			path: '/_s/images/svg/mingcute/',
			list: icons,
		};

		await fs.writeFile('dest/mingcute.json', JSON.stringify(res, null, 4));

		console.log(' -Форматируем иконки');

		await formatIcons('packs/mingcute/icons/**/*.svg', 'mingcute');

		console.log(' -Готово');
	} catch (e) {
		console.error(e);
	}
}
