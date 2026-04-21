import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function App() {
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipo, setTipo] = useState("despesa");
  const [descricao, setDescricao] = useState("");

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const API = "https://controle-gastos-api-bfph.onrender.com/transacoes";

useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then((data) => setTransacoes(data))
      .catch(() => alert("Erro ao carregar transações"));
  }, []);

  const adicionar = () => {
    if (!valor || isNaN(valor)) {
      alert("Valor inválido");
      return;
    }

    if (!categoria || !descricao) {
      alert("Preencha todos os campos");
      return;
    }

    setLoading(true);

    fetch(API, {
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
      .then(() =>
        fetch(API)
          .then((res) => res.json())
          .then((data) => setTransacoes(data))
      )
      .then(() => {
        setValor("");
        setCategoria("");
        setDescricao("");
        setTipo("despesa");
        alert("Transação adicionada!");
      })
      .catch(() => alert("Erro ao adicionar"))
      .finally(() => setLoading(false));
  };

  const deletar = (index) => {
    const novaLista = transacoes.filter((_, i) => i !== index);
    setTransacoes(novaLista);
  };

  const formatar = (valor) =>
    Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const formatarData = (data) =>
    data ? new Date(data).toLocaleDateString("pt-BR") : "—";

  // 🔥 RESUMO
  const totalReceitas = transacoes
    .filter((t) => t.tipo === "receita")
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const totalDespesas = transacoes
    .filter((t) => t.tipo === "despesa")
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const saldo = totalReceitas - totalDespesas;

  // 📊 GRÁFICO
  const dadosGrafico = Object.values(
    transacoes.reduce((acc, t) => {
      if (!acc[t.categoria]) {
        acc[t.categoria] = { categoria: t.categoria, valor: 0 };
      }
      acc[t.categoria].valor += Number(t.valor);
      return acc;
    }, {})
  );

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

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "40px auto",
        fontFamily: "Arial",
        background: "#f5f6fa",
        padding: 20,
        borderRadius: 10,
      }}
    >
      <h1 style={{ textAlign: "center" }}>💰 Controle de Gastos</h1>

      {/* 📊 RESUMO */}
      <div style={{
        background: "#fff",
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <p><b>💰 Saldo:</b> {formatar(saldo)}</p>
        <p style={{ color: "green" }}>
          <b>📈 Receitas:</b> {formatar(totalReceitas)}
        </p>
        <p style={{ color: "red" }}>
          <b>📉 Despesas:</b> {formatar(totalDespesas)}
        </p>
      </div>

      {/* 📊 GRÁFICO */}
      <div style={{
        background: "#fff",
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <h3>📊 Gastos por Categoria</h3>

        <BarChart width={500} height={250} data={dadosGrafico}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="categoria" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="valor" />
        </BarChart>
      </div>

      {/* 📝 FORMULÁRIO */}
      <div style={{
        background: "#fff",
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <input
          type="number"
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

        <button onClick={adicionar} style={botaoStyle} disabled={loading}>
          {loading ? "Adicionando..." : "Adicionar"}
        </button>
      </div>

      {/* 📅 FILTRO */}
      <div style={{ marginBottom: 20 }}>
        <input type="date" onChange={(e) => setDataInicio(e.target.value)} />
        <input type="date" onChange={(e) => setDataFim(e.target.value)} />
      </div>

      {/* 📋 LISTA */}
      {transacoes
        .filter((t) => {
          if (!dataInicio || !dataFim) return true;
          const data = new Date(t.data);
          return data >= new Date(dataInicio) && data <= new Date(dataFim);
        })
        .map((t, index) => (
          <div
            key={index}
            style={{
              background: "#fff",
              padding: 15,
              borderRadius: 8,
              marginBottom: 10,
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
              borderLeft: t.tipo === "receita" ? "5px solid green" : "5px solid red"
            }}
          >
            <p><b>📅 Data:</b> {formatarData(t.data)}</p>

            <p style={{ color: t.tipo === "receita" ? "green" : "red" }}>
              <b>💸 Valor:</b> {formatar(t.valor)}
            </p>

            <p><b>📂 Categoria:</b> {t.categoria}</p>
            <p><b>🔁 Tipo:</b> {t.tipo}</p>
            <p><b>📝 Descrição:</b> {t.descricao}</p>

            <button
              onClick={() => deletar(index)}
              style={{
                marginTop: 10,
                background: "red",
                color: "#fff",
                border: "none",
                padding: "5px 10px",
                borderRadius: 5,
                cursor: "pointer"
              }}
            >
              🗑️ Deletar
            </button>
          </div>
        ))}
    </div>
  );
}

export default App;