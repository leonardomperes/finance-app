import chalk from "chalk";
import { Calc } from "../../utils/Calc.js";
import { PROJECT } from "../../constants.js";
const calc = new Calc()
export const STYLES = {
    homeScreen: () => console.log(chalk.greenBright(PROJECT.name), chalk.blueBright(`> HOME`)),
    loginScreen: () => console.log(chalk.greenBright(PROJECT.name), chalk.blueBright(`> LOGIN`)),
    newProfileScreen: () => console.log(chalk.greenBright(PROJECT.name), chalk.greenBright(`> HOME`), chalk.blueBright(`> NEW-PROFILE`)),
    profileScreen: (user) => console.log(chalk.greenBright(PROJECT.name), chalk.blueBright(`> PROFILE`), chalk.yellowBright(`[${user.name} - ${user.email}]`)),
    expensesScreen: (user) => console.log(chalk.greenBright(PROJECT.name), chalk.greenBright(`> PROFILE`), chalk.yellowBright(`[${user.name} - ${user.email}]`), chalk.greenBright(`> GASTOS`), chalk.blueBright(`> REMOVER`)),
    incomesScreen: (user) => console.log(chalk.greenBright(PROJECT.name), chalk.greenBright(`> PROFILE`), chalk.yellowBright(`[${user.name} - ${user.email}]`), chalk.greenBright(`> RENDAS`), chalk.blueBright(`> REMOVER`)),
    expensesListScreen: (user) => console.log(chalk.greenBright(PROJECT.name), chalk.greenBright(`> PROFILE`), chalk.yellowBright(`[${user.name} - ${user.email}]`), chalk.greenBright(`> GASTOS`), chalk.blueBright(`> LISTAR`)),
    incomesListScreen: (user) => console.log(chalk.greenBright(PROJECT.name), chalk.greenBright(`> PROFILE`), chalk.yellowBright(`[${user.name} - ${user.email}]`), chalk.greenBright(`> RENDAS`), chalk.blueBright(`> LISTAR`)),
    reportsScreen: (user) => console.log(chalk.greenBright(PROJECT.name), chalk.greenBright(`> PROFILE`), chalk.yellowBright(`[${user.name} - ${user.email}]`), chalk.blueBright(`> RELATORIO`)),
    dashbordScreen: () => console.log(chalk.greenBright(PROJECT.name), chalk.greenBright(`> PERFIL`), chalk.blueBright(`> TRABALHO`)),
    colors: {
        primary: (text) => console.log(chalk.greenBright(text)),
        secondary: (text) => console.log(chalk.blueBright(text)),
        third: (text) => console.log(chalk.yellowBright(text)),
        danger: (text) => console.log(chalk.redBright(text)),
        success: (text) => console.log(chalk.greenBright(text))
    },
    exitScreen: () => console.log(`
            ${chalk.italic.green(`Saindo do ${PROJECT.name} ...`)}
            ${chalk.italic.yellow(`Feito por ${PROJECT.author} 🧑‍💻`)}
            ${chalk.italic.cyan(`GITHUB: ${PROJECT.github}`)}
            ${chalk.italic.magenta(`Deixe ⭐  Obrigado!`)}
        `
    ),
    sucessScreen: (text) => console.log(chalk.greenBright(text)),
    failScreen: (text) => console.log(chalk.redBright(text)),
    titleApp: chalk.magentaBright('Gestao Financeira'),
    expenseApp: {
        initial: chalk.magentaBright(`Gestao Financeira ${chalk.blueBright('> GASTOS')}`),
        add: chalk.magentaBright(`Gestao Financeira ${chalk.blueBright('> GASTOS > ADICIONAR')}`),
        remove: chalk.magentaBright(`Gestao Financeira ${chalk.blueBright('> GASTOS > REMOVER')}`),
        listCommonTitle: () => console.log(chalk.magentaBright(`Gastos variaveis`)),
        listCommon: (data) => console.log(`${chalk.gray(data.name)} - ${chalk.redBright(calc.convertToDecimal(data.value))}`),
        listFixedTitle: () => console.log(chalk.magentaBright(`Gastos fixos`)),
        listFixed: (data) => console.log(`${chalk.gray(data.name)} - ${chalk.redBright(calc.convertToDecimal(data.value))}`),
    },
    incomesApp: {
        initial: chalk.magentaBright(`Gestao Financeira ${chalk.blueBright('> RENDA')}`),
        add: chalk.magentaBright(`Gestao Financeira ${chalk.blueBright('> RENDA > ADICIONAR')}`),
        remove: chalk.magentaBright(`Gestao Financeira ${chalk.blueBright('> RENDA > REMOVER')}`),
        listCommonTitle: () => console.log(chalk.magentaBright(`Rendas variaveis`)),
        listCommon: (data) => console.log(`${chalk.gray(data.name)} - ${chalk.greenBright(calc.convertToDecimal(data.value))}`),
        listFixedTitle: () => console.log(chalk.magentaBright(`Rendas fixas`)),
        listFixed: (data) => console.log(`${chalk.gray(data.name)} - ${chalk.greenBright(calc.convertToDecimal(data.value))}`),
    },
    reportsApp: {
        initial: chalk.magentaBright(`Gestao Financeira ${chalk.blueBright('> RELATORIO')}`),
        allExpenses: (value) => console.log(chalk.magentaBright(`Gastos totais => ${chalk.redBright(value)}`)),
        allIncomes: (value) => console.log(chalk.magentaBright(`Rendas totais => ${chalk.greenBright(value)}`)),
        balance: (value) => {
            if (value < 1) {
                console.log(chalk.redBright(`Balanco(-) => ${chalk.redBright(value)}`))
            } else if (value > 1) {
                console.log(chalk.magentaBright(`Balanco(+) => ${chalk.greenBright(value)}`))
            } else {
                console.log(chalk.magentaBright(`Balanco(neutro) => ${chalk.blueBright(value)}`))
            }
        },
        profit: (value) => {
            if (value >= 0) {
                console.log(chalk.greenBright(`Lucro(+) => ${chalk.greenBright(value)}`))
            } else if (value < 0) {
                console.log(chalk.redBright(`Lucro(-) => ${chalk.redBright(value)}`))
            } else {
                console.log(chalk.magentaBright(`Lucro(neutro) => ${chalk.blueBright(value)}`))
            }
        },
        divisionLine: () => console.log(chalk.blueBright(`-------------------------- Resumo --------------------------`))
    }
}