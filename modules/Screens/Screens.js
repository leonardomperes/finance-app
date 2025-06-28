import fs from 'fs/promises';
import chalk from "chalk";
import { confirm, select, password, input } from "@inquirer/prompts";
import { PROJECT } from "../../constants.js";
import { STYLES } from "../Styles/Styles.js";
import { randomUUID } from "crypto";
import { Calc } from "../../utils/Calc.js";
import { Crypto } from "../Crypto/Crypto.js";
import { Users } from "../Users/Users.js";
import { StateManagement } from "../StateManagement/StateManagement.js"
import { Loading } from "../Loading/Loading.js";
export class Screens {
    constructor() {
        this.users = new Users()
        this.state = new StateManagement()
    }
    async intial() {
        console.clear()
        try {
            const loading = new Loading()
            const data = await fs.readFile(PROJECT.filePath, 'utf-8');
            const jsonData = JSON.parse(data);
            this.users.data = jsonData['users']
            const names = jsonData["users"].map((el) => { return `${el.name} - ${el.email}` })
            names.push("ADICIONAR PERFIL", "SAIR")
            STYLES.homeScreen()
            const profile = await select({
                message: "Selecione o perfil desejado", choices: names
            })

            switch (profile) {
                case "ADICIONAR PERFIL":
                    await this.users.create()
                    await this.intial()
                    break;

                case "SAIR":
                    STYLES.exitScreen()
                    process.exit()

                default:
                    const splitName = profile.split(" - ")
                    const userName = splitName[0].trim()
                    const userState = jsonData["users"].find(value => value.name == userName)
                    const userIndex = jsonData["users"].indexOf(userState)
                    const choice = {
                        value: userState,
                        index: userIndex
                    }
                    this.state.user[0] = choice
                    await this.logIn()
                    break;
            }

        } catch (err) {
            console.error('Erro ao atualizar:', err);
        }
    }
    async logIn() {
        // console.clear()
        const loading = new Loading()
        STYLES.loginScreen()
        let pass = await password({ message: "Digite sua senha: ", mask: "*" })
        const cryp = new Crypto(pass)
        const encryptPass = await cryp.encrypt()
        this.state.user.push[0]
        if (encryptPass.content == this.state.user[0].value.password) {
            STYLES.sucessScreen(`Bem vindo ao ${PROJECT.name} novamente!`)
            await loading.delay(1500)
            this.dashboard()
        }
        else {
            STYLES.failScreen("Senha invalida!")
            await loading.delay(1500)
            this.intial()
        }

    }
    async dashboard() {
        console.clear()

        STYLES.profileScreen(this.state.user[0].value)
        const MENU = ['GASTOS', 'RENDA', 'RELATORIO', 'DELETAR PERFIL', 'VOLTAR']
        const msg = `${chalk.magentaBright('Gestao Financeira')}`
        const res = await select({ message: msg, choices: MENU })

        switch (res) {
            case 'GASTOS':
                await this.expenses()
                break;

            case 'RENDA':
                await this.incomes()
                break;

            case 'RELATORIO':
                await this.reports()
                break;
            case 'DELETAR PERFIL':
                console.clear()
                STYLES.profileScreen(this.state.user[0].value)
                const msg = `${chalk.magentaBright(`Deseja deletar o perfil [${chalk.red(`${this.state.user[0].value.name} - ${this.state.user[0].value.email}`)}] ? (Nao recuperavel)`)}`
                const res = await confirm({ message: msg })
                if (!res) {
                    this.dashboard()
                } else {
                    await this.deleteProfile()
                }

                break;

            case 'VOLTAR':
                await this.intial()
                break;


            default:
                break;
        }

    }
    async deleteProfile() {
        const loading = new Loading()
        const pass = await password({ message: "Digite sua senha: ", mask: "*" })
        const cryp = new Crypto(pass)
        const encryptPass = await cryp.encrypt()
        if (encryptPass.content == this.state.user[0].value.password) {
            await this.users.remove(this.state.user[0].value)
        }
        else {
            STYLES.failScreen("Senha invalida!")
            await loading.delay(1500)
        }

        this.intial()
    }
    async expenses() {
        console.clear()
        STYLES.profileScreen(this.state.user[0].value)
        const MENU = ['ADICIONAR', 'REMOVER', 'LISTAR', 'VOLTAR']
        const res = await select({ message: STYLES.expenseApp.initial, choices: MENU })
        switch (res) {
            case 'ADICIONAR':
                await this.optionsExpenses()
                break;

            case 'REMOVER':
                await this.removeExpenses()
                break;

            case 'LISTAR':
                // Lista todos os gastos (fixos/variaveis)
                await this.listExpenses()
                break;
            case 'VOLTAR':
                await this.dashboard()
                break;

            default:
                break;
        }
    }
    async optionsExpenses() {

        console.clear()
        STYLES.profileScreen(this.state.user[0].value)
        const MENU = ['VARIAVEL', 'FIXO', 'VOLTAR']
        const res = await select({ message: STYLES.expenseApp.add, choices: MENU })
        switch (res) {
            case 'VARIAVEL':
                await this.commonExpenses()
                break;

            case 'FIXO':
                await this.fixedExpenses()
                break;

            case 'VOLTAR':
                await this.expenses()
                break;

            default:
                break;
        }

    }
    async commonExpenses() {
        const loading = new Loading()
        function valueValid(input) {
            return /^[0-9.]+$/.test(input)
        }
        const msg = `Digite o valor (acrescente 1 ponto)`
        const expense = await input({ message: msg })
        const isValid = valueValid(expense)

        if (!isValid) {
            STYLES.failScreen("Valor nao aceito ...")
            await loading.delay(1500)
            await this.commonIncomes()
        } else {
            const calc = new Calc()
            const nameIncome = await input({ message: "Digite o nome do gasto" })
            const convertExpense = calc.convertToCent(expense)
            const obj = {
                id: randomUUID(),
                name: nameIncome,
                value: convertExpense,
            }
            const existExpenses = Object.hasOwn(this.state.user[0].value, 'expenses')
            if (existExpenses) {
                const existsCommonExpense = Object.hasOwn(this.state.user[0].value.expenses, 'common')
                if (existsCommonExpense) {
                    this.users.data[this.state.user[0].index].expenses["common"].push(obj)
                    const newData = {
                        users: this.users.data
                    }
                    await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                    this.users.data = newData.users
                    this.state.user[0].value = this.users.data[this.state.user[0].index]
                    STYLES.sucessScreen('Adicionado com sucesso')
                    await loading.delay(1500)
                    await this.optionsExpenses()
                } else {
                    this.users.data[this.state.user[0].index] = {
                        ...this.state.user[0].value.expenses,
                        expenses: { ...this.state.user[0].value, common: [obj] }
                    }
                    const newData = {
                        users: this.users.data
                    }
                    await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                    this.users.data = newData.users
                    this.state.user[0].value = this.users.data[this.state.user[0].index]
                    STYLES.sucessScreen('Adicionado com sucesso')
                    await loading.delay(1500)
                    await this.optionsExpenses()
                }


            } else {

                this.users.data[this.state.user[0].index] = {
                    ...this.state.user[0].value,
                    expenses: { common: [obj] }
                }
                const newData = {
                    users: this.users.data
                }
                await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                this.users.data = newData.users
                this.state.user[0].value = this.users.data[this.state.user[0].index]
                STYLES.sucessScreen('Adicionado com sucesso')
                await loading.delay(1500)
                await this.optionsExpenses()
            }
        }
    }
    async fixedExpenses() {
        const loading = new Loading()
        function valueValid(input) {
            return /^[0-9.]+$/.test(input)
        }
        const msg = `Digite o valor (acrescente 1 ponto)`
        const expense = await input({ message: msg })
        const isValid = valueValid(expense)

        if (!isValid) {
            STYLES.failScreen("Valor nao aceito ...")
            await loading.delay(1500)
            await this.fixedExpenses()
        } else {
            const calc = new Calc()
            const nameExpense = await input({ message: "Digite o nome do gasto" })
            const convertExpense = calc.convertToCent(expense)
            const obj = {
                id: randomUUID(),
                name: nameExpense,
                value: convertExpense,
            }
            const existExpenses = Object.hasOwn(this.state.user[0].value, 'expenses')
            if (existExpenses) {
                const existsFixedExpense = Object.hasOwn(this.state.user[0].value.expenses, 'fixed')
                if (existsFixedExpense) {
                    this.users.data[this.state.user[0].index].expenses["fixed"].push(obj)
                    const newData = {
                        users: this.users.data
                    }
                    await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                    this.users.data = newData.users
                    STYLES.sucessScreen('Adicionado com sucesso')
                    await loading.delay(1500)
                    await this.optionsExpenses()
                } else {

                    this.users.data[this.state.user[0].index] = {
                        ...this.state.user[0].value,
                        expenses: { ...this.state.user[0].value.expenses, fixed: [obj] }
                    }
                    const newData = {
                        users: this.users.data
                    }
                    await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                    this.users.data = newData.users
                    STYLES.sucessScreen('Adicionado com sucesso')
                    await loading.delay(1500)
                    await this.optionsExpenses()
                }
            } else {
                this.users.data[this.state.user[0].index] = {
                    ...this.state.user[0].value,
                    expenses: { fixed: [obj] }
                }
                const newData = {
                    users: this.users.data
                }
                await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                this.users.data = newData.users
                this.state.user[0].value = this.users.data[this.state.user[0].index]
                STYLES.sucessScreen('Adicionado com sucesso')
                await loading.delay(1500)
                await this.optionsExpenses()
            }
        }
    }
    async removeExpenses() {
        // console.clear()
        const loading = new Loading()
        const calc = new Calc()
        STYLES.expensesScreen(this.state.user[0].value)


        if (this.state.user[0].value.expenses !== undefined) {

            if (this.state.user[0].value.expenses.common.length == 0 && this.state.user[0].value.expenses.fixed.length == 0) {
                STYLES.colors.secondary('Nao ha gastos registrado ...')
                await loading.delay(1600)
                await this.expenses()
            }
            const msg = `Digite nome do gasto`
            const inputValue = await input({ message: msg })
            const { common, fixed } = this.state.user[0].value.expenses
            const filterCommon = common.filter((el) => el.name === inputValue)
            const filterFixed = fixed.filter((el) => el.name === inputValue)


            //  found item  
            if (filterCommon.length == 0 && filterFixed.length == 0) {
                STYLES.failScreen('Item nao encontrado ...')
                await loading.delay(1500)
                await this.expenses()
            }

            if (filterCommon.length > 0) {
                if (filterCommon.length > 1) {
                    const objToChoice = {
                        userValues: [],
                        systemValues: []

                    }
                    filterCommon.map((el) => {
                        objToChoice.systemValues.push(el)
                        objToChoice.userValues.push(`${el.name} - ${calc.convertToDecimal(el.value)}`)
                    })
                    const choice = await select({ message: STYLES.expenseApp.remove, choices: objToChoice.userValues })
                    const splitChoice = choice.split(' - ')
                    const nameOfExpense = splitChoice[0]
                    const valueOfExpense = splitChoice[1]
                    const item = objToChoice.systemValues.filter((el) => el.name === nameOfExpense && el.value === calc.convertToCent(valueOfExpense))
                    const itemId = item[0].id

                    const refFixedExpense = this.state.user[0].value.expenses.common
                    const filterId = refFixedExpense.filter((el) => el.id !== itemId)
                    this.state.user[0].value.expenses.common = filterId

                    this.users.data[this.state.user[0].index] = {
                        ...this.state.user[0].value,
                        expenses: { ...this.state.user[0].value.expenses, common: this.state.user[0].value.expenses.common }
                    }
                    const newData = {
                        users: this.users.data
                    }
                    await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                    this.users.data = newData.users
                    STYLES.sucessScreen('Removido item com sucesso')
                    loading.delay(1400)
                    await this.expenses()

                } else {
                    const objToChoice = {
                        userValues: [],
                        systemValues: []
                    }
                    filterCommon.map((el) => {
                        objToChoice.systemValues.push(el)
                        objToChoice.userValues.push(`${el.name} - ${calc.convertToDecimal(el.value)}`)
                    })
                    const itemId = objToChoice.systemValues[0].id
                    const refFixedExpense = this.state.user[0].value.expenses.common
                    const filterId = refFixedExpense.filter((el) => el.id !== itemId)
                    this.state.user[0].value.expenses.common = filterId

                    this.users.data[this.state.user[0].index] = {
                        ...this.state.user[0].value,
                        expenses: { ...this.state.user[0].value.expenses, common: this.state.user[0].value.expenses.common }
                    }
                    const newData = {
                        users: this.users.data
                    }
                    await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                    this.users.data = newData.users
                    STYLES.sucessScreen('Removido item com sucesso')
                    await loading.delay(1400)
                    await this.expenses()
                }
            }
            // > 1 item

            // > 1 item
            if (filterFixed.length > 0) {
                if (filterFixed.length > 1) {
                    const calc = new Calc()

                    const objToChoice = {
                        userValues: [],
                        systemValues: []

                    }
                    filterFixed.map((el) => {
                        objToChoice.systemValues.push(el)
                        objToChoice.userValues.push(`${el.name} - ${calc.convertToDecimal(el.value)}`)
                    })
                    const choice = await select({ message: STYLES.expenseApp.remove, choices: objToChoice.userValues })
                    const splitChoice = choice.split(' - ')
                    const nameOfExpense = splitChoice[0]
                    const valueOfExpense = splitChoice[1]
                    const item = objToChoice.systemValues.filter((el) => el.name === nameOfExpense && el.value === calc.convertToCent(valueOfExpense))
                    const itemId = item[0].id

                    const refFixedExpense = this.state.user[0].value.expenses.fixed
                    const filter = refFixedExpense.filter((el) => el.id !== itemId)
                    this.state.user[0].value.expenses.fixed = filter

                    this.users.data[this.state.user[0].index] = {
                        ...this.state.user[0].value,
                        expenses: { ...this.state.user[0].value.expenses, fixed: this.state.user[0].value.expenses.fixed }
                    }
                    const newData = {
                        users: this.users.data
                    }
                    await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                    this.users.data = newData.users
                    STYLES.sucessScreen('Removido item com sucesso')
                    await loading.delay(1400)
                    await this.expenses()
                } else {
                    const objToChoice = {
                        userValues: [],
                        systemValues: []
                    }
                    filterFixed.map((el) => {
                        objToChoice.systemValues.push(el)
                        objToChoice.userValues.push(`${el.name} - ${calc.convertToDecimal(el.value)}`)
                    })
                    const itemId = objToChoice.systemValues[0].id
                    const refFixedExpense = this.state.user[0].value.expenses.fixed
                    const filter = refFixedExpense.filter((el) => el.id !== itemId)
                    this.state.user[0].value.expenses.fixed = filter

                    this.users.data[this.state.user[0].index] = {
                        ...this.state.user[0].value,
                        expenses: { ...this.state.user[0].value.expenses, fixed: this.state.user[0].value.expenses.fixed }
                    }
                    const newData = {
                        users: this.users.data
                    }
                    await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                    this.users.data = newData.users
                    STYLES.sucessScreen('Removido item com sucesso')
                    await loading.delay(1500)
                    await this.expenses()
                }
            }
        }
        else {
            this.users.data[this.state.user[0].index] = {
                ...this.state.user[0].value,
                expenses: { common: [], fixed: [] }
            }
            const newData = {
                users: this.users.data
            }
            await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
            this.users.data = newData.users
            STYLES.colors.secondary('Nenhum gasto encontrado ...')
            await loading.delay(1400)
            await this.expenses()
        }


    }
    async listExpenses() {
        console.clear()
        const loading = new Loading()
        const userData = this.state.user[0].value
        STYLES.expensesListScreen(userData)
        // -----------------------------------------------------------------------------
        if (userData["expenses"] == undefined) {
            this.users.data[this.state.user[0].index] = {
                ...this.state.user[0].value,
                expenses: { common: [], fixed: [] }
            }
            const newData = {
                users: this.users.data
            }

            await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
            this.state.user[0].value = this.users.data[this.state.user[0].index]
            STYLES.expenseApp.listFixedTitle()
            this.state.user[0].value.expenses.common.map((el) => {
                STYLES.expenseApp.listCommon(el)
            })
            STYLES.expenseApp.listCommonTitle()
            this.state.user[0].value.expenses.fixed.map((el) => {
                STYLES.expenseApp.listFixed(el)
            })
            const input = await select({ message: "", choices: ['VOLTAR'] })
            if (input == "VOLTAR") {
                await this.expenses()
            }
        } else {
            const existCommon = userData.expenses["common"]
            const existFixed = userData.expenses["fixed"]
            if (existCommon == undefined && existFixed !== undefined) {
                this.users.data[this.state.user[0].index] = {
                    ...this.state.user[0].value,
                    expenses: { ...this.state.user[0].value.expenses.fixed, common: [] }
                }
                const newData = {
                    users: this.users.data
                }

                await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                this.state.user[0].value = this.users.data[this.state.user[0].index]
                STYLES.expenseApp.listFixedTitle()
                userData.expenses.fixed.map((el) => {
                    STYLES.expenseApp.listFixed(el)
                })
                const input = await select({ message: "", choices: ['VOLTAR'] })
                if (input == "VOLTAR") {
                    await this.expenses()
                }
            } else if (existFixed == undefined && existCommon !== undefined) {
                this.users.data[this.state.user[0].index] = {
                    ...this.state.user[0].value,
                    expenses: { ...this.state.user[0].value.expenses.common, fixed: [] }
                }
                const newData = {
                    users: this.users.data
                }

                await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                this.state.user[0].value = this.users.data[this.state.user[0].index]
                STYLES.expenseApp.listFixedTitle()
                userData.expenses.fixed.map((el) => {
                    STYLES.expenseApp.listFixed(el)
                })
                const input = await select({ message: "", choices: ['VOLTAR'] })
                if (input == "VOLTAR") {
                    await this.expenses()
                }
            } else {
                STYLES.expenseApp.listCommonTitle()
                userData.expenses.common.map((el) => {
                    STYLES.expenseApp.listCommon(el)
                })


                STYLES.expenseApp.listFixedTitle()
                userData.expenses.fixed.map((el) => {
                    STYLES.expenseApp.listFixed(el)
                })
                const input = await select({ message: "", choices: ['VOLTAR'] })
                if (input == "VOLTAR") {
                    await this.expenses()
                }
            }
        }
    }


    async incomes() {
        console.clear()
        STYLES.profileScreen(this.state.user[0].value)
        const MENU = ['ADICIONAR', 'REMOVER', 'LISTAR', 'VOLTAR']
        const res = await select({ message: STYLES.incomesApp.initial, choices: MENU })
        switch (res) {
            case 'ADICIONAR':
                await this.optionsIncome()
                break;

            case 'REMOVER':
                await this.removeIncomes()
                break;

            case 'LISTAR':
                // Lista todos os gastos (fixos/variaveis)
                await this.listIncomes()
                break;
            case 'VOLTAR':
                await this.dashboard()
                break;

            default:
                break;
        }
    }
    async optionsIncome() {

        console.clear()
        STYLES.profileScreen(this.state.user[0].value)
        const MENU = ['VARIAVEL', 'FIXA', 'VOLTAR']
        const res = await select({ message: STYLES.incomesApp.add, choices: MENU })
        switch (res) {
            case 'VARIAVEL':
                await this.commonIncomes()
                break;

            case 'FIXA':
                await this.fixedIncomes()
                break;

            case 'VOLTAR':
                await this.incomes()
                break;

            default:
                break;
        }

    }
    async commonIncomes() {
        const loading = new Loading()
        function valueValid(input) {
            return /^[0-9.]+$/.test(input)
        }
        const msg = `Digite o valor (acrescente 1 ponto)`
        const income = await input({ message: msg })
        const isValid = valueValid(income)

        if (!isValid) {
            STYLES.failScreen("Valor nao aceito ...")
            await loading.delay(1500)
            await this.commonIncomes()
        } else {
            const calc = new Calc()
            const nameIncome = await input({ message: "Digite o nome da renda" })
            const obj = {
                id: randomUUID(),
                name: nameIncome,
                value: calc.convertToCent(income)
            }
            const existsIncome = Object.hasOwn(this.state.user[0].value, 'incomes')
            if (existsIncome) {
                const existsCommonExpense = Object.hasOwn(this.state.user[0].value.incomes, 'common')
                if (existsCommonExpense) {
                    this.users.data[this.state.user[0].index].incomes["common"].push(obj)
                    const newData = {
                        users: this.users.data
                    }
                    await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                    this.users.data = newData.users
                    STYLES.sucessScreen('Adicionado com sucesso')
                    await loading.delay(1500)
                    await this.optionsIncome()
                } else {
                    this.users.data[this.state.user[0].index] = {
                        ...this.state.user[0].value.incomes,
                        incomes: { ...this.state.user[0].value, common: [obj] }
                    }
                    const newData = {
                        users: this.users.data
                    }
                    await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                    this.users.data = newData.users
                    this.state.user[0].value = this.users.data[this.state.user[0].index]
                    STYLES.sucessScreen('Adicionado com sucesso')
                    await loading.delay(1500)
                    await this.optionsIncome()
                }


            } else {

                this.users.data[this.state.user[0].index] = {
                    ...this.state.user[0].value,
                    incomes: { common: [obj] }
                }
                const newData = {
                    users: this.users.data
                }
                await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                this.users.data = newData.users
                this.state.user[0].value = this.users.data[this.state.user[0].index]
                STYLES.sucessScreen('Adicionado com sucesso')
                await loading.delay(1500)
                await this.optionsIncome()
            }
        }
    }
    async fixedIncomes() {
        const loading = new Loading()
        function valueValid(input) {
            return /^[0-9.]+$/.test(input)
        }
        const msg = `Digite o valor (acrescente 1 ponto)`
        const income = await input({ message: msg })
        const isValid = valueValid(income)

        if (!isValid) {
            STYLES.failScreen("Valor nao aceito ...")
            await loading.delay(1500)
            await this.fixedIncomes()
        } else {
            const calc = new Calc()
            const nameIncome = await input({ message: "Digite o nome da renda" })
            const obj = {
                id: randomUUID(),
                name: nameIncome,
                value: calc.convertToCent(income),
            }
            const existIncomes = Object.hasOwn(this.state.user[0].value, 'incomes')
            if (existIncomes) {
                const existFixedIncomes = Object.hasOwn(this.state.user[0].value.incomes, 'fixed')
                if (existFixedIncomes) {
                    this.users.data[this.state.user[0].index].incomes["fixed"].push(obj)
                    const newData = {
                        users: this.users.data
                    }
                    await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                    this.users.data = newData.users
                    this.state.user[0].value = this.users.data[this.state.user[0].index]
                    STYLES.sucessScreen('Adicionado com sucesso')
                    await loading.delay(1500)
                    await this.optionsIncome()
                } else {
                    this.users.data[this.state.user[0].index] = {
                        ...this.state.user[0].value,
                        incomes: { ...this.state.user[0].value.incomes, fixed: [obj] }
                    }
                    const newData = {
                        users: this.users.data
                    }
                    await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                    this.users.data = newData.users
                    STYLES.sucessScreen('Adicionado com sucesso')
                    await loading.delay(1500)
                    await this.optionsIncome()
                }
            } else {
                this.users.data[this.state.user[0].index] = {
                    ...this.state.user[0].value,
                    incomes: { fixed: [obj] }
                }
                const newData = {
                    users: this.users.data
                }
                await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                this.users.data = newData.users
                this.state.user[0].value = this.users.data[this.state.user[0].index]
                STYLES.sucessScreen('Adicionado com sucesso')
                await loading.delay(1500)
                await this.optionsIncome()
            }
        }
    }
    async removeIncomes() {
        // console.clear()
        const loading = new Loading()
        const calc = new Calc()
        STYLES.incomesScreen(this.state.user[0].value)


        if (this.state.user[0].value.incomes !== undefined) {
            if (this.state.user[0].value.incomes.common.length == 0 && this.state.user[0].value.incomes.fixed.length == 0) {
                STYLES.colors.secondary('Nao ha renda registrada ...')
                await loading.delay(1600)
                await this.incomes()
            }
            const msg = `Digite nome da renda`
            const inputValue = await input({ message: msg })
            const { common, fixed } = this.state.user[0].value.incomes
            const filterCommon = common.filter((el) => el.name === inputValue)
            const filterFixed = fixed.filter((el) => el.name === inputValue)


            if (filterCommon.length == 0 && filterFixed.length == 0) {
                STYLES.failScreen('Item nao encontrado ...')
                await loading.delay(1500)
                await this.incomes()
            }

            if (filterCommon.length > 0) {
                if (filterCommon.length > 1) {
                    const objToChoice = {
                        userValues: [],
                        systemValues: []

                    }
                    filterCommon.map((el) => {
                        objToChoice.systemValues.push(el)
                        objToChoice.userValues.push(`${el.name} - ${calc.convertToDecimal(el.value)}`)
                    })
                    const choice = await select({ message: STYLES.incomesApp.remove, choices: objToChoice.userValues })
                    const splitChoice = choice.split(' - ')
                    const nameOfIncome = splitChoice[0]
                    const valueOfIncome = splitChoice[1]
                    const item = objToChoice.systemValues.filter((el) => el.name === nameOfIncome && el.value === calc.convertToCent(valueOfIncome))
                    const itemId = item[0].id

                    const refCommonIncome = this.state.user[0].value.incomes.common
                    const filter = refCommonIncome.filter((el) => el.id !== itemId)
                    this.state.user[0].value.incomes.common = filter

                    this.users.data[this.state.user[0].index] = {
                        ...this.state.user[0].value,
                        incomes: { ...this.state.user[0].value.incomes, common: this.state.user[0].value.incomes.common }
                    }
                    const newData = {
                        users: this.users.data
                    }
                    await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                    this.users.data = newData.users
                    STYLES.sucessScreen('Removido item com sucesso')
                    loading.delay(1400)
                    await this.incomes()

                } else {
                    const objToChoice = {
                        userValues: [],
                        systemValues: []
                    }
                    filterCommon.map((el) => {
                        objToChoice.systemValues.push(el)
                        objToChoice.userValues.push(`${el.name} - ${calc.convertToDecimal(el.value)}`)
                    })
                    const itemId = objToChoice.systemValues[0].id
                    const refFixedIncome = this.state.user[0].value.incomes.common
                    const filter = refFixedIncome.filter((el) => el.id !== itemId)
                    this.state.user[0].value.incomes.common = filter

                    this.users.data[this.state.user[0].index] = {
                        ...this.state.user[0].value,
                        incomes: { ...this.state.user[0].value.incomes, common: this.state.user[0].value.incomes.common }
                    }
                    const newData = {
                        users: this.users.data
                    }
                    await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                    this.users.data = newData.users
                    STYLES.sucessScreen('Removido item com sucesso')
                    await loading.delay(1400)
                    await this.incomes()
                }
            }
            // > 1 item

            // > 1 item
            if (filterFixed.length > 0) {
                if (filterFixed.length > 1) {
                    const calc = new Calc()

                    const objToChoice = {
                        userValues: [],
                        systemValues: []

                    }
                    filterFixed.map((el) => {
                        objToChoice.systemValues.push(el)
                        objToChoice.userValues.push(`${el.name} - ${calc.convertToDecimal(el.value)}`)
                    })
                    const choice = await select({ message: STYLES.expenseApp.remove, choices: objToChoice.userValues })
                    const splitChoice = choice.split(' - ')
                    const nameOfIncome = splitChoice[0]
                    const valueOfIncome = splitChoice[1]
                    const item = objToChoice.systemValues.filter((el) => el.name === nameOfIncome && el.value === calc.convertToCent(valueOfIncome))
                    const itemId = item[0].id

                    const refFixedExpense = this.state.user[0].value.incomes.fixed
                    const filter = refFixedExpense.filter((el) => el.id !== itemId)
                    this.state.user[0].value.incomes.fixed = filter

                    this.users.data[this.state.user[0].index] = {
                        ...this.state.user[0].value,
                        incomes: { ...this.state.user[0].value.incomes, fixed: this.state.user[0].value.incomes.fixed }
                    }
                    const newData = {
                        users: this.users.data
                    }
                    await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                    this.users.data = newData.users
                    STYLES.sucessScreen('Removido item com sucesso')
                    await loading.delay(1400)
                    await this.incomes()
                } else {
                    const objToChoice = {
                        userValues: [],
                        systemValues: []
                    }
                    filterFixed.map((el) => {
                        objToChoice.systemValues.push(el)
                        objToChoice.userValues.push(`${el.name} - ${calc.convertToDecimal(el.value)}`)
                    })
                    const itemId = objToChoice.systemValues[0].id
                    const refFixedIncome = this.state.user[0].value.incomes.fixed
                    const filter = refFixedIncome.filter((el) => el.id !== itemId)
                    this.state.user[0].value.incomes.fixed = filter

                    this.users.data[this.state.user[0].index] = {
                        ...this.state.user[0].value,
                        incomes: { ...this.state.user[0].value.incomes, fixed: this.state.user[0].value.incomes.fixed }
                    }
                    const newData = {
                        users: this.users.data
                    }
                    await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                    this.users.data = newData.users
                    STYLES.sucessScreen('Removido item com sucesso')
                    await loading.delay(1500)
                    await this.incomes()
                }
            }
        } else {
            this.users.data[this.state.user[0].index] = {
                ...this.state.user[0].value,
                incomes: { common: [], fixed: [] }
            }
            const newData = {
                users: this.users.data
            }
            await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
            this.users.data = newData.users
            STYLES.colors.secondary('Nenhuma renda encontrada ...')
            await loading.delay(1400)
            await this.incomes()
        }


    }
    async listIncomes() {
        console.clear()
        const loading = new Loading()
        const userData = this.state.user[0].value
        STYLES.incomesListScreen(userData)
        // -----------------------------------------------------------------------------
        if (userData["incomes"] == undefined) {
            this.users.data[this.state.user[0].index] = {
                ...this.state.user[0].value,
                incomes: { common: [], fixed: [] }
            }
            const newData = {
                users: this.users.data
            }

            await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
            this.state.user[0].value = this.users.data[this.state.user[0].index]
            STYLES.incomesApp.listCommonTitle()
            this.state.user[0].value.incomes.common.map((el) => {
                STYLES.incomesApp.listCommon(el)
            })
            STYLES.incomesApp.listFixedTitle()
            this.state.user[0].value.incomes.fixed.map((el) => {
                STYLES.incomesApp.listFixed(el)
            })
            const input = await select({ message: "", choices: ['VOLTAR'] })
            if (input == "VOLTAR") {
                await this.incomes()
            }
        } else {
            const existCommon = userData.incomes["common"]
            const existFixed = userData.incomes["fixed"]
            if (existCommon == undefined && existFixed !== undefined) {
                this.users.data[this.state.user[0].index] = {
                    ...this.state.user[0].value,
                    incomes: { ...this.state.user[0].value.incomes.fixed, common: [] }
                }
                const newData = {
                    users: this.users.data
                }

                await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                this.state.user[0].value = this.users.data[this.state.user[0].index]
                STYLES.incomesApp.listFixedTitle()
                userData.incomes.fixed.map((el) => {
                    STYLES.incomesApp.listFixed(el)
                })
                const input = await select({ message: "", choices: ['VOLTAR'] })
                if (input == "VOLTAR") {
                    await this.incomes()
                }
            } else if (existFixed == undefined && existCommon !== undefined) {
                this.users.data[this.state.user[0].index] = {
                    ...this.state.user[0].value,
                    incomes: { ...this.state.user[0].value.incomes.common, fixed: [] }
                }
                const newData = {
                    users: this.users.data
                }

                await fs.writeFile(PROJECT.filePath, JSON.stringify(newData, null, 2))
                this.state.user[0].value = this.users.data[this.state.user[0].index]
                STYLES.incomesApp.listFixedTitle()
                userData.incomes.fixed.map((el) => {
                    STYLES.incomesApp.listFixed(el)
                })
                const input = await select({ message: "", choices: ['VOLTAR'] })
                if (input == "VOLTAR") {
                    await this.incomes()
                }
            } else {
                STYLES.incomesApp.listCommonTitle()
                userData.incomes.common.map((el) => {
                    STYLES.incomesApp.listCommon(el)
                })


                STYLES.incomesApp.listFixedTitle()
                userData.incomes.fixed.map((el) => {
                    STYLES.incomesApp.listFixed(el)
                })
                const input = await select({ message: "", choices: ['VOLTAR'] })
                if (input == "VOLTAR") {
                    await this.incomes()
                }
            }
        }
    }

    async reports() {
        console.clear()
        const loading = new Loading()
        const calc = new Calc()
        const userData = this.state.user[0].value
        const hasCommmonExpenses = userData.expenses.common.length > 0 ? true : false
        const hasFixedExpenses = userData.expenses.fixed.length > 0 ? true : false
        const hasCommmonIncomes = userData.incomes.common.length > 0 ? true : false
        const hasFixedIncomes = userData.incomes.fixed.length > 0 ? true : false
        const validate = {
            hasCommmonExpenses,
            hasFixedExpenses,
            hasCommmonIncomes,
            hasFixedIncomes
        }
        function isPossibleGenerateReport(validate) {
            validate.hasCommmonExpenses
            validate.hasFixedExpenses
            validate.hasCommmonIncomes
            validate.hasFixedIncomes
            if (validate.hasCommmonExpenses || validate.hasFixedExpenses && validate.hasCommmonIncomes || validate.hasFixedIncomes) {
                return true
            } else {
                return false
            }
        }
        const isPossibleGenerate = isPossibleGenerateReport(validate)
        if (!isPossibleGenerate) {
            STYLES.reportsScreen(userData)
            STYLES.failScreen("E preciso ter rendas e gastos para gerar relatorio ...")
            await loading.delay(2500)
            await this.dashboard()
        } else {
            STYLES.reportsScreen(userData)

            const valueOfAllCommonIncomes = this.state.user[0].value.incomes.common.reduce((acc, el) => acc + el.value, 0)
            const valueOfAllFixedIncomes = this.state.user[0].value.incomes.fixed.reduce((acc, el) => acc + el.value, 0)

            const valueOfAllCommonExpenses = this.state.user[0].value.expenses.common.reduce((acc, el) => acc + el.value, 0)
            const valueOfAllFixedExpenses = this.state.user[0].value.expenses.fixed.reduce((acc, el) => acc + el.value, 0)

            const sumAllIncomes = valueOfAllCommonIncomes + valueOfAllFixedIncomes
            const sumAllExpenses = valueOfAllCommonExpenses + valueOfAllFixedExpenses
            const profit = sumAllIncomes - sumAllExpenses
            const balance = (sumAllIncomes / sumAllExpenses) * 100

            const convertSummAllExpenses = calc.convertToDecimal(sumAllExpenses)
            const convertSumAllIncomes = calc.convertToDecimal(sumAllIncomes)
            const convertBalance = calc.convertToDecimal(balance)
            const converProfit = calc.convertToDecimal(profit)



            STYLES.incomesApp.listFixedTitle()
            this.state.user[0].value.incomes.fixed.map((el) => {
                STYLES.incomesApp.listFixed(el)
            })

            STYLES.incomesApp.listCommonTitle()
            this.state.user[0].value.incomes.common.map((el) => {
                STYLES.incomesApp.listCommon(el)
            })

            STYLES.expenseApp.listFixedTitle()
            this.state.user[0].value.expenses.fixed.map((el) => {
                STYLES.expenseApp.listFixed(el)
            })
            STYLES.expenseApp.listCommonTitle()
            this.state.user[0].value.expenses.common.map((el) => {
                STYLES.expenseApp.listCommon(el)
            })

            STYLES.reportsApp.divisionLine()

            STYLES.reportsApp.allExpenses(convertSummAllExpenses)
            STYLES.reportsApp.allIncomes(convertSumAllIncomes)
            STYLES.reportsApp.balance(convertBalance)
            STYLES.reportsApp.profit(converProfit)

            const choices = ["VOLTAR"]
            const choice = await select({ message: "", choices: choices })

            switch (choice[0]) {
                case 'VOLTAR': await this.dashboard()
                    break;
                default: await this.dashboard()
            }
        }


    }

}