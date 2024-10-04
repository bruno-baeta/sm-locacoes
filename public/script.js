// public/script.js

// Carregar a lista de tabelas e iniciar com a tabela "veículos" já exibida
document.addEventListener('DOMContentLoaded', () => {
    carregarTabelas().then(() => {
        const primeiroElemento = document.querySelector('.tabela-card');
        carregarDados('veiculos', primeiroElemento);
    });
});

// Função para carregar as tabelas no menu lateral
async function carregarTabelas() {
    try {
        // Fazendo uma requisição para o backend para obter as tabelas
        const response = await fetch('/tabelas');
        if (!response.ok) {
            throw new Error(`Erro ao buscar tabelas: ${response.statusText}`);
        }

        let tabelas = await response.json();
        console.log('Tabelas carregadas:', tabelas); // Log de depuração

        // Remover as duas últimas tabelas da lista (conforme solicitado)
        tabelas = tabelas.slice(0, -2);

        const divTabelas = document.getElementById('tabelas');
        if (tabelas.length === 0) {
            divTabelas.innerHTML = `<p>Nenhuma tabela encontrada no banco de dados.</p>`;
            return;
        }

        // Preencher o menu com as tabelas disponíveis, capitalizando o nome e colocando em negrito
        divTabelas.innerHTML = tabelas.map(t => `
        <div class="tabela-card" onclick="carregarDados('${t.table_name}', this)">
          ${capitalizarNomeTabela(t.table_name)}
        </div>
      `).join('');

    } catch (error) {
        console.error('Erro ao carregar tabelas:', error);
        alert('Erro ao carregar tabelas. Verifique se o servidor está funcionando corretamente.');
    }
}

// Função para carregar os dados de uma tabela específica e marcar o item ativo no menu
async function carregarDados(tabela, elementoSelecionado = null) {
    try {
        // Atualiza o título da tabela
        const tituloTabela = document.getElementById('titulo-tabela');
        tituloTabela.innerText = capitalizarNomeTabela(tabela);

        // Faz uma requisição para obter os dados da tabela especificada
        const response = await fetch(`/tabela/${tabela}`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar dados da tabela ${tabela}: ${response.statusText}`);
        }

        const dadosTabela = await response.json();
        console.log(`Dados da tabela ${tabela}:`, dadosTabela); // Log de depuração

        // Manipulando a tabela HTML para exibir os dados recebidos
        const conteudoDados = document.getElementById('conteudo-dados');
        if (dadosTabela.length === 0) {
            conteudoDados.innerHTML = `<p>Nenhum dado encontrado na tabela ${tabela}</p>`;
            return;
        }

        // Cria o cabeçalho da tabela
        const headers = Object.keys(dadosTabela[0]);
        let headerHTML = '<thead><tr>' + headers.map(header => `<th>${header}</th>`).join('') + '</tr></thead>';

        // Cria o conteúdo das linhas da tabela
        const rowsHTML = dadosTabela.map(row => {
            return '<tr>' + headers.map(header => {
                let cellValue = row[header];

                // Verifica se o valor é uma data em formato ISO e converte para "YYYY-MM-DD"
                if (typeof cellValue === 'string' && cellValue.match(/^\d{4}-\d{2}-\d{2}T/)) {
                    cellValue = new Date(cellValue).toISOString().split('T')[0];
                }

                return `<td>${cellValue ?? '-'}</td>`;
            }).join('') + '</tr>';
        }).join('');

        conteudoDados.innerHTML = headerHTML + '<tbody>' + rowsHTML + '</tbody>';

        // Marcar o item selecionado no menu lateral
        if (elementoSelecionado) {
            const itensMenu = document.querySelectorAll('.tabela-card');
            itensMenu.forEach(item => item.classList.remove('active'));
            elementoSelecionado.classList.add('active');
        }
    } catch (error) {
        console.error(`Erro ao carregar dados da tabela ${tabela}:`, error);
        alert(`Erro ao carregar dados da tabela ${tabela}. Verifique se o servidor está funcionando corretamente.`);
    }
}

// Função para capitalizar a primeira letra de cada palavra do nome da tabela
function capitalizarNomeTabela(nome) {
    return nome
        .split('_') // No caso de tabelas compostas, separa por "_"
        .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1)) // Capitaliza cada palavra
        .join(' ');
}
