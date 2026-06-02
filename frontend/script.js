const API_URL = "http://localhost:4000";

// Mapeamento centralizado de tabelas → rotas
const ROTA_MAP = {
  "Autor": "autores",
  "Aluno": "alunos",
  "Livro": "livros",
  "Cidade": "cidades",
  "Editora": "editoras",
  "Historico": "historico",
  "Area_Conhecimento": "areas-conhecimento",
  "state": "estados"
};

async function executarBuscaGeral() {
  const container = document.getElementById("container-tabela-resultados");
  const txtTotal = document.getElementById("total-registros");
  const txtTipoBusca = document.getElementById("tipo-busca-atual");
  const txtStatus = document.getElementById("status-servidor");

  const tabelaSelecionada = document.getElementById("select-tabela").value;
  const termoBusca = document.getElementById("input-busca").value.trim();

  if (!container) return;

  const rota = ROTA_MAP[tabelaSelecionada];
  if (!rota) {
    container.innerHTML = `<div class="flex items-center justify-center h-[220px] text-slate-400">Tabela não mapeada.</div>`;
    return;
  }

  container.innerHTML = `
    <div class="flex flex-col items-center justify-center h-[220px] text-slate-500">
        <div class="animate-spin text-4xl mb-4">⏳</div>
        <p class="text-lg font-medium">Consultando tabelas no SQL Server...</p>
    </div>
  `;

  try {
    let url = `${API_URL}/${rota}`;
    if (termoBusca !== "") {
      url += `?busca=${encodeURIComponent(termoBusca)}`;
    }

    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`Status: ${resposta.status}`);

    const dados = await resposta.json();

    if (txtTotal) txtTotal.innerText = dados.length;
    if (txtTipoBusca) txtTipoBusca.innerText = tabelaSelecionada;
    if (txtStatus) {
      txtStatus.innerText = "Online";
      txtStatus.className = "text-2xl font-bold text-emerald-500 mt-2";
    }

    if (dados.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-[220px] text-slate-400">
            <div class="text-5xl mb-4">🤷‍♂️</div>
            <p class="text-lg font-medium">Nenhum registro encontrado para "${tabelaSelecionada}"</p>
            <span class="text-sm mt-1">Tente ajustar os critérios de pesquisa ou listar a tabela completa.</span>
        </div>
      `;
      return;
    }

    // Renderiza a tabela correta
    const renderMap = {
      "Autor":              () => gerarTabelaPadrao(dados, "Nome"),
      "Editora":            () => gerarTabelaPadrao(dados, "Nome"),
      "Area_Conhecimento":  () => gerarTabelaPadrao(dados, "Área de Conhecimento"),
      "Cidade":             () => gerarTabelaCidade(dados),
      "Aluno":              () => gerarTabelaAluno(dados),
      "Livro":              () => gerarTabelaLivro(dados),
      "Historico":          () => gerarTabelaHistorico(dados),
      "state":              () => gerarTabelaPadrao(dados, "Nome do Estado")
    };

    const estruturaTabela = renderMap[tabelaSelecionada]
      ? renderMap[tabelaSelecionada]()
      : gerarTabelaPadrao(dados, "Valor");

    container.innerHTML = `
      <div class="flex items-center justify-between mb-4 px-1">
          <h2 class="text-lg font-bold text-slate-700">📋 Resultados para: ${tabelaSelecionada}</h2>
      </div>
      <div class="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">${estruturaTabela}</div>
    `;
  } catch (error) {
    console.error("Erro na busca:", error);
    if (txtTotal) txtTotal.innerText = "Erro";
    if (txtStatus) {
      txtStatus.innerText = "Offline";
      txtStatus.className = "text-2xl font-bold text-red-500 mt-2";
    }
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-[220px] text-red-500 bg-red-50 rounded-xl border border-red-100 p-4">
          <div class="text-4xl mb-2">⚠️</div>
          <p class="text-lg font-bold">Falha de comunicação com a API</p>
          <span class="text-sm text-red-400 text-center mt-1">Garanta que o servidor Node/Express esteja rodando ativamente na porta 4000.</span>
      </div>
    `;
  }
}

// ─── Funções de Renderização ──────────────────────────────────────────────────

function gerarTabelaPadrao(dados, labelColuna) {
  return `
    <table class="w-full border-collapse text-left bg-white text-sm">
        <thead>
            <tr class="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th class="p-4 w-24">ID</th>
                <th class="p-4">${labelColuna}</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-600">
            ${dados.map(item => `
                <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="p-4 font-bold text-slate-400">${item.id}</td>
                    <td class="p-4 font-medium text-slate-800">${item.nome || "Sem Nome"}</td>
                </tr>
            `).join("")}
        </tbody>
    </table>`;
}

function gerarTabelaCidade(dados) {
  return `
    <table class="w-full border-collapse text-left bg-white text-sm">
        <thead>
            <tr class="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th class="p-4 w-24">ID</th>
                <th class="p-4">Cidade</th>
                <th class="p-4">Vínculo Estado</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-600">
            ${dados.map(item => `
                <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="p-4 font-bold text-slate-400">${item.id}</td>
                    <td class="p-4 font-medium text-slate-800">${item.nome}</td>
                    <td class="p-4">
                        <span class="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-xs font-semibold">ID Ref: ${item.idEstado}</span>
                    </td>
                </tr>
            `).join("")}
        </tbody>
    </table>`;
}

function gerarTabelaAluno(dados) {
  return `
    <table class="w-full border-collapse text-left bg-white text-sm">
        <thead>
            <tr class="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th class="p-4 w-20">ID</th>
                <th class="p-4">Nome</th>
                <th class="p-4">CPF</th>
                <th class="p-4">Telefone</th>
                <th class="p-4">Turma</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-600">
            ${dados.map(item => `
                <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="p-4 font-bold text-slate-400">${item.id}</td>
                    <td class="p-4 font-bold text-slate-800">${item.nome}</td>
                    <td class="p-4 font-mono text-slate-500">${item.cpf}</td>
                    <td class="p-4 text-slate-500">${item.telefone || "N/A"}</td>
                    <td class="p-4">
                        <span class="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold">${item.turma || "N/A"}</span>
                    </td>
                </tr>
            `).join("")}
        </tbody>
    </table>`;
}

function gerarTabelaLivro(dados) {
  return `
    <table class="w-full border-collapse text-left bg-white text-sm">
        <thead>
            <tr class="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th class="p-4 w-20">ID</th>
                <th class="p-4">Título</th>
                <th class="p-4">Idioma</th>
                <th class="p-4">ISBN</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-600">
            ${dados.map(item => `
                <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="p-4 font-bold text-slate-400">${item.id}</td>
                    <td class="p-4 font-bold text-slate-800">${item.titulo}</td>
                    <td class="p-4 text-slate-500">${item.idioma || "Não informado"}</td>
                    <td class="p-4 font-mono text-xs text-slate-400">${item.isbn || "N/A"}</td>
                </tr>
            `).join("")}
        </tbody>
    </table>`;
}

function gerarTabelaHistorico(dados) {
  return `
    <table class="w-full border-collapse text-left bg-white text-sm">
        <thead>
            <tr class="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th class="p-4 w-20">ID</th>
                <th class="p-4">Aluno</th>
                <th class="p-4">Livro</th>
                <th class="p-4">Empréstimo</th>
                <th class="p-4">Devolução</th>
                <th class="p-4">Multa Paga</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-600">
            ${dados.map(item => `
                <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="p-4 font-bold text-slate-400">${item.id}</td>
                    <td class="p-4 font-bold text-slate-800">${item.nome_aluno || "N/A"}</td>
                    <td class="p-4 text-slate-700">${item.titulo_livro || "N/A"}</td>
                    <td class="p-4 text-slate-500">${item.data_emprestimo ? new Date(item.data_emprestimo).toLocaleDateString("pt-BR") : "N/A"}</td>
                    <td class="p-4 text-slate-500">${item.data_devolucao ? new Date(item.data_devolucao).toLocaleDateString("pt-BR") : 
                        '<span class="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold">Pendente</span>'}</td>
                    <td class="p-4">${item.data_pagamento_multa 
                        ? `<span class="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-bold">✔ ${new Date(item.data_pagamento_multa).toLocaleDateString("pt-BR")}</span>`
                        : `<span class="bg-slate-100 text-slate-400 px-2 py-0.5 rounded text-xs">Sem multa</span>`
                    }</td>
                </tr>
            `).join("")}
        </tbody>
    </table>`;
}

// ─── Utilitários ──────────────────────────────────────────────────────────────

function limparBuscaGeral() {
  document.getElementById("input-busca").value = "";
  executarBuscaGeral();
}

document.addEventListener("DOMContentLoaded", () => {
  executarBuscaGeral();
});