
/**
 * Takes in a path and returns just the file part.
 * @author Benjamin P.C. Hovinga
 * @param {string} path 
 * @returns {string}
 */
function cleanFilename (path) {
    return path.split('/').at(-1);
}


/**
 * Converts an array of objects into a CSV string.
 *
 * Each object in the array represents a row, and the CSV headers
 * are automatically derived from the keys of the first object.
 * All values are quoted and any double quotes in values are escaped
 * according to CSV standards (by doubling them).
 *
 * @author ChatGPT (GPT-5.2)
 * 
 * @param {Object[]} rows
 *   Array of objects to convert into CSV. All objects should have
 *   the same keys; the keys of the first object are used as headers.
 *
 * @returns {string}
 *   The resulting CSV as a string, with headers as the first line.
 *
 * @throws {TypeError}
 *   If `rows` is not a non-empty array of objects.
 */
function toCSV(rows) {
    const headers = Object.keys(rows[0]);
    const csv = [
        headers.join(','),
        ...rows.map(row =>
            headers.map(h => `"${String(row[h]).replace(/"/g, '""')}"`).join(',')
        )
    ].join('\n');
    return csv;
}


/**
 * Converts a string into a filename that is safe for both
 * filesystems (Windows/macOS/Linux) and URLs without encoding.
 *
 * The output uses only URL-unreserved characters:
 * A–Z a–z 0–9 - _ . ~
 *
 * @author ChatGPT (GPT-5.2)
 *
 * @param {string} input
 *   The input string to sanitize.
 *
 * @param {Object} [options]
 *   Optional configuration for filename generation.
 * @param {string} [options.replacement='-']
 *   Character used to replace disallowed characters.
 *   Should itself be URL-unreserved.
 * @param {number} [options.maxLength=255]
 *   Maximum length of the resulting filename.
 * @param {boolean} [options.preserveCase=true]
 *   Whether to preserve letter casing.
 *
 * @returns {string}
 *   A filename safe for both filesystem usage and URLs.
 *
 * @throws {TypeError}
 *   If `input` is not a string.
 */
function toSafeFilename(input, options = {}) {
    if (typeof input !== 'string') {
        throw new TypeError('input must be a string');
    }

    const {
        replacement = '-',
        maxLength = 255,
        preserveCase = true
    } = options;

    let name = input
        // Normalize Unicode
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')   // remove diacritics

        // Replace anything NOT URL-unreserved
        .replace(/[^A-Za-z0-9\-_.~]+/g, replacement)

        // Collapse multiple replacements
        .replace(new RegExp(`${replacement}{2,}`, 'g'), replacement)

        // Trim replacements from ends
        .replace(new RegExp(`^${replacement}|${replacement}$`, 'g'), '');

    // Windows reserved filenames
    const reserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
    if (reserved.test(name)) {
        name = `${replacement}${name}`;
    }

    if (!preserveCase) {
        name = name.toLowerCase();
    }

    return name.slice(0, maxLength);
}


const main = document.querySelector("[role='main']");

const photos = Array(...main.children).map((elem) => {
    const children = elem.children;
    const descriptionElem = children[1].querySelector(':scope > div');
    const takenDate = Array(...children[1].querySelectorAll('tr')).map((row) => {
        if (row.firstChild.innerText.toLowerCase() == "taken")
            return row.lastChild.innerText;
    }).filter((row) => row)[0] || null;
    return {
        albumName: children[0].innerText,
        description: descriptionElem ? descriptionElem.innerText : null,
        filename: cleanFilename(children[1].querySelector('img').src),
        publishDate: children[2].innerText,
        takenDate
    };
});

const csv = toCSV(photos);

const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
console.log("URL", url);

const a = document.createElement('a');
a.href = url;
a.download = toSafeFilename(photos[0].albumName);
a.click();
console.log("A", a);

URL.revokeObjectURL(url);
