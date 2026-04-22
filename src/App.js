import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

function App() {
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipo, setTipo] = useState("despesa");
  const [descricao, setDescricao] = useState("");

  const [tipoGrafico, setTipoGrafico] = useState("despesa");

  const [logado, setLogado] = useState(false);
  const [modoCadastro, setModoCadastro] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // AUTO LOGIN
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setLogado(true);
  }, []);

  // BUSCAR DADOS
  useEffect(() => {
    if (!logado) return;

    fetch(`https://controle-gastos-api-bfph.onrender.com/transacoes?email=${email}`)
      .then(res => res.json())
      .then(data => setTransacoes(data))
      .catch(() => alert("Erro ao carregar dados"));
  }, [logado, email]);

  // LOGIN
  const fazerLogin = () => {
    fetch("https://controle-gastos-api-bfph.onrender.com/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, senha })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        setLogado(true);
        localStorage.setItem("user", email);
      })
      .catch(() => alert("Login inválido"));
  };

  // CADASTRO
  const cadastrar = () => {
    fetch("https://controle-gastos-api-bfph.onrender.com/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, senha })
    })
      .then(() => {
        alert("Conta criada!");
        setModoCadastro(false);
      })
      .catch(() => alert("Erro ao cadastrar"));
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("user");
    setLogado(false);
  };

  // ADICIONAR
  const adicionar = () => {
    if (!valor || isNaN(valor)) {
      alert("Valor inválido");
      return;
    }

    setLoading(true);

    fetch("https://controle-gastos-api-bfph.onrender.com/transacoes", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        valor: Number(valor),
        categoria,
        tipo,
        descricao,
        email
      }),
    })
      .then(res => res.json())
      .then(nova => {
        setTransacoes(prev => [...prev, nova]);
        setValor("");
        setCategoria("");
        setDescricao("");
      })
      .finally(() => setLoading(false));
  };

  // RESUMO
  const totalReceitas = transacoes
    .filter(t => t.tipo === "receita")
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const totalDespesas = transacoes
    .filter(t => t.tipo === "despesa")
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const saldo = totalReceitas - totalDespesas;

  const formatar = (v) =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // DADOS GRÁFICO
  const dadosGrafico = Object.values(
    transacoes
      .filter(t => t.tipo === tipoGrafico)
      .reduce((acc, t) => {
        if (!acc[t.categoria]) {
          acc[t.categoria] = { categoria: t.categoria, valor: 0 };
        }
        acc[t.categoria].valor += Number(t.valor);
        return acc;
      }, {})
  );

  // LOGIN UI
  if (!logado) {
    return (
      <div style={{ maxWidth: 300, margin: "100px auto", textAlign: "center" }}>
        <h2>{modoCadastro ? "Criar Conta" : "Login"}</h2>

        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Senha" onChange={(e) => setSenha(e.target.value)} />

        {modoCadastro ? (
          <>
            <button onClick={cadastrar}>Cadastrar</button>
            <p onClick={() => setModoCadastro(false)}>Já tenho conta</p>
          </>
        ) : (
          <>
            <button onClick={fazerLogin}>Entrar</button>
            <p onClick={() => setModoCadastro(true)}>Criar conta</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 600,
      margin: "40px auto",
      fontFamily: "Arial",
      background: "#f5f6fa",
      padding: 20,
      borderRadius: 10
    }}>

      <h1 style={{ textAlign: "center" }}>💰 Controle de Gastos</h1>

      <button onClick={logout} style={{ float: "right" }}>Sair</button>

      {/* RESUMO */}
      <div style={card}>
        <p><b>Saldo:</b> {formatar(saldo)}</p>
        <p style={{ color: "green" }}>Receitas: {formatar(totalReceitas)}</p>
        <p style={{ color: "red" }}>Despesas: {formatar(totalDespesas)}</p>
      </div>

      {/* BOTÕES */}
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <button onClick={() => setTipoGrafico("receita")}>📈 Receita</button>
        <button onClick={() => setTipoGrafico("despesa")}>📉 Despesa</button>
      </div>

      {/* GRÁFICO */}
      <div style={card}>
        <h3>{tipoGrafico === "receita" ? "Receitas" : "Despesas"} por Categoria</h3>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoria" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="valor" fill={tipoGrafico === "receita" ? "green" : "red"} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* FORM */}
      <div style={card}>
        <input placeholder="Valor" value={valor} onChange={(e) => setValor(e.target.value)} style={input}/>
        <input placeholder="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} style={input}/>
        <input placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} style={input}/>

        <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={input}>
          <option value="despesa">Despesa</option>
          <option value="receita">Receita</option>
        </select>

        <button onClick={adicionar} style={btn}>
          {loading ? "..." : "Adicionar"}
        </button>
      </div>

    </div>
  );
}

// estilos
const card = {
  background: "#fff",
  padding: 15,
  borderRadius: 8,
  marginBottom: 20,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
};

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 5,
  border: "1px solid #ddd"
};

const btn = {
  width: "100%",
  padding: 12,
  background: "#4CAF50",
  color: "#fff",
  border: "none",
  borderRadius: 5
};

export default App;