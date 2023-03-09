import glob from 'glob';
import path from 'path';
import materialTags from './tags.json' assert { type: 'json' };
import { translateArray, formatIcons, formatJson } from '../../helpers.js';

export async function material() {
	try {
		console.log('Material:');

		const tagsList = materialTags.icons.map(({ name, tags, categories }) => ({
			name: name.replaceAll('_', '-'),
			tags: tags.map((tag) => tag.toLowerCase()),
			category: categories[0],
		}));

		const files = await glob('packs/material/icons/*.svg');
		const icons = [];

		for (const file of files) {
			const filename = path.basename(file);
			const name = filename.replace('.svg', '');
			const [_, key, variant] = name.match(
				/^(.*)-(filled|outlined|round|sharp|two-tone)$/
			);
			const { tags, category } = tagsList.find((tag) => tag.name === key);

			icons.push({
				name: `${name}.svg`,
				category,
				variant,
				tags,
			});
		}

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
			path: '/_s/images/svg/material/',
			categories: [...new Set(icons.map(({ category }) => category))],
			variants: [...new Set(icons.map(({ variant }) => variant))],
			list: icons,
		};

		await formatJson('material', res);

		console.log(' -Форматируем иконки');

		await formatIcons('packs/material/icons/*.svg', 'material');

		console.log(' -Готово');
	} catch (e) {
		console.error(e);
	}
}
