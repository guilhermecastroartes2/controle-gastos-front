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
  const [logado, setLogado] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modoCadastro, setModoCadastro] = useState(false);

  const [transacoes, setTransacoes] = useState([]);
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipo, setTipo] = useState("despesa");
  const [descricao, setDescricao] = useState("");

  const usuario = localStorage.getItem("user");

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

  const cadastrar = () => {
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
      .catch(() => alert("Erro"));
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setLogado(true);
  }, []);

  // =========================
  // BUSCAR TRANSAÇÕES DO USUÁRIO
  // =========================
  useEffect(() => {
    if (!usuario) return;

    fetch(`https://controle-gastos-api-bfph.onrender.com/transacoes?usuario=${usuario}`)
      .then((res) => res.json())
      .then((data) => setTransacoes(data));
  }, [logado]);

  // =========================
  // ADICIONAR
  // =========================
  const adicionar = () => {
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
      .then((nova) => setTransacoes((prev) => [...prev, nova]));
  };

  // =========================
  // LOGIN UI
  // =========================
  if (!logado) {
    return (
      <div style={{ padding: 20 }}>
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

  // =========================
  // RESUMO
  // =========================
  const totalReceitas = transacoes
    .filter(t => t.tipo === "receita")
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const totalDespesas = transacoes
    .filter(t => t.tipo === "despesa")
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const saldo = totalReceitas - totalDespesas;

  return (
    <div style={{ padding: 20 }}>
      <h1>Controle de Gastos</h1>

      <p>Saldo: R$ {saldo}</p>

      <input placeholder="Valor" onChange={(e) => setValor(e.target.value)} />
      <input placeholder="Categoria" onChange={(e) => setCategoria(e.target.value)} />
      <input placeholder="Descrição" onChange={(e) => setDescricao(e.target.value)} />

      <select onChange={(e) => setTipo(e.target.value)}>
        <option value="despesa">Despesa</option>
        <option value="receita">Receita</option>
      </select>

      <button onClick={adicionar}>Adicionar</button>

      {transacoes.map((t, i) => (
        <div key={i}>
          <p>{t.data}</p>
          <p>{t.valor}</p>
          <p>{t.categoria}</p>
          <p>{t.tipo}</p>
          <p>{t.descricao}</p>
        </div>
      ))}
    </div>
  );
}

export default App;