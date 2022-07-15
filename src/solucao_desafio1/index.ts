// Versão 1
interface IEmployee {
    name: string
    code: number
}

// Versão 2
type TEmployee = {
    name: string
    code: number
}

// Versão 3
const employee1: { name: string, code: number } = {
    name: 'Empregado 1',
    code: 1
}
employee1.name = 'Empregado 1.1';
employee1.code = 1.1;

// Versão 1.1
const employee2: IEmployee = {
    name: 'Empregado 2',
    code: 2
}

// Versão 2.1
const employee3: TEmployee = {
    name: 'Empregado 3',
    code: 3
}

// Versão 1.2
const employee4 = {} as IEmployee;
employee4.name = 'Empregado 4';
employee4.code = 4;

// Versão 2.2
const employee5 = {} as TEmployee;
employee5.name = 'Empregado 5';
employee5.code = 5;

console.log(employee1);
console.log(employee2);
console.log(employee3);
console.log(employee4);
console.log(employee5);