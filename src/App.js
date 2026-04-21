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
  // =========================
  // LOGIN
  // =========================
  const [logado, setLogado] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const fazerLogin = () => {
    fetch("https://controle-gastos-api-bfph.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        setLogado(true);
        localStorage.setItem("user", email);
      })
      .catch(() => alert("Login inválido"));
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setLogado(true);
  }, []);

  // =========================
  // DADOS
  // =========================
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipo, setTipo] = useState("despesa");
  const [descricao, setDescricao] = useState("");

  const [tipoGrafico, setTipoGrafico] = useState("despesa");

  useEffect(() => {
    fetch("https://controle-gastos-api-bfph.onrender.com/transacoes")
      .then((res) => res.json())
      .then((data) => setTransacoes(data))
      .catch(() => alert("Erro ao carregar"));
  }, []);

  // =========================
  // ADICIONAR
  // =========================
  const adicionar = () => {
    if (!valor || isNaN(valor)) {
      alert("Valor inválido");
      return;
    }

    if (!categoria || !descricao) {
      alert("Preencha tudo");
      return;
    }

    setLoading(true);

    fetch("https://controle-gastos-api-bfph.onrender.com/transacoes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        valor: Number(valor),
        categoria,
        tipo,
        descricao,
      }),
    })
      .then((res) => res.json())
      .then((nova) => {
        setTransacoes((prev) => [...prev, nova]);

        setValor("");
        setCategoria("");
        setDescricao("");
        setTipo("despesa");

        alert("Adicionado!");
      })
      .catch(() => alert("Erro"))
      .finally(() => setLoading(false));
  };

  // =========================
  // DELETE (local)
  // =========================
  const deletar = (index) => {
    const novaLista = transacoes.filter((_, i) => i !== index);
    setTransacoes(novaLista);
  };

  // =========================
  // RESUMO
  // =========================
  const totalReceitas = transacoes
    .filter((t) => t.tipo === "receita")
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const totalDespesas = transacoes
    .filter((t) => t.tipo === "despesa")
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const saldo = totalReceitas - totalDespesas;

  const formatar = (valor) =>
    Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  // =========================
  // DADOS DO GRÁFICO
  // =========================
  const dadosGrafico = Object.values(
    transacoes
      .filter((t) => t.tipo === tipoGrafico)
      .reduce((acc, t) => {
        if (!acc[t.categoria]) {
          acc[t.categoria] = { categoria: t.categoria, valor: 0 };
        }
        acc[t.categoria].valor += Number(t.valor);
        return acc;
      }, {})
  );

  // =========================
  // LOGIN UI
  // =========================
  if (!logado) {
    return (
      <div style={{ padding: 20 }}>
        <h2>🔐 Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button onClick={fazerLogin}>Entrar</button>
      </div>
    );
  }

  // =========================
  // ESTILO
  // =========================
  const inputStyle = {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    border: "1px solid #ddd",
    boxSizing: "border-box",
  };

  const botaoStyle = {
    width: "100%",
    padding: 12,
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>💰 Controle de Gastos</h1>

      {/* RESUMO */}
      <div style={{ background: "#fff", padding: 15, marginBottom: 20, borderRadius: 8 }}>
        <p><b>💰 Saldo:</b> {formatar(saldo)}</p>
        <p style={{ color: "green" }}><b>📈 Receitas:</b> {formatar(totalReceitas)}</p>
        <p style={{ color: "red" }}><b>📉 Despesas:</b> {formatar(totalDespesas)}</p>
      </div>

      {/* BOTÕES DO GRÁFICO */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setTipoGrafico("receita")}>📈 Receita</button>
        <button onClick={() => setTipoGrafico("despesa")}>📉 Despesa</button>
      </div>

      {/* GRÁFICO RESPONSIVO */}
      <div style={{ background: "#fff", padding: 15, marginBottom: 20 }}>
        <h3>📊 {tipoGrafico === "receita" ? "Receitas" : "Despesas"} por Categoria</h3>

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

      {/* FORMULÁRIO */}
      <div style={{ background: "#fff", padding: 15, marginBottom: 20 }}>
        <input
          placeholder="Valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          style={inputStyle}
        />

        <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={inputStyle}>
          <option value="despesa">Despesa</option>
          <option value="receita">Receita</option>
        </select>

        <button onClick={adicionar} style={botaoStyle}>
          {loading ? "Adicionando..." : "Adicionar"}
        </button>
      </div>

      {/* LISTA */}
      {transacoes.map((t, index) => (
        <div key={index} style={{ background: "#fff", padding: 15, marginBottom: 10 }}>
          <p><b>📅</b> {t.data}</p>
          <p style={{ color: t.tipo === "receita" ? "green" : "red" }}>
            <b>💸</b> {formatar(t.valor)}
          </p>
          <p>{t.categoria}</p>
          <p>{t.descricao}</p>

          <button onClick={() => deletar(index)} style={{ background: "red", color: "#fff" }}>
            🗑️ Deletar
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;