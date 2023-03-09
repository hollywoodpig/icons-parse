import glob from 'glob';
import path from 'path';
import mingcuteTags from './tags.json' assert { type: 'json' };
import { translateArray, formatIcons, formatJson } from '../../helpers.js';

export async function mingcute() {
	try {
		console.log('Mingcute:');

		const variantsMap = new Map([
			['line', 'outlined'],
			['fill', 'filled'],
		]);
		const files = await glob('packs/mingcute/icons/**/*.svg');
		const icons = [];

		for (const file of files) {
			const filename = path.basename(file).replaceAll('_', '-');
			const category = path.basename(path.dirname(file));
			const name = filename.replace('.svg', '');
			const [_, key, variant] = name.match(/^(.*)-(line|fill)$/) ?? [
				filename,
				name,
				'line',
			];
			const normalizedKey = key.toLowerCase();
			const normalizedVariant = variantsMap.get(variant);
			const tags = (mingcuteTags[key] ?? key.split('-')).filter(
				(tag) => !/\p{Script=Hani}+/u.test(tag)
			);

			icons.push({
				name: `${normalizedKey}-${normalizedVariant}.svg`,
				category,
				variant: normalizedVariant,
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
			path: '/_s/images/svg/mingcute/',
			categories: [...new Set(icons.map(({ category }) => category))],
			variants: [...new Set(icons.map(({ variant }) => variant))],
			list: icons,
		};

		await formatJson('mingcute', res);

		console.log(' -Форматируем иконки');

		await formatIcons(
			'packs/mingcute/icons/**/*.svg',
			'mingcute',
			(filename) => {
				filename = filename.replaceAll('_', '-');

				const name = filename.replace('.svg', '');
				const [_, key, variant] = name.match(/^(.*)-(line|fill)$/) ?? [
					filename,
					name,
					'line',
				];
				const normalizedKey = key.toLowerCase();
				const normalizedVariant = variantsMap.get(variant);

				return `${normalizedKey}-${normalizedVariant}.svg`;
			}
		);

		console.log(' -Готово');
	} catch (e) {
		console.error(e);
	}
}
