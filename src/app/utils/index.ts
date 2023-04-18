import { ChainId, Percent, Token, TokenAmount } from "@uniswap/sdk";
import { mainnet, bsc, type Chain } from "wagmi/chains";
import { TOKEN } from "./config";
import { MoralisSwap, Dex } from "~/types/moralis";

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
    case '0xc81797e888de6f35bf875e62186f54509cc3e5f7':
      return {
        name: 'Uniswap',
        icon: '🦄',
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
    case '0x524bc73fcb4fb70e2e84dc08efe255252a3b026e':
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
        tax: new Percent('1', '100'),
        chartUrl: 'https://www.dextools.io/app/bsc/pair-explorer/0x0babbb875c4eec2c3f3fc7936ec9632fdce1fac4',
      } as Dex;
    case '0x74de5d4fcbf63e00296fd95d33236b9794016631':
      return {
        name: 'Metamask Swapper',
        icon: '🦊',
        tax: new Percent('2', '100'),
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
  const rankImgUrl = 'https://cdn.pawthereum.com/files/ranks/';
  const ranks: Rank[] = [
    { name: 'Stray Cat', img: rankImgUrl + 'strayCat.png', threshold: 50 },
    { name: 'Kitten', img: rankImgUrl + 'kitten.png', threshold: 100 },
    { name: 'Dwarf Cat', img: rankImgUrl + 'dwarfCat.png', threshold: 200 },
    { name: 'Ragdoll', img: rankImgUrl + 'ragdoll.png', threshold: 300 },
    { name: 'Maine Coon', img: rankImgUrl + 'maineCoon.png', threshold: 500 },
    { name: 'Abbysinian', img: rankImgUrl + 'abbysinian.png', threshold: 750 },
    { name: 'Scottish Fold', img: rankImgUrl + 'scottishFold.png', threshold: 1_000 },
    { name: 'Cornish Rex', img: rankImgUrl + 'cornishRex.png', threshold: 2_000 },
    { name: 'Persian', img: rankImgUrl + 'persian.png', threshold: 3_000 },
    { name: 'Siamese', img: rankImgUrl + 'siamese.png', threshold: 5_000 },
    { name: 'Sphynx', img: rankImgUrl + 'sphynx.png', threshold: 7_500 },
    { name: 'Himalayan', img: rankImgUrl + 'himalayan.png', threshold: 10_000 },
    { name: 'Black-footed', img: rankImgUrl + 'blackFooted.png', threshold: 20_000 },
    { name: 'Pallas', img: rankImgUrl + 'pallas.png', threshold: 30_000 },
    { name: 'Iriomote', img: rankImgUrl + 'iriomote.png', threshold: 50_000 },
    { name: 'Sand Cat', img: rankImgUrl + 'sandCat.png', threshold: 75_000 },
    { name: 'Desert Lynx', img: rankImgUrl + 'desertLynx.png', threshold: 100_000 },
    { name: 'Serval', img: rankImgUrl + 'serval.png', threshold: 200_000 },
    { name: 'Puma', img: rankImgUrl + 'puma.png', threshold: 300_000 },
    { name: 'Leopard', img: rankImgUrl + 'leopard.png', threshold: 500_000 },
    { name: 'Clouded Leopard', img: rankImgUrl + 'cloudedLeopard.png', threshold: 750_000 },
    { name: 'Cheetah', img: rankImgUrl + 'cheetah.png', threshold: 1_000_000 },
    { name: 'Jaguar', img: rankImgUrl + 'jaguar.png', threshold: 2_000_000 },
    { name: 'Snow Leopard', img: rankImgUrl + 'snowLeopard.png', threshold: 3_000_000 },
    { name: 'Black Panther', img: rankImgUrl + 'blackPanther.png', threshold: 5_000_000 },
    { name: 'Tiger', img: rankImgUrl + 'tiger.png', threshold: 7_500_000 },
    { name: 'Lion', img: rankImgUrl + 'lion.png', threshold: 10_000_000 },
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