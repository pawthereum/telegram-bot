import { MoralisSwap } from "~/types/moralis";
import { TokenAmount } from "@uniswap/sdk";
import { NextRequest, NextResponse } from "next/server";
import { TOKEN } from "~/app/utils/config";
import { 
  getChain, 
  getDex, 
  getUsdValueOfChainCurrency, 
  getToken, 
  isArbitrage, 
  getBuyerAddress, 
  getRank
} from "~/app/utils";

export async function POST(req: NextRequest) {
  // ensure that this is a request that we should process
  const body = await req.json();
  if (!body) {
    return NextResponse.json({ error: 'No body' });
  }
  const { confirmed, logs, chainId } = body as unknown as MoralisSwap;
  if (!confirmed) {
    return NextResponse.json({ error: 'Not confirmed' });
  }

  if (isArbitrage(body)) {
    return NextResponse.json({ message: `💫 *Arbitrage!*
      The Pawth Arb bot just executed a successful arbitrage!` 
    });
  }

  // setup variables we need for the msg
  const swap = logs[0];
  const chain = getChain(parseInt(chainId));
  const chainCurrencyUsd = await getUsdValueOfChainCurrency(chain);
  const dex = getDex(swap.sender);
  const tokensReceived = new TokenAmount(getToken(chain), swap.amount1Out);
  const amountSpent = new TokenAmount(getToken(chain), swap.amount0In);
  const amountSpentUsd = parseFloat(amountSpent.toSignificant(8)) * chainCurrencyUsd;
  const buyer = getBuyerAddress(swap.to, dex);
  const tax = dex.tax.multiply(amountSpent).toFixed(2);
  const taxUsd = parseFloat(tax) * chainCurrencyUsd;
  const buyerBalance = new TokenAmount(getToken(chain), swap.triggers[0].value);
  const buyerBalanceBeforeBuy = tokensReceived.greaterThan(buyerBalance) ? new TokenAmount(getToken(chain), '0') : new TokenAmount(getToken(chain), buyerBalance.subtract(tokensReceived).raw.toString());
  const newRank = getRank(buyerBalance, getToken(chain));
  const oldRank = getRank(buyerBalanceBeforeBuy, getToken(chain));
  const isNewHolder = buyerBalance.equalTo(tokensReceived);

  // build the msg
  const alert = `🚨 *Buy Alert!*
  ${dex.icon} ${buyer} just bought ${amountSpent.toSignificant(6, { groupSeparator: ',' })} ${chain.nativeCurrency.symbol} ($${amountSpentUsd.toFixed(2)} USD) for ${tokensReceived.toSignificant(6, { groupSeparator: ',' })} ${TOKEN.symbol}!
  That's $${taxUsd} to the animals!`;

  const newHolder = isNewHolder ? `
  🥳 ${buyer} is a new $${TOKEN.symbol} holder on ${chain.name}! Everyone give them a big welcome!
  `: '';

  const rankUp = newRank.name !== oldRank.name ? `😺 *Rank Up Initiated!*
  ${buyer} went from a ${oldRank.name} to a [${newRank?.name}](${newRank?.img})! Congrats!` : '';

  // msg links
  const txLink = `🔎 [TX](https://${chain.blockExplorers.default.url}/tx/${swap.transactionHash}) | `;
  const chartLink = `📈 [Chart](${dex.chartUrl}) | `;
  const rankLink = `🦁 [View all ranks](https://cdn.discordapp.com/attachments/891351589162483732/931878322676322304/finfinfin.png)`;

  // concat it together
  const msg = alert + newHolder + rankUp + txLink + chartLink + rankLink;

  return NextResponse.json({ message: msg });
}