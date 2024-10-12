import fs from 'node:fs'
import { Buffer } from 'node:buffer'

const data = Buffer.from('Hello from Hatchdev')

fs.mkdir('./new1', { recursive: true}, () => {
    console.log('Directory 1 created')
})
fs.mkdir('./new2', { recursive: true}, () => {
    console.log('Directory 2 created')
})
fs.mkdir('./new3', { recursive: true}, () => {
    console.log('Directory 3 created')
})

fs.writeFile('./new1/textfile.txt', data, (err) => {
    if(err) {
        console.log(err)
    } else {
        fs.readFile('./new1/textfile.txt', 'utf8', (err, data) => {
            if(err) {
                console.log(err)
            } else {
                fs.writeFile('./new2/textfile.txt', data, (err) => {
                    if(err) {
                        console.log(err)
                    }
                })
                fs.writeFile('./new3/textfile.txt', data, (err) => {
                    if(err) {
                        console.log(err)
                    }
                })
            }
        })
    }
})



// setTimeout(() => {
//     fs.readFile('./new1/textfile.txt', 'utf8', (err, data) => {
//         if(err) {
//             console.log(err)
//         } else {
//             console.log(data)
//             fs.writeFile('./new2/textfile.txt', data, (err) => {
//                 if(err) {
//                     console.log(err)
//                 }
//             })
//             fs.writeFile('./new3/textfile.txt', data, (err) => {
//                 if(err) {
//                     console.log(err)
//                 }
//             })
//         }
//     })
// }, 3000)
