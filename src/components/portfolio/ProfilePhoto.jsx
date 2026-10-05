import { profile } from '../../data/resume.js'

// To add a photo, save one image in src/assets/profile/ (jpg, png or webp).
// It is picked up automatically at build time — no code changes needed.
const found = Object.values(
  import.meta.glob('../../assets/profile/*.{jpg,jpeg,png,webp}', {
    eager: true,
    import: 'default',
  }),
)
const photo = found[0]

export default function ProfilePhoto() {
  return (
    <div className="profile-frame">
      {photo ? (
        <img src={photo} alt={`Portrait of ${profile.name}`} className="profile-img" />
      ) : (
        <div className="profile-placeholder" role="img" aria-label="Profile photo placeholder">
          <svg viewBox="0 0 120 120" width="96" height="96" aria-hidden="true">
            <circle cx="60" cy="44" r="22" fill="currentColor" />
            <path d="M18 112c0-24 19-40 42-40s42 16 42 40z" fill="currentColor" />
          </svg>
        </div>
      )}
    </div>
  )
}
