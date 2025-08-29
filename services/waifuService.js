const { parseStringPromise } = require('xml2js');
const { apiKey, userId } = require('../config.json');

/**
 * Récupère une image aléatoire ou la dernière image d’un utilisateur sur Rule34.
 */
async function getLastPic() {
    // Requête à l'API Rule34
    const response = await fetch(
        `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&api_key=${apiKey}&user_id=${userId}&limit=1&pid=0`
    );

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Récupération du XML et parsing
    const xml = await response.text();
    const result = await parseStringPromise(xml);

    // Vérification que l'API a renvoyé au moins une image
    if (!result.posts || !result.posts.post || result.posts.post.length === 0) {
        throw new Error('No image found');
    }

    // Récupération de l'URL de l'image
    const imageUrl = result.posts.post[0].$.file_url;

    return { url: imageUrl };
}

/**
 * Récupère une image correspondant au tag donné (ex: zelda)
 */
async function getCustomPic(tag) {
    // Encodage du tag pour l'URL
    const encodedTag = encodeURIComponent(tag);

    // Requête à l'API Rule34 avec le tag
    const response = await fetch(
        `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&tags=${encodedTag}&api_key=${apiKey}&user_id=${userId}&limit=1&pid=0&order=desc`
    );

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xml = await response.text();
    const result = await parseStringPromise(xml);

    if (!result.posts || !result.posts.post || result.posts.post.length === 0) {
        throw new Error(`No image found for tag "${tag}"`);
    }

    // On récupère la première image trouvée
    const imageUrl = result.posts.post[0].$.file_url;

    return { url: imageUrl };
}

module.exports = { getLastPic, getCustomPic };
