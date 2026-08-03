// Resets the modal slot on forward soft-navigation to any multi-segment route
// (e.g. -> /results). The root "/" can't be covered here (an optional catch-all
// would collide with app/page.tsx), so the modal itself also self-hides via a
// pathname guard in (.)upload/page.tsx.
export default function ModalCatchAll() {
  return null
}
