import  Sorter from "./sorter.ts";

const array = [ 5, 6, 2, 10, 16, 1]
const sorter = new Sorter()
console.time()
console.log(sorter.quicksort(array))
console.timeEnd()

