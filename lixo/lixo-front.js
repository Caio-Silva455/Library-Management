import { config } from "./server.js";

async function buscarDadosDaProcedure() {
  try {
    const resposta = await fetch("http://localhost:3000/dados-procedure");
    const dados = await resposta.json();

    const div = document.getElementById("result");
    div.innerHTML = JSON.stringify(dados, null, 2);
  } catch (erro) {
    document.getElementById("result").innerText = "Erro ao executar procedure.";
    console.error(erro);
  }
}


async function carregarDados() {
  try {
    const sql = require('mssql');
    sql.connect(config)


    const dados = await resposta.json();

    const ul = document.getElementById("lista-itens");
    ul.innerHTML = ""; 

  
    dados.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item.nome_item; 
      ul.appendChild(li);
    });
  } catch (erro) {
    console.error("Erro ao buscar dados:", erro);
    document.getElementById("lista-itens").innerHTML =
      "<li>Erro ao carregar dados.</li>";
  }
}


carregarDados();


