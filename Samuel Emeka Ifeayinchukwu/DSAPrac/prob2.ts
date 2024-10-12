function dynamicArray(n: number, queries: number[][]): number[] {
    // Write your code here
    const answers: number[] = []
    const arr: number[][] = []
    for(let i = 0; i < n; i++){
        arr[i] = []
    }
    let lastAnswer = 0
    for(let query of queries){
        if(query[0] == 1){
            const idx = (query[1] ^ lastAnswer) % n
            arr[idx].push(query[2])
        }
        if(query[0] == 2){
            const idx = (query[1] ^ lastAnswer) % n
            lastAnswer = arr[idx][query[2] % arr[idx].length]
            answers.push(lastAnswer)
        }
    }
    
    
    
    return answers

}