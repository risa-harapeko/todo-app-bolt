let _justEnded = false;

export function markDragEnded() {
  _justEnded = true;
  requestAnimationFrame(() => {
    _justEnded = false;
  });
}

export function consumeDragJustEnded() {
  return _justEnded;
}
