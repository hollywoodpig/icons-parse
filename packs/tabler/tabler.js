import { formatIcons, translateArray, formatJson } from '../../helpers.js';
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

		console.log(' -Форматируем JSON');

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
			outline: {
				min: 1,
				max: 2,
				step: 0.25,
			},
			list: icons,
		};

		await formatJson('tabler', res);

		console.log(' -Форматируем иконки');

		await formatIcons(`packs/tabler/icons/*.svg`, 'tabler');

		console.log(' -Готово');
	} catch (e) {
		console.error(e);
	}
}
