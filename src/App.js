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
  
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
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
    if (!valor || !categoria) return alert("Preencha valor e categoria!");
    fetch(`${API_URL}/transacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, valor, categoria, tipo, descricao })
    }).then(() => {
      setValor(""); setCategoria(""); setDescricao("");
      buscarDados();
    });
  };

  const deletarTransacao = (id) => {
    if (window.confirm("Deseja excluir este lançamento?")) {
      fetch(`${API_URL}/transacoes/${id}`, { method: "DELETE" })
        .then(() => buscarDados());
    }
  };

  const transacoesFiltradas = transacoes.filter(t => {
    const bateTipo = filtroTipo === "todos" || t.tipo === filtroTipo;
    if (!dataInicio && !dataFim) return bateTipo;

    const partes = t.data.split(' ')[0].split('/');
    const dataTransacao = new Date(partes[2], partes[1] - 1, partes[0]);
    const inicio = dataInicio ? new Date(dataInicio) : null;
    const fim = dataFim ? new Date(dataFim) : null;

    if (inicio) inicio.setHours(0,0,0,0);
    if (fim) fim.setHours(23,59,59,999);

    const bateData = (!inicio || dataTransacao >= inicio) && (!fim || dataTransacao <= fim);
    return bateTipo && bateData;
  });

  const totalReceitas = transacoesFiltradas.filter(t => t.tipo === "receita").reduce((acc, t) => acc + parseFloat(t.valor), 0);
  const totalDespesas = transacoesFiltradas.filter(t => t.tipo === "despesa").reduce((acc, t) => acc + parseFloat(t.valor), 0);
  const saldoTotal = totalReceitas - totalDespesas;

  if (!logado) {
    return (
      <div style={containerLogin}>
        <h1>💰 Controle de Gastos</h1>
        <div style={card}>
          <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} style={inputStyle}/>
          <input type="password" placeholder="Senha" value={senha} onChange={(e)=>setSenha(e.target.value)} style={inputStyle}/>
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

      <div style={gridResumo}>
        <div style={{...cardResumo, borderLeft: '5px solid #3498db'}}><small>Saldo Período</small><h3 style={{color: saldoTotal >= 0 ? '#2ecc71' : '#e74c3c', margin: 0}}>R$ {saldoTotal.toFixed(2)}</h3></div>
        <div style={{...cardResumo, borderLeft: '5px solid #2ecc71'}}><small>Entradas</small><h3 style={{color: '#2ecc71', margin: 0}}>R$ {totalReceitas.toFixed(2)}</h3></div>
        <div style={{...cardResumo, borderLeft: '5px solid #e74c3c'}}><small>Saídas</small><h3 style={{color: '#e74c3c', margin: 0}}>R$ {totalDespesas.toFixed(2)}</h3></div>
      </div>

      <button onClick={() => setMostrarGraficos(!mostrarGraficos)} style={{...btn, background: '#3498db', marginBottom: '15px'}}>
        {mostrarGraficos ? "▲ Ocultar Gráficos" : "📊 Mostrar Gráficos"}
      </button>

      {mostrarGraficos && (
        <div style={{marginBottom: '20px'}}>
           <div style={card}>
              <h4 style={{color: '#2ecc71', marginTop: 0}}>Entradas por Categoria</h4>
              <div style={{height: 180}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(transacoesFiltradas.filter(t=>t.tipo==='receita').reduce((acc,curr)=>{acc[curr.categoria]=(acc[curr.categoria]||0)+parseFloat(curr.valor); return acc},{})).map(([name,value])=>({name,value}))}>
                    <XAxis dataKey="name" fontSize={10}/><YAxis fontSize={10}/><Tooltip/><Bar dataKey="value" fill="#2ecc71" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
           <div style={card}>
              <h4 style={{color: '#e74c3c', marginTop: 0}}>Saídas por Categoria</h4>
              <div style={{height: 180}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(transacoesFiltradas.filter(t=>t.tipo==='despesa').reduce((acc,curr)=>{acc[curr.categoria]=(acc[curr.categoria]||0)+parseFloat(curr.valor); return acc},{})).map(([name,value])=>({name,value}))}>
                    <XAxis dataKey="name" fontSize={10}/><YAxis fontSize={10}/><Tooltip/><Bar dataKey="value" fill="#e74c3c" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
      )}

      <div style={card}>
        <h4>Filtrar Histórico (De / Até)</h4>
        <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
          <input type="date" onChange={(e) => setDataInicio(e.target.value)} style={inputStyle} />
          <input type="date" onChange={(e) => setDataFim(e.target.value)} style={inputStyle} />
        </div>
        <div style={flexRow}>
          <button onClick={() => setFiltroTipo("todos")} style={filtroTipo === "todos" ? btnAtivo : btnInativo}>Todos</button>
          <button onClick={() => setFiltroTipo("receita")} style={filtroTipo === "receita" ? btnReceita : btnInativo}>Receitas</button>
          <button onClick={() => setFiltroTipo("despesa")} style={filtroTipo === "despesa" ? btnDespesa : btnInativo}>Despesas</button>
        </div>
      </div>

      <div style={card}>
        <h3>Histórico</h3>
        {transacoesFiltradas.map(t => (
          <div key={t.id} style={itemLista}>
            <div style={{flex: 1}}>
              <b style={{textTransform: 'capitalize'}}>{t.categoria}</b>
              <br/><small style={{color: '#666'}}>{t.data}</small>
              {t.descricao && <p style={{margin: '4px 0', fontSize: '13px', color: '#888'}}>📝 {t.descricao}</p>}
            </div>
            <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px'}}>
              <span style={{ color: t.tipo === 'receita' ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                {t.tipo === 'receita' ? '+' : '-'} R$ {parseFloat(t.valor).toFixed(2)}
              </span>
              <button onClick={() => deletarTransacao(t.id)} style={btnDelete}>Excluir</button>
            </div>
          </div>
        ))}
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

// --- TODOS OS ESTILOS DEFINIDOS AQUI ---
const containerLogin = { maxWidth: 350, margin: "80px auto", textAlign: 'center', padding: '20px' };
const containerApp = { maxWidth: 500, margin: "0 auto", padding: "10px", fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' };
const card = { background: "#fff", padding: "15px", borderRadius: "12px", marginBottom: "15px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", boxSizing: 'border-box' };
const inputStyle = { width: "100%", padding: "12px", marginBottom: "8px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" };
const btn = { width: "100%", padding: "12px", background: "#4CAF50", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 'bold' };
const btnSair = { background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const gridResumo = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '15px' };
const cardResumo = { background: '#fff', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
const flexRow = { display: 'flex', gap: '5px' };
const itemLista = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' };
const btnAtivo = { ...btn, background: '#34495e', padding: '8px', fontSize: '11px' };
const btnInativo = { ...btn, background: '#ecf0f1', color: '#7f8c8d', padding: '8px', fontSize: '11px' };
const btnReceita = { ...btn, background: '#2ecc71', padding: '8px', fontSize: '11px' };
const btnDespesa = { ...btn, background: '#e74c3c', padding: '8px', fontSize: '11px' };
const btnDelete = { background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline', padding: 0 };

export default App;