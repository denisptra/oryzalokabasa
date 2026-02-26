const slugify = require('slugify');

const generateSlug = (text) => {
  if (!text) return '';
  
  return slugify(text, {
    lower: true,      // Huruf kecil semua
    strict: true,     // Hapus karakter spesial ($, @, dll)
    remove: /[*+~.()'"!:@]/g,
    replacement: '-'  // Spasi diganti dash (-)
  });
};

module.exports = generateSlug;