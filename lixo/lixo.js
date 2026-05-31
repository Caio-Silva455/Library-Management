const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── Configuração do banco ────────────────────────────────────────────────────
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT) || 1433, // Garante que a porta seja um número
    database: process.env.DB_NAME,
    options: { 
        encrypt: process.env.DB_ENCRYPT === 'true' || true, 
        trustServerCertificate: true 
    }
};

// Pool de conexão reutilizável
let pool;
async function getPool() {
    if (!pool) {
        pool = await sql.connect(config);
    }
    return pool;
}

// Helper: executa uma SP e retorna resultado padronizado
async function execSP(spName, paramsFn) {
    const pool = await getPool();
    const req = pool.request();
    if (paramsFn) paramsFn(req);
    return await req.execute(spName);
}

// ─── AUTOR ────────────────────────────────────────────────────────────────────

// POST /autores  →  sp_InserirAutor
app.post('/autores', async (req, res) => {
    const { nome_autor } = req.body;
    if (!nome_autor) return res.status(400).json({ erro: 'nome_autor é obrigatório' });
    try {
        await execSP('sp_InserirAutor', r =>
            r.input('nome_autor', sql.VarChar(255), nome_autor)
        );
        res.status(201).json({ mensagem: `Autor '${nome_autor}' inserido com sucesso!` });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// PUT /autores/:id  →  sp_AlterarAutor
app.put('/autores/:id', async (req, res) => {
    const { id } = req.params;
    const { nome_autor } = req.body;
    if (!nome_autor) return res.status(400).json({ erro: 'nome_autor é obrigatório' });
    try {
        await execSP('sp_AlterarAutor', r =>
            r.input('idAutor', sql.Int, parseInt(id))
             .input('nome_autor', sql.VarChar(255), nome_autor)
        );
        res.json({ mensagem: 'Autor alterado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// DELETE /autores/:id  →  sp_ExcluirAutor
app.delete('/autores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await execSP('sp_ExcluirAutor', r =>
            r.input('idAutor', sql.Int, parseInt(id))
        );
        res.json({ message: 'Autor excluído com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ─── ÁREA DE CONHECIMENTO ────────────────────────────────────────────────────

// POST /areas-conhecimento  →  sp_InserirAreaConhecimento
app.post('/areas-conhecimento', async (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });
    try {
        await execSP('sp_InserirAreaConhecimento', r =>
            r.input('nome', sql.VarChar(50), nome)
        );
        res.status(201).json({ mensagem: `Área de conhecimento '${nome}' inserida com sucesso!` });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// PUT /areas-conhecimento/:id  →  sp_AlterarAreaConhecimento
app.put('/areas-conhecimento/:id', async (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });
    try {
        await execSP('sp_AlterarAreaConhecimento', r =>
            r.input('idAreaConhecimento', sql.Int, parseInt(id))
             .input('nome', sql.VarChar(50), nome)
        );
        res.json({ mensagem: 'Área de conhecimento alterada com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// DELETE /areas-conhecimento/:id  →  sp_ExcluirAreaConhecimento
app.delete('/areas-conhecimento/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await execSP('sp_ExcluirAreaConhecimento', r =>
            r.input('idAreaConhecimento', sql.Int, parseInt(id))
        );
        res.json({ mensagem: 'Área de conhecimento excluída com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ─── ESTADO ───────────────────────────────────────────────────────────────────

// POST /estados  →  sp_InserirEstado
app.post('/estados', async (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });
    try {
        await execSP('sp_InserirEstado', r =>
            r.input('nome', sql.VarChar(100), nome)
        );
        res.status(201).json({ mensagem: `Estado '${nome}' inserido com sucesso!` });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// PUT /estados/:id  →  sp_AlterarEstado
app.put('/estados/:id', async (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });
    try {
        await execSP('sp_AlterarEstado', r =>
            r.input('idEstado', sql.Int, parseInt(id))
             .input('nome', sql.VarChar(100), nome)
        );
        res.json({ mensagem: 'Estado alterado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// DELETE /estados/:id  →  sp_ExcluirEstado
app.delete('/estados/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await execSP('sp_ExcluirEstado', r =>
            r.input('idEstado', sql.Int, parseInt(id))
        );
        res.json({ mensagem: 'Estado excluído com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ─── CIDADE ───────────────────────────────────────────────────────────────────

// POST /cidades  →  sp_InserirCidade
app.post('/cidades', async (req, res) => {
    const { nome, idEstado } = req.body;
    if (!nome || !idEstado) return res.status(400).json({ erro: 'nome e idEstado são obrigatórios' });
    try {
        await execSP('sp_InserirCidade', r =>
            r.input('nome', sql.VarChar(200), nome)
             .input('idEstado', sql.Int, parseInt(idEstado))
        );
        res.status(201).json({ mensagem: `Cidade '${nome}' inserida com sucesso!` });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// PUT /cidades/:id  →  sp_AlterarCidade
app.put('/cidades/:id', async (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });
    try {
        await execSP('sp_AlterarCidade', r =>
            r.input('idCidade', sql.Int, parseInt(id))
             .input('nome', sql.VarChar(200), nome)
        );
        res.json({ mensagem: 'Cidade alterada com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// DELETE /cidades/:id  →  sp_ExcluirCidade
app.delete('/cidades/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await execSP('sp_ExcluirCidade', r =>
            r.input('idCidade', sql.Int, parseInt(id))
        );
        res.json({ mensagem: 'Cidade excluída com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ─── ENDEREÇO ─────────────────────────────────────────────────────────────────

// POST /enderecos  →  sp_InserirEndereco
app.post('/enderecos', async (req, res) => {
    const { cep, logradouro, bairro, complemento, idcidade } = req.body;
    if (!cep || !logradouro || !bairro || !idcidade)
        return res.status(400).json({ erro: 'cep, logradouro, bairro e idcidade são obrigatórios' });
    try {
        await execSP('sp_InserirEndereco', r =>
            r.input('cep', sql.VarChar(8), cep)
             .input('logradouro', sql.VarChar(100), logradouro)
             .input('bairro', sql.VarChar(50), bairro)
             .input('complemento', sql.VarChar(50), complemento ?? null)
             .input('idcidade', sql.Int, parseInt(idcidade))
        );
        res.status(201).json({ mensagem: 'Endereço cadastrado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// PUT /enderecos/:id  →  sp_AlterarEndereco
app.put('/enderecos/:id', async (req, res) => {
    const { id } = req.params;
    const { cep, logradouro, bairro, complemento, idcidade } = req.body;
    try {
        await execSP('sp_AlterarEndereco', r =>
            r.input('idEndereco', sql.Int, parseInt(id))
             .input('cep', sql.VarChar(8), cep ?? null)
             .input('logradouro', sql.VarChar(100), logradouro ?? null)
             .input('bairro', sql.VarChar(50), bairro ?? null)
             .input('complemento', sql.VarChar(50), complemento ?? null)
             .input('idcidade', sql.Int, idcidade ? parseInt(idcidade) : null)
        );
        res.json({ mensagem: 'Endereço alterado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// DELETE /enderecos/:id  →  sp_ExcluirEndereco
app.delete('/enderecos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await execSP('sp_ExcluirEndereco', r =>
            r.input('idEndereco', sql.Int, parseInt(id))
        );
        res.json({ mensagem: 'Endereço excluído com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ─── EDITORA ──────────────────────────────────────────────────────────────────

// POST /editoras  →  sp_InserirEditora
app.post('/editoras', async (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });
    try {
        await execSP('sp_InserirEditora', r =>
            r.input('nome', sql.VarChar(100), nome)
        );
        res.status(201).json({ mensagem: `Editora '${nome}' inserida com sucesso!` });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// PUT /editoras/:id  →  sp_AlterarEditora
app.put('/editoras/:id', async (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });
    try {
        await execSP('sp_AlterarEditora', r =>
            r.input('idEditora', sql.Int, parseInt(id))
             .input('nome', sql.VarChar(100), nome)
        );
        res.json({ mensagem: 'Editora alterada com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// DELETE /editoras/:id  →  sp_ExcluirEditora
app.delete('/editoras/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await execSP('sp_ExcluirEditora', r =>
            r.input('idEditora', sql.Int, parseInt(id))
        );
        res.json({ mensagem: 'Editora excluída com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ─── Start Garantindo Conexão Prvia ──────────────────────────────────────────
const PORT = 3000;

async function iniciarServidor() {
    try {
        console.log('🔄 Conectando ao SQL Server...');
        await getPool(); // Tenta conectar antes de abrir a porta da API
        
        app.listen(PORT, () => {
            console.log(`🚀 Banco pronto e API rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Falha crítica ao conectar no Banco de Dados:', error.message);
        process.exit(1); // Encerra o script caso o banco esteja fora do ar
    }
}

iniciarServidor();