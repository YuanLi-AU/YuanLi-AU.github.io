export default function Tags({ items, muted = false }) {
  return (
    <ul className={muted ? 'tags tags-muted' : 'tags'}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
