/// Splits an array into two arrays based on the predicate.
export const splitFilter = <T,>(arr: T[], predicate: (n: T) => boolean) => {
  const a = [];
  const b = [];
  for (const n of arr) {
    if (predicate(n)) {
      a.push(n);
    } else {
      b.push(n);
    }
  }
  return [a, b] as [match: T[], reject: T[]];
};

export const wait = async (durationMs: number): Promise<void> => {
  await new Promise((resolve, _) => setTimeout(resolve, durationMs));
};
