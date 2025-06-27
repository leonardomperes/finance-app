import { dirname, join } from 'path';
const projectRoot = dirname(".");
const filePath = join(projectRoot, 'data', 'users.json');
export const PROJECT = {
    name: "FINANCE-APP",
    projectRoot,
    filePath,
    author:"Leonardo Peres",
    github:'https://github.com/leonardomperes'
}