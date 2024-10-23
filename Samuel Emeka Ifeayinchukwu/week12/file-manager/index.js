import chalk from "chalk";
import ProgressBar from "progress"

console.log(chalk.bgGreen(chalk.white("PASS")));
const bar = new ProgressBar(':bar', { total: 100 });
const timer = setInterval(() => {
  bar.tick();
  if (bar.complete) {
    clearInterval(timer);
  }
}, 100);
