/**
 * İsmi "Ad S." formatına çevirir
 * Örnek: "Gökhan Ton" -> "Gökhan T."
 * Örnek: "Ali Veli Yılmaz" -> "Ali V."
 * Örnek: "Ahmet" -> "Ahmet"
 */
export function formatDisplayName(fullName) {
    if (!fullName) return '';
    
    const parts = fullName.trim().split(' ');
    
    if (parts.length === 1) {
        // Sadece tek isim varsa olduğu gibi döndür
        return parts[0];
    }
    
    // İlk isim + Son ismin ilk harfi
    const firstName = parts[0];
    const lastNameInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    
    return `${firstName} ${lastNameInitial}.`;
}
