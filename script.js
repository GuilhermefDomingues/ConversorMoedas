const valorInput = document.getElementById("valor");
const moedaOrigem = document.getElementById("moeda");
const botaoConverter = document.getElementById("converter");
const resultado = document.getElementById("resultado");
const resultadoContainer = document.getElementById("resultado-container");

botaoConverter.addEventListener("click", converterMoeda);

valorInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    converterMoeda();
  }
});

async function converterMoeda() {
  const valor = Number(valorInput.value);
  const origem = moedaOrigem.value;
  const destino = "BRL";

  resultado.classList.remove("resultado-erro");
  resultadoContainer.classList.remove("show");

  if (!origem) {
    exibirErro("Selecione uma moeda.");
    return;
  }

  if (isNaN(valor) || valor <= 0) {
    exibirErro("Digite um valor válido.");
    return;
  }

  try {
    resultado.textContent = "Buscando cotação...";
    resultadoContainer.classList.add("show");
    botaoConverter.disabled = true;
    botaoConverter.textContent = "Convertendo...";

    const cotacao = await buscarCotacao(origem, destino);
    const valorConvertido = valor * cotacao;

    const valorOrigemFormatado = formatarMoeda(valor, origem);
    const valorDestinoFormatado = formatarMoeda(valorConvertido, destino);

    resultado.innerHTML = `${valorOrigemFormatado} &nbsp;=&nbsp; <strong>${valorDestinoFormatado}</strong>`;
  } catch (error) {
    exibirErro("Erro ao obter cotação. Tente novamente.");
    console.error(error);
  } finally {
    botaoConverter.disabled = false;
    botaoConverter.textContent = "Converter em reais";
  }
}

function exibirErro(mensagem) {
  resultado.textContent = mensagem;
  resultado.classList.add("resultado-erro");
  resultadoContainer.classList.add("show");
}

async function buscarCotacao(origem, destino) {
  const parDireto = `${origem}-${destino}`;
  const chaveDireta = `${origem}${destino}`;
  const urlDireta = `https://economia.awesomeapi.com.br/json/last/${parDireto}`;

  try {
    const resposta = await fetch(urlDireta);
    const dados = await resposta.json();

    if (dados[chaveDireta]) {
      return Number(dados[chaveDireta].bid);
    }
  } catch (error) {
    // Silently fall back to inverse rate
  }

  const parInverso = `${destino}-${origem}`;
  const chaveInversa = `${destino}${origem}`;
  const urlInversa = `https://economia.awesomeapi.com.br/json/last/${parInverso}`;

  const respostaInversa = await fetch(urlInversa);
  const dadosInversos = await respostaInversa.json();

  if (!dadosInversos[chaveInversa]) {
    throw new Error("Cotação não encontrada.");
  }

  const cotacaoInversa = Number(dadosInversos[chaveInversa].bid);

  return 1 / cotacaoInversa;
}

function formatarMoeda(valor, moeda) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda
  }).format(valor);
}
