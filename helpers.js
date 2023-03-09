import translate from 'translate';
import path from 'path';
import glob from 'glob';
import replace from 'replace-in-file';
import fs from 'fs/promises';

export function* chunkify(arr, n) {
	for (let i = 0; i < arr.length; i += n) {
		yield arr.slice(i, i + n);
	}
}

export async function translateText(query) {
	const translated = await translate(query, {
		from: 'en',
		to: 'ru',
		cache: 100,
	});

	return translated;
}

export async function translateArray(arr, mock = true) {
	const chunks = [...chunkify(arr, 10)];
	const translatedChunks = [];

	for (const chunk of chunks) {
		const text = chunk.join('; ');
		const translatedText = mock
			? text.replace(/\w+/g, 'translated')
			: await translateText(text);
		const translatedChunk = translatedText.split('; ');

		translatedChunks.push(translatedChunk);
	}

	return translatedChunks.flat();
}

export async function formatIcons(source, pack, normalizeFilename) {
	const files = await glob(source);
	const chunks = [...chunkify(files, 500)];

	await fs.mkdir(`dest/${pack}`, { recursive: true });

	for (const chunk of chunks) {
		for (const file of chunk) {
			const filename = path.basename(file);

			let normalizedFilename = filename;

			if (typeof normalizeFilename === 'function') {
				normalizedFilename = await normalizeFilename(filename);
			}

			await fs.copyFile(file, `dest/${pack}/${normalizedFilename}`);

			// Добавляем id="icon"
			await replace({
				files: `dest/${pack}/${normalizedFilename}`,
				from: '<svg',
				to: '<svg id="icon"',
			});

			// Избавляемся от атрибутов ширины и высоты
			await replace({
				files: `dest/${pack}/${normalizedFilename}`,
				from: /\swidth="\w+"|\sheight="\w+"/gm,
				to: '',
			});
		}
	}
}
