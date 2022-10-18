import { UsuarioContext } from "./Usuario";

const { createContext, useState, useContext, useEffect } = require("react");
const { usePagamentoContext } = require("./Pagamento");


export const CarrinhoContext = createContext();

CarrinhoContext.displayName = "CarrinhoContext";

export const CarrinhoProvider = ({ children }) => {
	const [carrinho, setCarrinho] = useState([]);
  const [quantidadeProdutos, setQuantidadeProdutos] = useState(0);
  const [valorTotalCarrinho, setValorTotalCarrinho] = useState(0);
  return (
		<CarrinhoContext.Provider
      value={{
        carrinho,
        setCarrinho,
        quantidadeProdutos,
        setQuantidadeProdutos,
        valorTotalCarrinho,
        setValorTotalCarrinho,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
};

export const useCarrinhoContext = () => {
	const {
		carrinho,
    setCarrinho,
    quantidadeProdutos,
    setQuantidadeProdutos,
    valorTotalCarrinho,
    setValorTotalCarrinho,
  } = useContext(CarrinhoContext);
	
	const { formaPagamento } = usePagamentoContext();
	const { setSaldo } = useContext(UsuarioContext);

  function mudarQuantidade(id, quantidade) {
    return carrinho.map((itemDoCarrinho) => {
      if (itemDoCarrinho.id === id) itemDoCarrinho.quantidade += quantidade;
      return itemDoCarrinho;
    });
  }

	function efetuarCompra() {
		setCarrinho([]);	
		setSaldo(saldoAtual => saldoAtual - valorTotalCarrinho);
	}

  function addProduto(novoProduto) {
    const existeProduto = carrinho.some(
      (itemDoCarrinho) => itemDoCarrinho.id === novoProduto.id
    );

    if (!existeProduto) {
      novoProduto.quantidade = 1;
      return setCarrinho((carrinhoAnterior) => [
        ...carrinhoAnterior,
        novoProduto,
      ]);
    }
    setCarrinho(mudarQuantidade(novoProduto.id, 1));
  }

  function removeProduto(id) {
    const produto = carrinho.find((itemDoCarrinho) => itemDoCarrinho.id === id);
    const ultimoProduto = produto.quantidade === 1;

    if (ultimoProduto) {
      return setCarrinho((carrinhoAnterior) =>
        carrinhoAnterior.filter((itemDoCarrinho) => itemDoCarrinho.id !== id)
      );
    }
    setCarrinho(mudarQuantidade(id, -1));
  }

  useEffect(() => {
    const { novaQuantidade, novoTotal } = carrinho.reduce(
      (contador, produto) => ({
        novaQuantidade: contador.novaQuantidade + produto.quantidade,
        novoTotal: contador.novoTotal + (produto.valor * produto.quantidade),
      }),
      {
        novaQuantidade: 0,
        novoTotal: 0,
      }
    );
    setQuantidadeProdutos(novaQuantidade);
		setValorTotalCarrinho(novoTotal * formaPagamento.juros);
	}, [carrinho, setQuantidadeProdutos, setValorTotalCarrinho, formaPagamento ]);

  return {
    carrinho,
    setCarrinho,
    addProduto,
    removeProduto,
    quantidadeProdutos,
    setQuantidadeProdutos,
		valorTotalCarrinho,
		formaPagamento,
		efetuarCompra
  };
};
