import glob from 'glob';
import path from 'path';
import fs from 'fs/promises';
import materialTags from './tags.json' assert { type: 'json' };
import { translateArray, formatIcons } from '../../helpers.js';

export async function material() {
	try {
		console.log('Material:');

		const tagsList = materialTags.icons.map(({ name, tags }) => ({
			name: name.replaceAll('_', '-'),
			tags: tags.map((tag) => tag.toLowerCase()),
		}));
		const categoriesMap = new Map([
			['filled', 'Filled'],
			['outlined', 'Outlined'],
			['round', 'Round'],
			['sharp', 'Sharp'],
			['two-tone', 'Two Tone'],
		]);

		const files = await glob('packs/material/icons/*.svg');
		const icons = [];

		for (const file of files) {
			const filename = path.basename(file);
			const name = filename.replace('.svg', '');
			const [_, key, category] = name.match(
				/^(.*)-(filled|outlined|round|sharp|two-tone)$/
			);

			const { tags } = tagsList.find((tag) => tag.name === key);

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
			path: '/_s/images/svg/material/',
			list: icons,
		};

		await fs.writeFile('dest/material.json', JSON.stringify(res, null, 4));

		console.log(' -Форматируем иконки');

		await formatIcons('packs/material/icons/*.svg', 'material');

		console.log(' -Готово');
	} catch (e) {
		console.error(e);
	}
}
