import glob from 'glob';
import path from 'path';
import remixTags from './tags.json' assert { type: 'json' };
import { translateArray, formatIcons, formatJson } from '../../helpers.js';

export async function remix() {
	try {
		console.log('Remix:');

		const tagsList = Object.assign(...Object.values(remixTags));
		const variantsMap = new Map([
			['line', 'outlined'],
			['fill', 'filled'],
		]);

		const files = await glob('packs/remix/icons/**/*.svg');
		const icons = [];

		for (const file of files) {
			const filename = path.basename(file);
			const category = path.basename(path.dirname(file));
			const name = filename.replace('.svg', '');
			const [_, key, variant] = name.match(/^(.*)-(line|fill)$/) ?? [
				filename,
				name,
				'line',
			];
			const normalizedVariant = variantsMap.get(variant);
			const tags = tagsList[key].filter(
				(tag) => !/\p{Script=Hani}+/u.test(tag)
			);
			const normalizedTags = tags.length ? tags : key.split('-');

			icons.push({
				name: `${key}-${variantsMap.get(variant)}.svg`,
				category: category.toLowerCase(),
				variant: normalizedVariant,
				tags: normalizedTags,
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
			path: '/_s/images/svg/remix/',
			categories: [...new Set(icons.map(({ category }) => category))],
			variants: ['outlined', 'filled'],
			list: icons,
		};

		await formatJson('remix', res);

		console.log(' -Форматируем иконки');

		await formatIcons('packs/remix/icons/**/*.svg', 'remix', (filename) => {
			const name = filename.replace('.svg', '');
			const [_, key, variant] = name.match(/^(.*)-(line|fill)$/) ?? [
				filename,
				name,
				'line',
			];
			const normalizedVariant = variantsMap.get(variant);

			return `${key}-${normalizedVariant}.svg`;
		});

		console.log(' -Готово');
	} catch (e) {
		console.error(e);
	}
}
