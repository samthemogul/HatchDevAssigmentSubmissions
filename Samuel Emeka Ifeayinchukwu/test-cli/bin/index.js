#!/usr/bin/env node

const yargs = require("yargs");


const options = yargs
  .usage("Usage: -n <name> -a <age> -u")
  .command("run start")
  .option("n", { alias: "name", describe: "Your name", type: "string", demandOption: true })
  .option("a", { alias: "age", describe: "Your age", type: "number", demandOption: false })
  .option("u", { alias: "uppercase", describe: "Convert name to uppercase", type: "boolean", demandOption: false })
  .argv;



const name = options.u ? options.name.toUpperCase() : options.name;


let greeting = `Hello, ${name}!`;

if (options.age) {
  greeting += ` You are ${options.age} years old.`;
}
console.log(greeting);
