// Versão 1
type TProfissao = 'Atriz' | 'Padeiro';

interface IPessoa {
    nome: string
    idade: number
    profissao: TProfissao
}

const pessoa1: IPessoa = {
    nome: "Maria",
    idade: 29,
    profissao: "Atriz"
}

const pessoa2 = {
    nome: "Roberto",
    idade: 19,
    profissao: "Padeiro"
} as IPessoa;

// Versão 2
enum Profissao {
    Atriz = 'Atriz',
    Padeiro = 'Padeiro'
}

class Pessoa {
    constructor(
        public nome: string,
        public idade: number,
        public profissao: Profissao
    ){}
}

const pessoa3 = new Pessoa("Laura", 32, Profissao.Atriz);
const pessoa4 = new Pessoa("Carlos", 10, Profissao.Padeiro);


// Versão 3
type pessoaProcurandoAPrimeiraVaga = {
    nome: string
    idade: number
    profissao?: 'Programador' | 'Desenvolvedor' | 'Programador de Aplicações' | 'Desenvolvedor de Softwares' | 'Engenheiro de Software' | 'Eis a questão';
}

const nickolas: pessoaProcurandoAPrimeiraVaga = {
    nome: "Nickolas",
    idade: 22
}
nickolas.profissao = "Eis a questão";

console.log(pessoa1);
console.log(pessoa2);
console.log(pessoa3);
console.log(pessoa4);
console.log(nickolas);