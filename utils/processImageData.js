export async function processImageData(dataString) {
    dataString = dataString.trim();
    if (dataString.startsWith(')]}\',\n')) {
        dataString = dataString.substring(5);
    }
    const imagesData = JSON.parse(dataString);
    return imagesData.map(image => ({
        id: image.id,
        imageUrl: image.imageUrl,
        title: image.title,
        creator: image.creator,
        date: image.date,
        imageWidthPx: image.imageWidthPx,
        imageHeightPx: image.imageHeightPx,
        partner: image.partner,
        distance: image.distance
    }));
}