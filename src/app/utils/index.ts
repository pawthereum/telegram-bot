import { ChainId, Percent, Token, TokenAmount } from "@uniswap/sdk";
import { mainnet, bsc, type Chain } from "wagmi/chains";
import { TOKEN } from "./config";
import { Dex, MoralisSwap } from "~/types/moralis";
import { Pool, type Trade } from "~/types/coingecko";

export const getCoingeckoTrade = async (swap: MoralisSwap) => {
  const coingeckoChainId = Number(swap.chainId) === 1 ? 'eth' : 'bsc';
  const coingeckoTradeRes = await fetch(`https://api.geckoterminal.com/api/v2/networks/${coingeckoChainId}/pools/${swap.logs[0].address}/trades`);
  const coingeckoTradeJson = await coingeckoTradeRes.json() as { data: Trade[] };
  const coingeckoTrade = coingeckoTradeJson.data.find(t => t.attributes.tx_hash.toLowerCase() === swap.logs[0].transactionHash.toLowerCase());
  if (!coingeckoTrade) {
    return null;
  }
  return coingeckoTrade;
}

export const getCoingeckoPoolStats = async (swap: MoralisSwap) => {
  const coingeckoChainId = Number(swap.chainId) === 1 ? 'eth' : 'bsc';
  const coingeckoPoolStatsRes = await fetch(`https://api.geckoterminal.com/api/v2/networks/${coingeckoChainId}/pools/${swap.logs[0].address}`);
  const coingeckoPoolStatsJson = await coingeckoPoolStatsRes.json() as { data: Pool };
  return coingeckoPoolStatsJson.data;
}

export const getChain = (chainId: number) => {
  switch (chainId) {
    case 1:
      return mainnet;
    default:
      return bsc;
  }
}

export const getShortenedAddress = (addr: string, preChar?: number, postChar?: number) => {
  if (!addr) return '';
  return addr.slice(0, preChar || 4)  + '...' + addr.slice(addr.length - (postChar || 4), addr.length);
}

export const getToken = (chain: Chain) => {
  switch (chain.id) {
    case mainnet.id:
      return new Token(chain.id, TOKEN[mainnet.id], TOKEN.decimals, TOKEN.symbol, TOKEN.name);
    default: // default bsc
      return new Token(chain.id as ChainId, TOKEN[bsc.id], TOKEN.decimals, TOKEN.symbol, TOKEN.name);
  }
}

export const getDex = (address: string) => {
  switch (address.toLowerCase()) {
    case '0x13f4ea83d0bd40e75c8222255bc855a974568dd4':
      return {
        name: 'PancakeSwap',
        icon: '🥞',
        tax: new Percent('2', '100'),
        chartUrl: 'https://www.dextools.io/app/bsc/pair-explorer/0x0babbb875c4eec2c3f3fc7936ec9632fdce1fac4',
      } as Dex;
    case '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad':
      return {
        name: 'Uniswap',
        icon: '🦄',
        tax: new Percent('1', '100'),
        chartUrl: 'https://www.dextools.io/app/ether/pair-explorer/0x800a45f2b861229d59e952aef57b22e84ff949a1',
      } as Dex;
    case '0xdef1c0ded9bec7f1a1670819833240f027b25eff':
      return {
        name: '0x Protocol',
        icon: '0️⃣',
        tax: new Percent('1', '100'),
        chartUrl: 'https://www.dextools.io/app/ether/pair-explorer/0x800a45f2b861229d59e952aef57b22e84ff949a1',
      } as Dex;
    case '0x54a0baf656fcdc383a7c129751742fecd4eee726':
      return {
        name: 'RadioShack',
        icon: '📻',
        tax: new Percent('1', '100'),
        chartUrl: 'https://www.dextools.io/app/ether/pair-explorer/0x54a0baf656fcdc383a7c129751742fecd4eee726',
      } as Dex;
    case '0xee9036b4d466de198aba04068740da811e2691fd':
      return {
        name: 'SafemoonSwap',
        icon: '🚀',
        tax: new Percent('2', '100'),
        chartUrl: 'https://www.dextools.io/app/bsc/pair-explorer/0x11b058493cc61691cae52b6512817c4f913260c2',
      } as Dex;
    case '0xbaf9a5d4b0052359326a6cdab54babaa3a3a9643':
      return {
        name: '1inch',
        icon: '🐴',
        tax: new Percent('1', '100'),
        chartUrl: 'https://www.dextools.io/app/ether/pair-explorer/0x800a45f2b861229d59e952aef57b22e84ff949a1',
      } as Dex;
    case '0xfb96997ac9d14f39d202e6d505c76ee01f85013d':
      return {
        name: 'PawSwap',
        icon: '🐾',
        tax: new Percent('2', '100'),
        chartUrl: 'https://www.dextools.io/app/bsc/pair-explorer/0x0babbb875c4eec2c3f3fc7936ec9632fdce1fac4',
      } as Dex;
    case '0x14349bea20b5067f5f1fc1d0f534716b9c6d4636':
      return {
        name: 'PawSwap',
        icon: '🐾',
        tax: new Percent('2', '100'),
        chartUrl: 'https://www.dextools.io/app/bsc/pair-explorer/0x0babbb875c4eec2c3f3fc7936ec9632fdce1fac4',
      } as Dex;
    case '0x7df9dfd9168ae53dc5141110a0b476a053f70ed1':
      return {
        name: 'PawSwap',
        icon: '🐾',
        tax: new Percent('15', '1000'),
        chartUrl: 'https://www.dextools.io/app/ether/pair-explorer/0x800a45f2b861229d59e952aef57b22e84ff949a1',
      } as Dex;
    case '0x72548521eddb0bbdcc3c55ab63ca08c541d8171d':
      return {
        name: 'PawSwap',
        icon: '🐾',
        tax: new Percent('1', '200'),
        chartUrl: 'https://www.dextools.io/app/ether/pair-explorer/0x800a45f2b861229d59e952aef57b22e84ff949a1',
      } as Dex;
    case '0x74de5d4fcbf63e00296fd95d33236b9794016631':
      return {
        name: 'Metamask Swapper',
        icon: '🦊',
        tax: new Percent('1', '100'),
        chartUrl: 'https://www.dextools.io/app/ether/pair-explorer/0x800a45f2b861229d59e952aef57b22e84ff949a1',
      } as Dex;
    case '0x1111111254eeb25477b68fb85ed929f73a960582':
      return {
        name: '1inch',
        icon: '🐴',
        tax: new Percent('1', '100'),
        chartUrl: 'https://www.dextools.io/app/ether/pair-explorer/0x800a45f2b861229d59e952aef57b22e84ff949a1',
      } as Dex;
    default:
      return {
        name: 'Unknown',
        icon: '🤷',
        tax: new Percent('1', '100'),
        chartUrl: 'https://www.dextools.io/app/ether/pair-explorer/0x800a45f2b861229d59e952aef57b22e84ff949a1',
      } as Dex;
  }
}

export const getBuyerAddress = (address: string, dex: Dex) => {
  if (dex.name === 'Metamask Swapper' || dex.name === '1inch') {
    return 'Someone'
  }
  return getShortenedAddress(address);
}

export const getUsdValueOfChainCurrency = async (chain: Chain) => {
  const currency = () => {
    switch (chain.id) {
      case 1:
        return 'ethereum';
      default:
        return 'binancecoin';
    }
  };

  const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${currency()}&vs_currencies=usd`);
  const json = await res.json();
  return json[currency()].usd;
}

export const isArbitrage = (swap: any) => {
  return swap.to.toLowerCase() === '0x907cdce47406682149cf21e37f36b307e807740e';
};

export const getRank = (balance: TokenAmount, token: Token) => {
  type Rank = {
    name: string;
    img: string;
    threshold: number;
  }
  const rankImgUrl = 'https://ipfs.io/ipfs/QmQbLBZk2SNDiMwo1eQxwvtsSgDiVkHA3VhE1Pa19837iu/';
  const ranks: Rank[] = [
    { name: 'Stray Cat', img: rankImgUrl + '1.png', threshold: 50 },
    { name: 'Kitten', img: rankImgUrl + '2.png', threshold: 100 },
    { name: 'Dwarf Cat', img: rankImgUrl + '3.png', threshold: 200 },
    { name: 'Ragdoll', img: rankImgUrl + '4.png', threshold: 300 },
    { name: 'Maine Coon', img: rankImgUrl + '5.png', threshold: 500 },
    { name: 'Abbysinian', img: rankImgUrl + '6.png', threshold: 750 },
    { name: 'Scottish Fold', img: rankImgUrl + '7.png', threshold: 1_000 },
    { name: 'Cornish Rex', img: rankImgUrl + '8.png', threshold: 2_000 },
    { name: 'Persian', img: rankImgUrl + '9.png', threshold: 3_000 },
    { name: 'Siamese', img: rankImgUrl + '10.png', threshold: 5_000 },
    { name: 'Sphynx', img: rankImgUrl + '11.png', threshold: 7_500 },
    { name: 'Himalayan', img: rankImgUrl + '12.png', threshold: 10_000 },
    { name: 'Black-footed', img: rankImgUrl + '13.png', threshold: 20_000 },
    { name: 'Pallas', img: rankImgUrl + '14.png', threshold: 30_000 },
    { name: 'Iriomote', img: rankImgUrl + '15.png', threshold: 50_000 },
    { name: 'Sand Cat', img: rankImgUrl + '16.png', threshold: 75_000 },
    { name: 'Desert Lynx', img: rankImgUrl + '17.png', threshold: 100_000 },
    { name: 'Serval', img: rankImgUrl + '18.png', threshold: 200_000 },
    { name: 'Puma', img: rankImgUrl + '19.png', threshold: 300_000 },
    { name: 'Leopard', img: rankImgUrl + '20.png', threshold: 500_000 },
    { name: 'Clouded Leopard', img: rankImgUrl + '21.png', threshold: 750_000 },
    { name: 'Cheetah', img: rankImgUrl + '22.png', threshold: 1_000_000 },
    { name: 'Jaguar', img: rankImgUrl + '23.png', threshold: 2_000_000 },
    { name: 'Snow Leopard', img: rankImgUrl + '24.png', threshold: 3_000_000 },
    { name: 'Black Panther', img: rankImgUrl + '25.png', threshold: 5_000_000 },
    { name: 'Tiger', img: rankImgUrl + '26.png', threshold: 7_500_000 },
    { name: 'Lion', img: rankImgUrl + '27.png', threshold: 10_000_000 },
    // { name: 'Sabertooth', img: rankImgUrl + 'sabertooth.png', threshold: 10000000 },
  ];
  if (balance.equalTo(new TokenAmount(token, '0'))) {
    return ranks[0];
  }
  const bal = parseFloat(balance.toSignificant(6));
  let rankIndex = ranks.findIndex(r => {
    return bal < r.threshold
  })
  if (rankIndex === -1) {
    rankIndex = ranks.length - 1;
  }
  return ranks[rankIndex]
}