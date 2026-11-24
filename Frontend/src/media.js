export const photos = {
  forest: { src: '/media/bosque.jpg', title: 'Bosque del volcán Arenal', author: 'Janey Levy',
    source: 'https://www.flickr.com/photos/54302187@N03/6185236251/', license: 'https://creativecommons.org/licenses/by-sa/2.0/' },
  volcano: { src: '/media/arenal.jpg', title: 'Volcán Arenal', author: 'Foreign, Commonwealth & Development Office',
    source: 'https://www.flickr.com/photos/foreignoffice/2050690100/', license: 'https://creativecommons.org/licenses/by/2.0/' },
  national: { src: '/media/museo-nacional.jpg', title: 'Museo Nacional de Costa Rica', author: 'David Stanley',
    source: 'https://www.flickr.com/photos/davidstanleytravel/54753612603/', license: 'https://creativecommons.org/licenses/by/2.0/' },
  jade: { src: '/media/museo-jade.jpg', title: 'Interior del Museo del Jade', author: 'Rodtico21',
    source: 'https://www.flickr.com/photos/44979762@N03/15301498005/', license: 'https://creativecommons.org/licenses/by-sa/2.0/' },
}

export function catalogPhoto(place) {
  if (place.slug === 'museo-nacional-san-jose') return photos.national
  if (place.category === 'culture' && /^Museo del Jade\b/i.test(place.name)) return photos.jade
  return null
}
