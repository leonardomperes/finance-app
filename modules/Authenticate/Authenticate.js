import fs from "fs"
import path from "path"

export class Authenticate {
    constructor() {
        function folderExists(folderPath) {
            try {
                return fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory();
            } catch (err) {
                return false;
            }
        }
    }

    getUserSession() {

    }
    logIn() {

    }
    logOut() {

    }
}