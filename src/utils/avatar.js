// Avatar renk paleti - Her kullanıcı için farklı arkaplan rengi
const AVATAR_COLORS = [
  '#FF6B6B', // Kırmızı
  '#4ECDC4', // Turkuaz
  '#45B7D1', // Mavi
  '#FFA07A', // Turuncu
  '#98D8C8', // Mint
  '#F7DC6F', // Sarı
  '#BB8FCE', // Mor
  '#85C1E2', // Açık Mavi
  '#F8B88B', // Şeftali
  '#A8E6CF', // Yeşil
  '#FFD3B6', // Bej
  '#FFAAA5', // Pembe
];

/**
 * Kullanıcı ID'sine göre avatar URL'i oluşturur
 * @param {string} userId - Kullanıcı ID'si
 * @param {number} size - Avatar boyutu (px)
 * @returns {string} Avatar URL'i
 */
export function getAvatarUrl(userId, size = 80) {
  if (!userId) return null;
  return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${userId}&size=${size}`;
}

/**
 * Kullanıcı ID'sine göre benzersiz arkaplan rengi döndürür
 * @param {string} userId - Kullanıcı ID'si
 * @returns {string} Hex renk kodu
 */
export function getAvatarColor(userId) {
  if (!userId) return AVATAR_COLORS[0];
  
  // User ID'den sayısal bir değer üret
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Hash'i renk paletine map et
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Kullanıcı adının baş harflerini döndürür (fallback için)
 * @param {string} name - Kullanıcı adı
 * @returns {string} Baş harfler
 */
export function getInitials(name) {
  if (!name) return '?';
  
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}
