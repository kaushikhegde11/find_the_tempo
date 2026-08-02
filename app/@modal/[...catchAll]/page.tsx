// Forces the modal slot to reset to nothing on any route other than the
// intercepted /upload. Without this, forward soft-navigation (e.g. -> /results)
// leaves the previous modal subtree mounted on top of the new page.
export default function ModalCatchAll() {
  return null
}
