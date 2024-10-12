function hourglassSum(arr: number[][]): number {
  // Write your code here
  const sums: number[] = [];
  let top = 0;
  while (top < 4) {
    let right = 0;
    while (right < 4) {
      const topRowSum =
        arr[top][right] + arr[top][right + 1] + arr[top][right + 2];

      const middleRowSum = arr[top + 1][right + 1];
      const bottomRowSum =
        arr[top + 2][right] + arr[top + 2][right + 1] + arr[top + 2][right + 2];
      const newSum = topRowSum + middleRowSum + bottomRowSum;
      sums.push(newSum);
      right = right + 1;
    }
    top = top + 1;
  }
  console.log(sums);
  let max = sums[0];
  for (let i = 0; i < sums.length; i++) {
    if (sums[i] > max) {
      max = sums[i];
    }
  }
  return max;
}

const testMatrix = [
  [-1, -1, 0, -9, -2, -2],
  [-2, -1, -6, -8, -2, -5],
  [-1, -1, -1, -2, -3, -4],
  [-1, -9, -2, -4, -4, -5],
  [-7, -3, -3, -2, -9, -9],
  [-1, -3, -1, -2, -4, -5],
];

console.log(hourglassSum(testMatrix));
