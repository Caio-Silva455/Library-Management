// frontend/pages/historico.js

async function carregarHistorico() {
  const container = document.getElementById("tabela-historico-container");
  const inputBusca = document.getElementById("input-busca-historico");

  if (!container) return;

  const termo = inputBusca ? inputBusca.value.trim() : "";

  container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-[250px] text-slate-500">
            <div class="animate-spin text-4xl mb-4">⏳</div>
            <p class="text-lg font-medium">Buscando registros no SQL Server...</p>
        </div>
    `;

  try {
    let url = "http://localhost:4000/historico";
    if (termo) url += `?busca=${encodeURIComponent(termo)}`;

    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error("Erro na requisição");
    const dados = await resposta.json();

    if (!dados || dados.length === 0) {
      container.innerHTML = `
                <div class="flex flex-col items-center justify-center h-[250px] text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6">
                    <div class="text-5xl mb-3"><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  fill="currentColor"
                  class="bi bi-clipboard-fill"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 1.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5zm-5 0A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5v1A1.5 1.5 0 0 1 9.5 4h-3A1.5 1.5 0 0 1 5 2.5zm-2 0h1v1A2.5 2.5 0 0 0 6.5 5h3A2.5 2.5 0 0 0 12 2.5v-1h1a2 2 0 0 1 2 2V14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3.5a2 2 0 0 1 2-2"
                  />
                </svg></div>
                    <p class="text-lg font-medium">Nenhum histórico encontrado</p>
                    <p class="text-xs text-slate-400 mt-1">Não existem empréstimos registrados com o termo "${termo || "geral"}".</p>
                </div>
            `;
      return;
    }

    container.innerHTML = `
            <table class="w-full text-left border-collapse bg-white text-sm">
                <thead>
                    <tr class="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <th class="p-4">ID</th>
                        <th class="p-4">Aluno</th>
                        <th class="p-4">Livro / Exemplar</th>
                        <th class="p-4">Empréstimo</th>
                        <th class="p-4">Devolução</th>
                        <th class="p-4">Situação da Multa</th>
                        <th class="p-4">Observações</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-600">
                    ${dados
                      .map((item) => {
                        const nomeAluno =
                          item.nome_aluno ??
                          item.NOME_ALUNO ??
                          item.nome ??
                          "N/A";
                        const tituloLivro =
                          item.titulo_livro ??
                          item.TITULO_LIVRO ??
                          item.titulo ??
                          "N/A";
                        const idExemplar =
                          item.idExemplarEmprestado ??
                          item.idExemplar ??
                          item.id_exemplar ??
                          "-";

                        const dataEmprestimoRaw =
                          item.data_emprestimo ?? item.DATA_EMPRESTIMO;
                        const dataDevolucaoRaw =
                          item.data_devolucao ?? item.DATA_DEVOLUCAO;
                        const dataMultaRaw =
                          item.data_pagamento_multa ??
                          item.DATA_PAGAMENTO_MULTA;
                        const descricaoRaw =
                          item.descricao ?? item.DESCRICAO ?? "";

                        // Formatação amigável de datas
                        const dataEmp = dataEmprestimoRaw
                          ? new Date(dataEmprestimoRaw).toLocaleDateString(
                              "pt-BR",
                            )
                          : "N/A";
                        const dataDev = dataDevolucaoRaw
                          ? new Date(dataDevolucaoRaw).toLocaleDateString(
                              "pt-BR",
                            )
                          : '<span class="text-amber-600 font-semibold">⚠️ Pendente</span>';

                        let statusMulta =
                          '<span class="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">Sem Multa</span>';
                        if (dataMultaRaw) {
                          statusMulta = `<span class="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold">Paga em ${new Date(dataMultaRaw).toLocaleDateString("pt-BR")}</span>`;
                        } else if (
                          descricaoRaw &&
                          descricaoRaw.toLowerCase().includes("atraso")
                        ) {
                          statusMulta = `<span class="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-circle-fill" viewBox="0 0 16 16">
  <circle cx="8" cy="8" r="8"/>
</svg> Débito Aberto</span>`;
                        }

                        return `
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="p-4 font-bold text-slate-400">${id}</td>
                                <td class="p-4 font-bold text-slate-800">${nomeAluno}</td>
                                <td class="p-4">
                                    <div class="font-medium text-slate-700">${tituloLivro}</div>
                                    <div class="text-xs text-slate-400 font-mono">Exemplar ID: ${idExemplar}</div>
                                </td>
                                <td class="p-4 font-mono">${dataEmp}</td>
                                <td class="p-4 font-mono">${dataDev}</td>
                                <td class="p-4">${statusMulta}</td>
                                <td class="p-4 text-xs italic max-w-xs truncate" title="${descricaoRaw}">${descricaoRaw || '<span class="text-slate-300">Nenhuma</span>'}</td>
                            </tr>
                        `;
                      })
                      .join("")}
                </tbody>
            </table>
        `;
  } catch (error) {
    console.error("Erro ao renderizar histórico:", error);
    container.innerHTML = `
            <div class="p-6 text-center text-red-500 font-medium bg-red-50 rounded-xl border border-red-200">
                ⚠️ Erro ao conectar ou renderizar dados do barramento Back-end.
            </div>
        `;
  }
}

function limparFiltro() {
  const inputBusca = document.getElementById("input-busca-historico");
  if (inputBusca) inputBusca.value = "";
  carregarHistorico();
}

document.addEventListener("DOMContentLoaded", () => {
  carregarHistorico();

  const inputBusca = document.getElementById("input-busca-historico");
  if (inputBusca) {
    inputBusca.addEventListener("keypress", (e) => {
      if (e.key === "Enter") carregarHistorico();
    });
  }
});
