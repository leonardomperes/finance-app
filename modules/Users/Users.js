import fs from 'fs/promises';
import { PROJECT } from '../../constants.js';
import { STYLES } from '../Styles/Styles.js';
import { input, password } from '@inquirer/prompts';
import { Crypto } from '../Crypto/Crypto.js';
import { Loading } from '../Loading/Loading.js';
import { minChars } from "../../utils/validations.js"
export class Users {
    constructor() {
        this.data = []
    }
    add({ name, password }) {

    }
    async remove(user) {
        const loading = new Loading()
        const filterUsers = this.data.filter((el) => el.email !== user.email)
        const newUsers = {
            users: filterUsers
        }
        // console.log(JSON.stringify(newUsers, null, 2))
        // console.log(newUsers)
        this.data = newUsers
        await fs.writeFile(PROJECT.filePath, JSON.stringify(newUsers, null, 2));
        STYLES.sucessScreen("Perfil deletado com sucesso!")
        await loading.delay(1500)

    }
    async create() {
        console.clear()
        const loading = new Loading()

        STYLES.newProfileScreen()
        let name = await input({ message: "Digite o nome do usuario: " })
        while (!minChars(name)) {
            STYLES.failScreen("Deve conter no minimo 3 caracteres")
            name = await input({ message: "Digite o nome do usuario: " })
        }
        let pass = await password({ message: "Digite sua senha: ", mask: "*" })
        while (!minChars(pass)) {
            STYLES.failScreen("Deve conter no minimo 3 caracteres")
            pass = await password({ message: "Digite sua senha: ", mask: "*" })
        }

        let email = await input({ message: "Digite seu email: " })
        while (!email.includes("@")) {
            STYLES.failScreen("Digite seu email (Deve conter @)")
            email = await input({ message: "Digite seu email: " })

        }
        try {

            // Crypto password
            const cryp = new Crypto(pass)
            const objCryp = await cryp.encrypt()

            // Test decryted
            const decyptedPassword = cryp.decrypt(objCryp)
            // console.log(decyptedPassword)
            const fileData = await fs.readFile(PROJECT.filePath, 'utf-8');
            const jsonData = JSON.parse(fileData);

            if (jsonData["users"].length == 0) {

                const objUser = {
                    name,
                    password: objCryp.content,
                    email,
                    expenses: {
                        common: [],
                        fixed: []
                    },
                    incomes: {
                        common: [],
                        fixed: []
                    },
                    reports: {}
                }
                const firstData = jsonData["users"].push(objUser)
                const updatedData = { ...jsonData, ...firstData };
                // this.data = updatedData
                await fs.writeFile(PROJECT.filePath, JSON.stringify(updatedData, null, 2));
                STYLES.sucessScreen("Usuario cadastrado com sucesso!")
                await loading.delay(1500)

            } else {
                const objUser = {
                    name,
                    password: objCryp.content,
                    email,
                    expenses: {
                        common: [],
                        fixed: []
                    },
                    incomes: {
                        common: [],
                        fixed: []
                    },
                    reports: {}
                }
                const newData = jsonData["users"].push(objUser)
                const updatedData = { ...jsonData, ...newData };
                // this.data = updatedData
                await fs.writeFile(PROJECT.filePath, JSON.stringify(updatedData, null, 2));
                STYLES.sucessScreen("Usuario cadastrado com sucesso!")
                await loading.delay(1500)

            }


        } catch (err) {
            console.error('Erro ao atualizar:', err);
        }

    }
    async getAll() {
        try {
            const rawData = await fs.readFile(PROJECT.filePath, {
                encoding: 'utf-8'
            });
            return JSON.parse(rawData);
            // console.log('Dados do JSON:', jsonData);
        } catch (err) {
            console.error('Erro ao ler o arquivo:', err);
        }
    }
    async get(email) {
        // try {
        //     const rawData = await fs.readFile(PROJECT.filePath, {
        //         encoding: 'utf-8'
        //     });
        //     return JSON.parse(rawData);
        //     // console.log('Dados do JSON:', jsonData);
        // } catch (err) {
        //     console.error('Erro ao ler o arquivo:', err);
        // }
    }
}




