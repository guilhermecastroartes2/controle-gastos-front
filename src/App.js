import { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

function App() {
  const [logado, setLogado] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [transacoes, setTransacoes] = useState([]);
  
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("despesa");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroData, setFiltroData] = useState("");
  const [mostrarGraficos, setMostrarGraficos] = useState(false);

  const API_URL = "https://controle-gastos-api-bfph.onrender.com";

  const buscarDados = useCallback(() => {
    if (!email) return;
    fetch(`${API_URL}/transacoes?email=${email}`)
      .then(res => res.json())
      .then(setTransacoes)
      .catch(err => console.error("Erro ao buscar:", err));
  }, [email, API_URL]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) { setEmail(user); setLogado(true); }
  }, []);

  useEffect(() => {
    if (logado) buscarDados();
  }, [logado, buscarDados]);

  const fazerLogin = () => {
    if (email && senha) {
      localStorage.setItem("user", email);
      setLogado(true);
    } else { alert("Preencha email e senha"); }
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

  // --- LÓGICA DE FILTRAGEM E TOTAIS ---
  const transacoesFiltradas = transacoes.filter(t => {
    const bateTipo = filtroTipo === "todos" || t.tipo === filtroTipo;
    const bateData = filtroData === "" || t.data.includes(filtroData);
    return bateTipo && bateData;
  });

  const totalReceitas = transacoesFiltradas
    .filter(t => t.tipo === "receita")
    .reduce((acc, t) => acc + parseFloat(t.valor), 0);

  const totalDespesas = transacoesFiltradas
    .filter(t => t.tipo === "despesa")
    .reduce((acc, t) => acc + parseFloat(t.valor), 0);

  const saldoTotal = totalReceitas - totalDespesas;

  const prepararDadosGrafico = (tFiltro) => {
    const dadosMap = transacoesFiltradas // Gráfico agora segue os filtros também!
      .filter(t => t.tipo === tFiltro)
      .reduce((acc, t) => {
        acc[t.categoria] = (acc[t.categoria] || 0) + parseFloat(t.valor);
        return acc;
      }, {});
    return Object.keys(dadosMap).map(cat => ({ name: cat, value: dadosMap[cat] }));
  };

  if (!logado) {
    return (
      <div style={containerLogin}>
        <h1>💰 Controle de Gastos</h1>
        <div style={card}>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} style={inputStyle} />
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

      {/* --- DASHBOARD DE RESUMO (NOVIDADE) --- */}
      <div style={gridResumo}>
        <div style={{...cardResumo, borderLeft: '5px solid #3498db'}}>
          <small>Saldo Total</small>
          <h3 style={{color: saldoTotal >= 0 ? '#2ecc71' : '#e74c3c', margin: 0}}>
            R$ {saldoTotal.toFixed(2)}
          </h3>
        </div>
        <div style={{...cardResumo, borderLeft: '5px solid #2ecc71'}}>
          <small>Receitas</small>
          <h3 style={{color: '#2ecc71', margin: 0}}>R$ {totalReceitas.toFixed(2)}</h3>
        </div>
        <div style={{...cardResumo, borderLeft: '5px solid #e74c3c'}}>
          <small>Despesas</small>
          <h3 style={{color: '#e74c3c', margin: 0}}>R$ {totalDespesas.toFixed(2)}</h3>
        </div>
      </div>

      <button 
        onClick={() => setMostrarGraficos(!mostrarGraficos)} 
        style={{...btn, background: '#3498db', marginBottom: '15px'}}
      >
        {mostrarGraficos ? "▲ Esconder Gráficos" : "📊 Mostrar Gráficos"}
      </button>

      {mostrarGraficos && (
        <div>
          <div style={card}>
            <h4 style={{color: '#2ecc71', marginTop: 0}}>📈 Receitas por Categoria</h4>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepararDadosGrafico("receita")}>
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2ecc71" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={card}>
            <h4 style={{color: '#e74c3c', marginTop: 0}}>📉 Despesas por Categoria</h4>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepararDadosGrafico("despesa")}>
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#e74c3c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div style={card}>
        <h4>Pesquisar Transações</h4>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input type="date" onChange={(e) => {
            const dataF = e.target.value.split('-').reverse().join('/');
            setFiltroData(dataF);
          }} style={inputStyle} />
          <button onClick={() => setFiltroData("")} style={{...btn, width: '80px', background: '#ccc', fontSize: '12px'}}>Limpar</button>
        </div>
        <div style={flexRow}>
          <button onClick={() => setFiltroTipo("todos")} style={filtroTipo === "todos" ? btnAtivo : btnInativo}>Todos</button>
          <button onClick={() => setFiltroTipo("receita")} style={filtroTipo === "receita" ? btnReceita : btnInativo}>Receitas</button>
          <button onClick={() => setFiltroTipo("despesa")} style={filtroTipo === "despesa" ? btnDespesa : btnInativo}>Despesas</button>
        </div>
      </div>

      <div style={card}>
        <h3>Histórico</h3>
        {transacoesFiltradas.length === 0 ? <p style={{textAlign:'center'}}>Sem dados.</p> : 
          transacoesFiltradas.map(t => (
            <div key={t.id} style={itemLista}>
              <div><b>{t.categoria}</b><br/><small>{t.data}</small></div>
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

// --- ESTILOS NOVOS E ATUALIZADOS ---
const gridResumo = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '10px',
  marginBottom: '20px'
};

const cardResumo = {
  background: '#fff',
  padding: '12px 15px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
};

// ... (Manter os outros estilos abaixo conforme o código anterior)
const containerApp = { maxWidth: 500, margin: "0 auto", padding: "10px", fontFamily: 'sans-serif' };
const containerLogin = { maxWidth: 350, margin: "80px auto", textAlign: 'center', padding: '20px' };
const card = { background: "#fff", padding: "15px", borderRadius: "12px", marginBottom: "15px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", boxSizing: 'border-box' };
const inputStyle = { width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" };
const btn = { width: "100%", padding: "12px", background: "#4CAF50", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 'bold' };
const btnSair = { background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const flexRow = { display: 'flex', gap: '5px' };
const itemLista = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' };
const btnAtivo = { ...btn, background: '#34495e', padding: '10px 5px', fontSize: '12px' };
const btnInativo = { ...btn, background: '#ecf0f1', color: '#7f8c8d', padding: '10px 5px', fontSize: '12px' };
const btnReceita = { ...btn, background: '#2ecc71', padding: '10px 5px', fontSize: '12px' };
const btnDespesa = { ...btn, background: '#e74c3c', padding: '10px 5px', fontSize: '12px' };

export default App;