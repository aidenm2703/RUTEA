export const photos = {
  forest: { src: '/media/bosque.jpg', title: 'Bosque junto al agua en Tortuguero', author: 'David Stanley',
    source: 'https://www.flickr.com/photos/davidstanleytravel/54766224375/', license: 'https://creativecommons.org/licenses/by/4.0/' },
  volcano: { src: '/media/arenal.jpg', title: 'Volcán Arenal', author: 'David Stanley',
    source: 'https://www.flickr.com/photos/davidstanleytravel/54768180266/', license: 'https://creativecommons.org/licenses/by/4.0/' },
  national: { src: '/media/museo-nacional.jpg', title: 'Museo Nacional de Costa Rica', author: 'David Stanley',
    source: 'https://www.flickr.com/photos/davidstanleytravel/54753612603/', license: 'https://creativecommons.org/licenses/by/4.0/' },
  jade: { src: '/media/museo-jade.jpg', title: 'Interior del Museo del Jade', author: 'Rodtico21',
    source: 'https://www.flickr.com/photos/44979762@N03/15301498005/', license: 'https://creativecommons.org/licenses/by-sa/2.0/' },
}

export function catalogPhoto(place) {
  if (place.slug === 'museo-nacional-san-jose') return photos.national
  if (place.slug === 'tortuguero') return photos.forest
  if (place.category === 'culture' && /^Museo del Jade\b/i.test(place.name)) return photos.jade
  return null
}
