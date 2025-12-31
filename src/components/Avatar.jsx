import { getAvatarUrl, getAvatarColor, getInitials } from '../utils/avatar';

export default function Avatar({ user, size = 40, showBorder = false }) {
  if (!user) return null;

  const avatarUrl = user.photo_url || getAvatarUrl(user.id, size);
  const backgroundColor = getAvatarColor(user.id);
  const initials = getInitials(user.name);

  return (
    <div
      className="avatar"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: backgroundColor,
        border: showBorder ? '3px solid var(--surface)' : 'none',
        boxShadow: showBorder ? 'var(--shadow)' : 'none',
      }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={user.name || 'Avatar'}
          className="avatar-image"
          onError={(e) => {
            // Resim yüklenemezse initials göster
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div className="avatar-fallback" style={{ display: avatarUrl ? 'none' : 'flex' }}>
        {initials}
      </div>
    </div>
  );
}
