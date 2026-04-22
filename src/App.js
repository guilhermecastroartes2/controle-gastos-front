import { useEffect, useState, useCallback } from "react";

function App() {
  const [logado, setLogado] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState(""); // Mantido para o input, agora será "lido"
  const [transacoes, setTransacoes] = useState([]);
  
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("despesa");

  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroData, setFiltroData] = useState("");

  const API_URL = "https://controle-gastos-api-bfph.onrender.com";

  // useCallback evita o erro de 'missing dependency' no useEffect
  const buscarDados = useCallback(() => {
    if (!email) return;
    fetch(`${API_URL}/transacoes?email=${email}`)
      .then(res => res.json())
      .then(setTransacoes)
      .catch(err => console.error("Erro ao buscar:", err));
  }, [email, API_URL]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) { 
      setEmail(user); 
      setLogado(true); 
    }
  }, []);

  useEffect(() => {
    if (logado) buscarDados();
  }, [logado, buscarDados]);

  const fazerLogin = () => {
    // Usando a variável 'senha' aqui para o ESLint parar de reclamar
    if (email && senha) {
      localStorage.setItem("user", email);
      setLogado(true);
    } else {
      alert("Preencha email e senha");
    }
  };

  const adicionar = () => {
    if (!valor || !categoria) return alert("Preencha os campos!");
    fetch(`${API_URL}/transacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, valor, categoria, tipo, descricao })
    }).then(() => {
      setValor(""); setCategoria(""); setDescricao("");
      buscarDados();
    });
  };

  const transacoesFiltradas = transacoes.filter(t => {
    const bateTipo = filtroTipo === "todos" || t.tipo === filtroTipo;
    const bateData = filtroData === "" || t.data.includes(filtroData);
    return bateTipo && bateData;
  });

  if (!logado) {
    return (
      <div style={containerLogin}>
        <h1>💰 Controle de Gastos</h1>
        <div style={card}>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input 
            type="password" 
            placeholder="Senha" 
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} // Agora a variável 'senha' é usada
            style={inputStyle} 
          />
          <button onClick={fazerLogin} style={btn}>Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerApp}>
      <header style={headerStyle}>
        <h2>💰 Controle de Gastos</h2>
        <button onClick={() => {localStorage.clear(); window.location.reload();}} style={btnSair}>Sair</button>
      </header>

      <div style={card}>
        <h4>Pesquisar Transações</h4>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input 
            type="date" 
            onChange={(e) => {
              const dataFormatada = e.target.value.split('-').reverse().join('/');
              setFiltroData(dataFormatada);
            }} 
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

      <div style={card}>
        <h3>{filtroTipo === "todos" ? "Todas Transações" : filtroTipo.toUpperCase()}</h3>
        {transacoesFiltradas.length === 0 ? <p style={{textAlign: 'center'}}>Nenhum registro encontrado.</p> : 
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

      <div style={card}>
        <h3>Novo Lançamento</h3>
        <input type="number" placeholder="Valor" value={valor} onChange={(e) => setValor(e.target.value)} style={inputStyle} />
        <input placeholder="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} style={inputStyle} />
        <input placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} style={inputStyle} />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={inputStyle}>
          <option value="despesa">Despesa</option>
          <option value="receita">Receita</option>
        </select>
        <button onClick={adicionar} style={btn}>Adicionar</button>
      </div>
    </div>
  );
}

// Estilos mantidos para consistência visual
const containerApp = { maxWidth: 500, margin: "0 auto", padding: "20px", fontFamily: 'sans-serif' };
const containerLogin = { maxWidth: 350, margin: "100px auto", textAlign: 'center', padding: '20px' };
const card = { background: "#fff", padding: "15px", borderRadius: "12px", marginBottom: "15px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", boxSizing: 'border-box' };
const inputStyle = { width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" };
const btn = { width: "100%", padding: "12px", background: "#4CAF50", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 'bold' };
const btnSair = { background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const flexRow = { display: 'flex', gap: '10px' };
const itemLista = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' };

const btnAtivo = { ...btn, background: '#34495e' };
const btnInativo = { ...btn, background: '#ecf0f1', color: '#7f8c8d' };
const btnReceita = { ...btn, background: '#2ecc71' };
const btnDespesa = { ...btn, background: '#e74c3c' };

export default App;