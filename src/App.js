import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

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

  // LOGIN AUTO
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setEmail(user);
      setLogado(true);
    }
  }, []);

  // BUSCAR
  useEffect(() => {
    if (!logado) return;

    fetch(`https://controle-gastos-api-bfph.onrender.com/transacoes?email=${email}`)
      .then(res => res.json())
      .then(setTransacoes);
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
        localStorage.setItem("user", email);
        setLogado(true);
      })
      .catch(() => alert("Login inválido"));
  };

  // CADASTRO
  const cadastrar = () => {
    fetch("https://controle-gastos-api-bfph.onrender.com/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, senha })
    }).then(() => {
      alert("Conta criada!");
      setModoCadastro(false);
    });
  };

  // ADICIONAR
  const adicionar = () => {
    fetch("https://controle-gastos-api-bfph.onrender.com/transacoes", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, valor, categoria, tipo, descricao })
    })
      .then(res => res.json())
      .then(nova => setTransacoes([...transacoes, nova]));
  };

  const logout = () => {
    localStorage.removeItem("user");
    setLogado(false);
  };

  // LOGIN UI
  if (!logado) {
    return (
      <div style={{ maxWidth: 300, margin: "100px auto", textAlign: "center" }}>
        <h1>💰 Controle de Gastos</h1>
        <h3>{modoCadastro ? "Criar Conta" : "Login"}</h3>

        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} style={input}/>
        <input type="password" placeholder="Senha" onChange={(e) => setSenha(e.target.value)} style={input}/>

        {modoCadastro ? (
          <>
            <button onClick={cadastrar} style={btn}>Cadastrar</button>
            <p onClick={() => setModoCadastro(false)}>Já tenho conta</p>
          </>
        ) : (
          <>
            <button onClick={fazerLogin} style={btn}>Entrar</button>
            <p onClick={() => setModoCadastro(true)}>Criar conta</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", padding: 20 }}>

      <h1>💰 Controle de Gastos</h1>

      <button onClick={logout} style={{
        position: "absolute",
        top: 20,
        right: 20,
        background: "red",
        color: "#fff",
        border: "none",
        borderRadius: "50%",
        width: 40,
        height: 40
      }}>X</button>

      <div style={card}>
        <p>Saldo: R$ 0</p>
      </div>

      <div style={card}>
        <input placeholder="Valor" value={valor} onChange={(e)=>setValor(e.target.value)} style={input}/>
        <input placeholder="Categoria" value={categoria} onChange={(e)=>setCategoria(e.target.value)} style={input}/>
        <input placeholder="Descrição" value={descricao} onChange={(e)=>setDescricao(e.target.value)} style={input}/>

        <select value={tipo} onChange={(e)=>setTipo(e.target.value)} style={input}>
          <option value="despesa">Despesa</option>
          <option value="receita">Receita</option>
        </select>

        <button onClick={adicionar} style={btn}>Adicionar</button>
      </div>

    </div>
  );
}

const card = {
  background: "#fff",
  padding: 15,
  borderRadius: 10,
  marginBottom: 20,
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
};

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 5,
  border: "1px solid #ccc"
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