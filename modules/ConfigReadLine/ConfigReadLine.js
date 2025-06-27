import readline from "readline"
export class ConfigReadLine {
    constructor() {
    }
    config() {
        return readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
    }
}