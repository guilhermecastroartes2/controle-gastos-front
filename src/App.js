import { useEffect, useState } from "react";

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

  // Buscar transações
  const buscarTransacoes = () => {
    fetch(API)
      .then((res) => res.json())
      .then((data) => setTransacoes(data))
      .catch(() => alert("Erro ao carregar"));
  };

  useEffect(() => {
    buscarTransacoes();    
  }, []);

  // Adicionar transação
  const adicionar = () => {
    if (!valor || isNaN(valor)) {
      alert("Valor inválido");
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
      .then(() => buscarTransacoes())
      .then(() => {
        setValor("");
        setCategoria("");
        setDescricao("");
        setTipo("despesa");
        alert("Adicionado!");
      })
      .finally(() => setLoading(false));
  };

  const deletar = (index) => {
    const novaLista = transacoes.filter((_, i) => i !== index);
    setTransacoes(novaLista);
  };

  // Formatação de moeda
  const formatar = (v) =>
    Number(v).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  // Formatação data  
  const formatarData = (d) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "—";
  
  const filtradas = transacoes.filter((t) => {
    if (!dataInicio || !dataFim) return true;
    const data = new Date(t.data);
    return data >= new Date(dataInicio) && data <= new Date(dataFim);
  });

  // Cálculos
  const totalReceitas = filtradas
    .filter((t) => t.tipo === "receita")
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const totalDespesas = filtradas
    .filter((t) => t.tipo === "despesa")
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const saldo = totalReceitas - totalDespesas;

  
  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "Arial" }}>
      <h1>💰 Controle de Gastos</h1>

      {/* RESUMO */}
      <p>💰 Saldo: {formatar(saldo)}</p>

      {/* FILTRO */}
      <input type="date" onChange={(e) => setDataInicio(e.target.value)} />
      <input type="date" onChange={(e) => setDataFim(e.target.value)} />
        
      {/* FORM */}
      <input value={valor} onChange={(e) => setValor(e.target.value)} placeholder="Valor" />
      <input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Categoria" />
      <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição" />


      <select onChange={(e) => setTipo(e.target.value)}>  
        <option value="despesa">Despesa</option>
        <option value="receita">Receita</option>
      </select>

      <button onClick={adicionar}>
        {loading ? "Adicionando..." : "Adicionar"}
      </button>
      

      {/* LISTA */}
      {filtradas.map((t, i) => (
        <div key={i} style={{
          borderLeft: t.tipo === "receita" ? "5px solid green" : "5px solid red",
          margin: 10,
          padding: 10
        }}>
          <p>{formatarData(t.data)}</p>
          <p>{formatar(t.valor)}</p>
          <p>{t.categoria}</p>
          <p>{t.descricao}</p>

          <button onClick={() => deletar(i)}>🗑️ Deletar</button>
        </div>
      ))}
    </div>
  );
}

export default App;