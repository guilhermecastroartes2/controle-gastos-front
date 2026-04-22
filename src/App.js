import { useEffect, useState } from "react";

function App() {
  const [logado, setLogado] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [transacoes, setTransacoes] = useState([]);
  
  // Estados para o formulário
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("despesa");

  // --- NOVOS ESTADOS PARA FILTROS ---
  const [filtroTipo, setFiltroTipo] = useState("todos"); // todos, receita, despesa
  const [filtroData, setFiltroData] = useState(""); // para pesquisar por data

  const API_URL = "https://controle-gastos-api-bfph.onrender.com";

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) { setEmail(user); setLogado(true); }
  }, []);

  useEffect(() => {
    if (logado) buscarDados();
  }, [logado, email]);

  const buscarDados = () => {
    fetch(`${API_URL}/transacoes?email=${email}`)
      .then(res => res.json())
      .then(setTransacoes);
  };

  const adicionar = () => {
    if (!valor || !categoria) return alert("Preencha os campos!");
    fetch(`${API_URL}/transacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, valor, categoria, tipo, descricao })
    }).then(() => {
      setValor(""); setCategoria(""); setDescricao("");
      buscarDados(); // Recarrega a lista do banco
    });
  };

  // --- LÓGICA DE FILTRAGEM ---
  const transacoesFiltradas = transacoes.filter(t => {
    const bateTipo = filtroTipo === "todos" || t.tipo === filtroTipo;
    const bateData = filtroData === "" || t.data.includes(filtroData);
    return bateTipo && bateData;
  });

  if (!logado) {
    return (
      <div style={containerLogin}>
        <h1>💰 Controle de Gastos</h1>
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Senha" onChange={(e) => setSenha(e.target.value)} style={inputStyle} />
        <button onClick={() => setLogado(true)} style={btn}>Entrar</button>
      </div>
    );
  }

  return (
    <div style={containerApp}>
      <header style={headerStyle}>
        <h2>💰 Controle de Gastos</h2>
        <button onClick={() => {localStorage.clear(); window.location.reload();}} style={btnSair}>Sair</button>
      </header>

      {/* SEÇÃO DE BUSCA E FILTROS */}
      <div style={card}>
        <h4>Pesquisar Transações</h4>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input 
            type="date" 
            onChange={(e) => setFiltroData(e.target.value.split('-').reverse().join('/'))} 
            style={inputStyle} 
          />
          <button onClick={() => setFiltroData("")} style={{...btn, width: '80px', background: '#ccc'}}>Limpar</button>
        </div>

        <div style={flexRow}>
          <button onClick={() => setFiltroTipo("todos")} style={filtroTipo === "todos" ? btnAtivo : btnInativo}>Todos</button>
          <button onClick={() => setFiltroTipo("receita")} style={filtroTipo === "receita" ? btnReceita : btnInativo}>Receitas</button>
          <button onClick={() => setFiltroTipo("despesa")} style={filtroTipo === "despesa" ? btnDespesa : btnInativo}>Despesas</button>
        </div>
      </div>

      {/* LISTAGEM FILTRADA */}
      <div style={card}>
        <h3>{filtroTipo === "todos" ? "Todas Transações" : filtroTipo.toUpperCase()}</h3>
        {transacoesFiltradas.length === 0 ? <p>Nenhum registro encontrado.</p> : 
          transacoesFiltradas.map(t => (
            <div key={t.id} style={itemLista}>
              <div>
                <b style={{textTransform: 'capitalize'}}>{t.categoria}</b> <br/>
                <small>{t.data} - {t.descricao}</small>
              </div>
              <span style={{ color: t.tipo === 'receita' ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                {t.tipo === 'receita' ? '+' : '-'} R$ {parseFloat(t.valor).toFixed(2)}
              </span>
            </div>
          ))
        }
      </div>

      {/* FORMULÁRIO DE ADIÇÃO (FIXO NO FINAL OU ABAIXO) */}
      <div style={card}>
        <h3>Novo Lançamento</h3>
        <input type="number" placeholder="Valor" value={valor} onChange={(e) => setValor(e.target.value)} style={inputStyle} />
        <input placeholder="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} style={inputStyle} />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={inputStyle}>
          <option value="despesa">Despesa</option>
          <option value="receita">Receita</option>
        </select>
        <button onClick={adicionar} style={btn}>Adicionar</button>
      </div>
    </div>
  );
}

// --- ESTILOS ---
const containerApp = { maxWidth: 500, margin: "0 auto", padding: "20px", fontFamily: 'sans-serif' };
const containerLogin = { maxWidth: 300, margin: "100px auto", textAlign: 'center' };
const card = { background: "#fff", padding: "15px", borderRadius: "12px", marginBottom: "15px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" };
const inputStyle = { width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" };
const btn = { width: "100%", padding: "12px", background: "#4CAF50", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 'bold' };
const btnSair = { background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const flexRow = { display: 'flex', gap: '10px' };
const itemLista = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' };

// Estilos de botões de filtro
const btnAtivo = { ...btn, background: '#34495e' };
const btnInativo = { ...btn, background: '#ecf0f1', color: '#7f8c8d' };
const btnReceita = { ...btn, background: '#2ecc71' };
const btnDespesa = { ...btn, background: '#e74c3c' };

export default App;