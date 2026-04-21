import { useEffect, useState } from "react";

function App() {
  const [transacoes, setTransacoes] = useState([]);

  useEffect(() => {
    fetch("https://controle-gastos-api-bfph.onrender.com/transacoes")
    .then((res) => res.json())
    .then((data) => setTransacoes(data));
  }, []);

  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipo, setTipo] = useState("despesa");
  const [descricao, setDescricao] = useState("");

  const adicionar = () => {
    fetch("https://controle-gastos-api-bfph.onrender.com/transacoes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        valor: parseFloat(valor),
        categoria,
        tipo,
        descricao,
      }),
    }).then(() => window.location.reload());
  };

  const inputStyle = {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    border: "1px solid #ddd",
    boxSizing: "border-box",
    outline: "none"
  };

  const botaoStyle = {
    width: "100%",
    padding: 12,
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    Cursor: "pointer"
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
      <h1 style={{textAlign: "center" }}>💰 Controle de Gastos</h1>

      {/* FORMULÁRIO */}
      <div style={{
        background: "#fff",
        padding: 15,
        borderRadius: 8,
        marginbottom: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
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

        <select 
          value={tipo} 
          onChange={(e) => setTipo(e.target.value)}
          style={inputStyle}  
        >
          <option value="despesa">Despesa</option>
          <option value="receita">Receita</option>
        </select>

        <button onClick={adicionar} style={botaoStyle}>
          Adicionar
        </button>
      </div>

      {/* LISTA */}
      {transacoes.map((t, index) => (
        <div key={index} style={{ 
          background: "#fff",
          padding: 15,
          borderRadius: 8,
          marginBottom: 10,
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
        }}>
          <p><b>📅 Data:</b> {t.data}</p>
          <p><b>💸 Valor:</b> R$ {t.valor}</p>
          <p><b>📂 Categoria:</b> {t.categoria}</p>
          <p><b>🔁 Tipo:</b> {t.tipo}</p>
          <p><b>📝 Descrição:</b> {t.descricao}</p>
        </div>
      ))}
    </div>
  );
}

export default App;