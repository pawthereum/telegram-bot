import { MoralisSwap } from "~/types/moralis";
import { ChainId, Token, TokenAmount } from "@uniswap/sdk";
import { NextRequest, NextResponse } from "next/server";
import { TELEGRAM_CHAT_ID, TOKEN } from "~/app/utils/config";
import { 
  getChain, 
  getDex, 
  getUsdValueOfChainCurrency, 
  getToken, 
  isArbitrage, 
  getBuyerAddress, 
  getRank
} from "~/app/utils";
import { constants } from "ethers";

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

export async function POST(req: NextRequest) {
  // ensure that this is a request that we should process
  const body = await req.json();
  if (!body) {
    return NextResponse.json({ error: 'No body' });
  }
  const { confirmed, logs, chainId, streamId } = body as unknown as MoralisSwap;
  console.log({ body });
  // if (streamId !== process.env.MORALIS_STREAM_ID) {
  //   return NextResponse.json({ error: 'Not our stream' });
  // }
  if (!confirmed) {
    return NextResponse.json({ error: 'Not confirmed' });
  }

  const swap = body;

  if (isArbitrage(swap)) {
    const msg = `💫 *Arbitrage!*
    The Pawth Arb bot just executed a successful arbitrage!`;
    await bot.sendMessage(TELEGRAM_CHAT_ID, msg, { parse_mode: 'Markdown', disable_web_page_preview: true })
    return NextResponse.json({ message: msg });
  }

  // setup variables we need for the msg
  const chain = getChain(parseInt(chainId));
  const chainCurrencyUsd = await getUsdValueOfChainCurrency(chain);
  const dex = getDex(swap.sender);
  const tokensReceived = new TokenAmount(getToken(chain), chain.id === 1 ? swap.amount0Out : swap.amount1In);
  const amountSpent = new TokenAmount(new Token(chain.id as ChainId, constants.AddressZero, 18), chain.id === 1 ? swap.amount1In : swap.amount0Out);
  const amountSpentUsd = parseFloat(amountSpent.toSignificant(8)) * chainCurrencyUsd;
  const buyer = getBuyerAddress(swap.to, dex);
  const tax = dex.tax.multiply(amountSpent).toFixed(2);
  const taxUsd = parseFloat(tax) * chainCurrencyUsd;
  const buyerBalance = new TokenAmount(getToken(chain), swap.triggers[0].value);
  const buyerBalanceBeforeBuy = tokensReceived.greaterThan(buyerBalance) ? new TokenAmount(getToken(chain), '0') : new TokenAmount(getToken(chain), buyerBalance.subtract(tokensReceived).raw.toString());
  const newRank = getRank(buyerBalance, getToken(chain));
  const oldRank = getRank(buyerBalanceBeforeBuy, getToken(chain));
  const isNewHolder = buyerBalance.equalTo(tokensReceived);

  // get out if this is not a buy
  const isBuy = () => {
    const unknownDex = dex.name === "Unknown";
    if (unknownDex) return false;
    if (chain.id === 1) {
      return swap.amount1In !== '0';
    }
    return swap.amount0Out !== '0';
  }
  if (!isBuy()) {
    return NextResponse.json({ error: 'Not a buy' });
  }

  // build the msg
  const alert = `🚨 *Buy Alert!*
  ${dex.icon} ${buyer} just bought ${amountSpent.toSignificant(6, { groupSeparator: ',' })} ${chain.nativeCurrency.symbol} ($${amountSpentUsd.toFixed(2)} USD) for ${tokensReceived.toSignificant(6, { groupSeparator: ',' })} ${TOKEN.symbol} on ${dex.name}!`;

  console.log({ alert })
  const toTheAnimals = tax > 0.00 ? `That's $${tax} the animals!` : ''; 

  const newHolder = isNewHolder ? `
  🥳 ${buyer} is a new $${TOKEN.symbol} holder on ${chain.name}! Everyone give them a big welcome!
  `: '';

  const rankUp = newRank.name !== oldRank.name ? `😺 *Rank Up Initiated!*
  ${buyer} went from a ${oldRank.name} to a [${newRank?.name}](${newRank?.img})! Congrats!` : '';

  // msg links
  const txLink = `
  🔎 [TX](${chain.blockExplorers.default.url}/tx/${swap.transactionHash}) | `;
  const chartLink = `📈 [Chart](${dex.chartUrl}) | `;
  const rankLink = `🦁 [View all ranks](https://cdn.discordapp.com/attachments/891351589162483732/931878322676322304/finfinfin.png)`;

  // concat it together
  const msg = alert + toTheAnimals + newHolder + rankUp + txLink + chartLink + rankLink;

  // send the message
  await bot.sendMessage(TELEGRAM_CHAT_ID, msg, { parse_mode: 'Markdown', disable_web_page_preview: true })

  console.log({ msg, tax });

  return NextResponse.json({ message: msg, tax });
}