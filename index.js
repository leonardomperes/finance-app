import fs from "fs/promises"
import { PROJECT } from "./constants.js"
import { Authenticate } from "./modules/Authenticate/Authenticate.js"
import { Users } from "./modules/Users/Users.js"
import { Screens } from "./modules/Screens/Screens.js"

async function main() {
        const screens = new Screens()
        const users = new Users()
        
        const data = await fs.readFile(PROJECT.filePath, 'utf-8');
        const jsonData = JSON.parse(data);

        // console.log(typeof (data))
        // console.log(jsonData["users"].length == 0)
        if (jsonData.users.length == 0) {
            await users.create()
            await screens.intial()

        } else {
            await screens.intial()
        }
    
}
main()