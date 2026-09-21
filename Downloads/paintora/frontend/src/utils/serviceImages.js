const SERVICE_IMAGE_BY_NAME = {
  'interior wall painting': '/images/interior.jpg',
  'exterior house painting': '/images/exterior.jpg',
  'single room painting': '/images/single-room.jpg',
  'full home painting': '/images/full-home.jpg',
  'texture wall painting': '/images/texture.jpg',
  'ceiling painting': '/images/ceiling.jpg',
  'door & window painting': '/images/woodwork.jpg'
};

export function getServiceImage(service) {
  const image = typeof service?.image === 'string' ? service.image.trim() : '';
  if (image) {
    const clean = image.startsWith('/') ? image : `/${image}`;
    // Replace legacy .svg references with .jpg
    return clean.replace(/\.svg$/, '.jpg');
  }
  return SERVICE_IMAGE_BY_NAME[service?.name?.trim().toLowerCase()] || '/images/interior.jpg';
}