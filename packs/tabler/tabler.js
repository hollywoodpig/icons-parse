import fs from 'fs/promises';
import { formatIcons, translateArray } from '../../helpers.js';
import tablerTags from './tags.json' assert { type: 'json' };

export async function tabler() {
	try {
		console.log('Tabler:');

		const icons = Object.values(tablerTags).map((item) => ({
			name: `${item.name}.svg`,
			category: item.category.toLowerCase() || 'other',
			tags: item.tags,
		}));

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
			path: '/_s/images/svg/tabler/',
			categories: [...new Set(icons.map(({ category }) => category))],
			outline: [1, 1.25, 1.5, 1.75, 2],
			list: icons,
		};

		await fs.writeFile('dest/tabler.json', JSON.stringify(res, null, 4));

		console.log(' -Форматируем иконки');

		await formatIcons(`packs/tabler/icons/*.svg`, 'tabler');

		console.log(' -Готово');
	} catch (e) {
		console.error(e);
	}
}
