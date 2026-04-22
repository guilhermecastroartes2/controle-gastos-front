import { useEffect, useState } from "react";

function App() {
  const [logado, setLogado] = useState(false);
  const [modoCadastro, setModoCadastro] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [transacoes, setTransacoes] = useState([]);
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("despesa");

  const API_URL = "https://controle-gastos-api-bfph.onrender.com";

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setEmail(user);
      setLogado(true);
    }
  }, []);

  useEffect(() => {
    if (!logado) return;
    fetch(`${API_URL}/transacoes?email=${email}`)
      .then(res => res.json())
      .then(setTransacoes);
  }, [logado, email]);

  const fazerLogin = () => {
    fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        localStorage.setItem("user", email);
        setLogado(true);
      })
      .catch(() => alert("Login inválido"));
  };

  const cadastrar = () => {
    fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    }).then(() => {
      alert("Conta criada!");
      setModoCadastro(false);
    });
  };

  const adicionar = () => {
    if (!valor || !categoria) return alert("Preencha os campos!");

    fetch(`${API_URL}/transacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, valor, categoria, tipo, descricao })
    })
      .then(res => res.json())
      .then(nova => {
        setTransacoes([...transacoes, nova]);
        setValor(""); // Limpa campos
        setCategoria("");
        setDescricao("");
      });
  };

  const logout = () => {
    localStorage.removeItem("user");
    setLogado(false);
  };

  // --- LÓGICA DE AGROPAMENTO DE DADOS PARA OS GRÁFICOS ---
  const agruparPorCategoria = (tipoFiltro) => {
    const agrupado = transacoes
      .filter(t => t.tipo === tipoFiltro)
      .reduce((acc, t) => {
        const cat = t.categoria.toLowerCase();
        const val = parseFloat(t.valor);
        acc[cat] = (acc[cat] || 0) + val;
        return acc;
      }, {});

    // Converte objeto em array { name, value } para o gráfico
    return Object.keys(agrupado).map(cat => ({
      name: cat,
      value: agrupado[cat]
    }));
  };

  const dadosReceitas = agruparPorCategoria("receita");
  const dadosDespesas = agruparPorCategoria("despesa");

  // --- COMPONENTE DE GRÁFICO REUTILIZÁVEL ---
  const GraficoBarras = ({ dados, cor, titulo }) => (
    <div style={card}>
      <h3 style={{ ...tituloGrafico, color: cor }}>{titulo}</h3>
      {dados.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Sem dados.</p>
      ) : (
        <div style={containerGrafico}>
          {dados.map((d, index) => {
            const maxValue = Math.max(...dados.map(x => x.value));
            const heightPercentage = maxValue > 0 ? (d.value / maxValue) * 100 : 0;

            return (
              <div key={index} style={colunaGrafico}>
                <div style={{ ...barra, height: `${heightPercentage}%`, background: cor }}>
                  <span style={valorBarra}>R$ {d.value.toFixed(2)}</span>
                </div>
                <span style={legendaBarra}>{d.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (!logado) {
    return (
      <div style={containerLogin}>
        <h1 style={{ fontSize: '24px' }}>💰 Controle de Gastos</h1>
        <div style={card}>
          <h3>{modoCadastro ? "Criar Conta" : "Login"}</h3>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Senha" onChange={(e) => setSenha(e.target.value)} style={inputStyle} />
          {modoCadastro ? (
            <>
              <button onClick={cadastrar} style={btn}>Cadastrar</button>
              <p style={link} onClick={() => setModoCadastro(false)}>Já tenho conta</p>
            </>
          ) : (
            <>
              <button onClick={fazerLogin} style={btn}>Entrar</button>
              <p style={link} onClick={() => setModoCadastro(true)}>Criar conta</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Cálculo de Saldo Dinâmico
  const saldo = transacoes.reduce((acc, t) => {
    const v = parseFloat(t.valor);
    return t.tipo === "receita" ? acc + v : acc - v;
  }, 0);

  return (
    <div style={containerApp}>
      <header style={headerStyle}>
        <h1>💰 Controle de Gastos</h1>
        <button onClick={logout} style={btnSair}>Sair</button>
      </header>

      <div style={{ ...card, textAlign: 'center' }}>
        <h2 style={{ color: saldo >= 0 ? '#2ecc71' : '#e74c3c' }}>
          Saldo: R$ {saldo.toFixed(2)}
        </h2>
      </div>

      {/* --- DOIS GRÁFICOS SEPARADOS --- */}
      <GraficoBarras dados={dadosReceitas} cor="#2ecc71" titulo="📈 Receitas por Categoria" />
      <GraficoBarras dados={dadosDespesas} cor="#e74c3c" titulo="📉 Despesas por Categoria" />

      <div style={card}>
        <h3>Nova Transação</h3>
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

// --- NOVOS ESTILOS PARA OS GRÁFICOS ---
const tituloGrafico = { fontSize: '18px', marginBottom: '15px' };
const containerGrafico = {
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'flex-end',
  height: '200px', // Altura fixa para o gráfico
  paddingTop: '20px',
  boxSizing: 'border-box'
};
const colunaGrafico = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '20%', // Define largura para cada coluna
  height: '100%'
};
const barra = {
  width: '70%',
  borderRadius: '5px 5px 0 0',
  position: 'relative',
  display: 'flex',
  justifyContent: 'center'
};
const valorBarra = {
  position: 'absolute',
  top: '-20px',
  fontSize: '11px',
  color: '#333',
  whiteSpace: 'nowrap'
};
const legendaBarra = {
  fontSize: '12px',
  color: '#555',
  marginTop: '5px',
  textAlign: 'center',
  textTransform: 'capitalize'
};

// --- ESTILOS ANTERIORES MANUTENÇÃO ---
const containerLogin = { maxWidth: 350, margin: "80px auto", padding: 20 };
const containerApp = { maxWidth: 500, margin: "0 auto", padding: "20px" };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 };

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  marginBottom: 20,
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  boxSizing: "border-box"
};

const inputStyle = {
  width: "100%",
  padding: 12,
  marginBottom: 15,
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: "16px",
  boxSizing: "border-box"
};

const btn = {
  width: "100%",
  padding: 14,
  background: "#4CAF50",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
  cursor: "pointer"
};

const btnSair = { background: "#e74c3c", color: "#fff", border: "none", padding: "8px 15px", borderRadius: 5 };
const link = { color: "#3498db", cursor: "pointer", marginTop: 10, fontSize: "14px" };

export default App;