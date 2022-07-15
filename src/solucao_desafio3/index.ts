const botaoAtualizar = document.getElementById('atualizar-saldo') as HTMLButtonElement;
const botaoLimpar = document.getElementById('limpar-saldo') as HTMLButtonElement;
const inputSoma = document.getElementById('input-soma') as HTMLInputElement;
const campoSaldo = document.getElementById('campo-saldo') as HTMLSpanElement;

let saldoTotal: number = 0;

function pegaValorInput(): number {
    const valor = Number(inputSoma.value);
    return valor || 0;
}

function limpaValorInput(): void {
    inputSoma.value = "";
}

function atualizarCampoSaldo() {
    campoSaldo.innerText = saldoTotal.toString();
}

function somarAoSaldo(valor: number): void {
    saldoTotal += valor;
}

function zerarValorSaldo(): void {
    saldoTotal = 0;
}

if(campoSaldo){
    atualizarCampoSaldo();
}

botaoAtualizar?.addEventListener('click', () => {
    if(inputSoma && campoSaldo) {
        somarAoSaldo(pegaValorInput());
        limpaValorInput();
        atualizarCampoSaldo();
    }
});

botaoLimpar?.addEventListener('click', () => {
    if(inputSoma && campoSaldo) {
        limpaValorInput();
        zerarValorSaldo();
        atualizarCampoSaldo();
    }
});