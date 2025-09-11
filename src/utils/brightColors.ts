export function brightColors(n: number): string[] {
  const base = Array.from({ length: n }, (_, i) => {
    // even hue spacing, high saturation, medium-high lightness
    const hue = Math.round((360 / Math.max(n, 1)) * i + Math.random() * 12); // small jitter so it's not identical
    return `hsl(${hue}deg 90% 55%)`;
  });
  // Fisher–Yates shuffle to change order on each render
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base;
}
