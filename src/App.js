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
  const [modoCadastro, setModoCadastro] = useState(false);

  const usuario = localStorage.getItem("user");

  // =========================
  // ESTADOS
  // =========================
  const [transacoes, setTransacoes] = useState([]);
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipo, setTipo] = useState("despesa");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);

  const [tipoGrafico, setTipoGrafico] = useState("despesa");

  // =========================
  // AUTO LOGIN
  // =========================
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setLogado(true);
  }, []);

  // =========================
  // LOGIN
  // =========================
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
        localStorage.setItem("user", email);
        setLogado(true);
      })
      .catch(() => alert("Login inválido"));
  };

  // =========================
  // CADASTRO
  // =========================
  const cadastrar = () => {
    if (!email || !senha) {
      alert("Preencha email e senha");
      return;
    }

    fetch("https://controle-gastos-api-bfph.onrender.com/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    })
      .then(() => {
        alert("Conta criada!");
        setModoCadastro(false);
      })
      .catch(() => alert("Erro ao cadastrar"));
  };

  // =========================
  // BUSCAR DADOS DO USUÁRIO
  // =========================
  useEffect(() => {
    if (!usuario) return;

    fetch(`https://controle-gastos-api-bfph.onrender.com/transacoes?usuario=${usuario}`)
      .then((res) => res.json())
      .then((data) => setTransacoes(data))
      .catch(() => alert("Erro ao carregar dados"));
  }, [usuario]);

  // =========================
  // ADICIONAR
  // =========================
  const adicionar = () => {
    if (!valor || isNaN(valor)) {
      alert("Valor inválido");
      return;
    }

    setLoading(true);

    fetch("https://controle-gastos-api-bfph.onrender.com/transacoes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usuario,
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
      })
      .finally(() => setLoading(false));
  };

  // =========================
  // FORMATAR
  // =========================
  const formatar = (valor) =>
    Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

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
      <div style={{ padding: 20, maxWidth: 300, margin: "auto" }}>
        <h2>{modoCadastro ? "📝 Criar Conta" : "🔐 Login"}</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        {modoCadastro ? (
          <>
            <button onClick={cadastrar} style={{ width: "100%" }}>
              Criar Conta
            </button>

            <p onClick={() => setModoCadastro(false)}>Já tenho conta</p>
          </>
        ) : (
          <>
            <button onClick={fazerLogin} style={{ width: "100%" }}>
              Entrar
            </button>

            <p onClick={() => setModoCadastro(true)}>Criar conta</p>
          </>
        )}
      </div>
    );
  }

  // =========================
  // UI PRINCIPAL
  // =========================
  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1>💰 Controle de Gastos</h1>

      {/* RESUMO */}
      <div style={{ marginBottom: 20 }}>
        <p><b>Saldo:</b> {formatar(saldo)}</p>
        <p style={{ color: "green" }}>Receitas: {formatar(totalReceitas)}</p>
        <p style={{ color: "red" }}>Despesas: {formatar(totalDespesas)}</p>
      </div>

      {/* BOTÕES GRÁFICO */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setTipoGrafico("receita")}>📈 Receitas</button>
        <button onClick={() => setTipoGrafico("despesa")}>📉 Despesas</button>
      </div>

      {/* GRÁFICO RESPONSIVO */}
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoria" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="valor"
              fill={tipoGrafico === "receita" ? "green" : "red"}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* FORM */}
      <input placeholder="Valor" value={valor} onChange={(e) => setValor(e.target.value)} />
      <input placeholder="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
      <input placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />

      <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
        <option value="despesa">Despesa</option>
        <option value="receita">Receita</option>
      </select>

      <button onClick={adicionar} disabled={loading}>
        {loading ? "Adicionando..." : "Adicionar"}
      </button>

      {/* LISTA */}
      {transacoes.map((t, i) => (
        <div key={i}>
          <p>{t.data}</p>
          <p style={{ color: t.tipo === "receita" ? "green" : "red" }}>
            {formatar(t.valor)}
          </p>
          <p>{t.categoria}</p>
          <p>{t.descricao}</p>
        </div>
      ))}
    </div>
  );
}

export default App;