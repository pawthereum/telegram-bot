import { MoralisSwap } from "~/types/moralis";
import { ChainId, Token, TokenAmount } from "@uniswap/sdk";
import { NextRequest, NextResponse } from "next/server";
import { TELEGRAM_CHAT_ID, TOKEN } from "~/app/utils/config";
import { 
  getChain, 
  getDex, 
  getToken,
  getRank,
  getCoingeckoTrade,
  getCoingeckoPoolStats,
  getShortenedAddress
} from "~/app/utils";
import { constants, utils } from "ethers";
import { executeLegacyBot } from "~/app/utils/legacy";

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
  // setup variables we need for the msg
  const trade = await getCoingeckoTrade(swap);
  console.log({ trade })
  if (!trade) {
    return await executeLegacyBot(req);
  }
  // get out if this is not a buy
  const isBuy = trade.attributes.kind === 'buy';
  if (!isBuy) {
    return NextResponse.json({ error: 'Not a buy' });
  }
  const poolStats = await getCoingeckoPoolStats(swap);
  const dex = getDex(swap.sender);
  const chain = getChain(parseInt(chainId));
  const tokensReceived = new TokenAmount(
    getToken(chain), 
    utils.parseUnits(
      trade.attributes.to_token_amount, 
      TOKEN.decimals
    ).toString()
  );
  const amountSpent = new TokenAmount(
    new Token(chain.id as ChainId, constants.AddressZero, 18), 
    utils.parseEther(trade.attributes.from_token_amount).toString()
  );
  const amountSpentUsd = parseFloat(trade.attributes.price_from_in_usd) * parseFloat(trade.attributes.from_token_amount);
  const buyer = getShortenedAddress(trade.attributes.tx_from_address);
  const taxUsd = (Number(dex.tax.toSignificant(8)) / 100 * amountSpentUsd).toFixed(2);
  const buyerBalance = new TokenAmount(getToken(chain), swap.triggers[0].value);
  const buyerBalanceBeforeBuy = tokensReceived.greaterThan(buyerBalance) ? new TokenAmount(getToken(chain), '0') : new TokenAmount(getToken(chain), buyerBalance.subtract(tokensReceived).raw.toString());
  const newRank = getRank(buyerBalance, getToken(chain));
  const oldRank = getRank(buyerBalanceBeforeBuy, getToken(chain));
  const isNewHolder = buyerBalanceBeforeBuy.equalTo(new TokenAmount(getToken(chain), '0'));

  // build the msg
  const alert = `🚨 *Buy Alert!*
  ${dex.icon} ${buyer} just bought ${tokensReceived.toSignificant(6, { groupSeparator: ',' })} ${TOKEN.symbol} for ${amountSpent.toSignificant(6, { groupSeparator: ',' })} ${chain.nativeCurrency.symbol} ($${amountSpentUsd.toFixed(2)} USD) on ${dex.name}!
  `;

  console.log({ alert })
  const toTheAnimals = Number(taxUsd) > 0.00 ? 
  `*That's $${taxUsd} to the animals!!*
  `: ''; 

  const newHolder = isNewHolder ? `
  🥳 ${buyer} is a new $${TOKEN.symbol} holder on ${chain.name}! Everyone give them a big welcome!
  `: '';

  const rankUp = newRank.name !== oldRank.name ? `😺 *Rank Up Initiated!*
  ${buyer} went from a ${oldRank.name} to a [${newRank?.name}](${newRank?.img})! Congrats!
  ` : '';

  const poolStatsMsg = `
  📊 *Pool Stats*
  ${TOKEN.symbol} is trading at: $${parseFloat(poolStats.attributes.base_token_price_usd).toLocaleString([], {
    maximumFractionDigits: 4,
    minimumFractionDigits: 2,
  })} in the ${poolStats.attributes.name} pool on ${dex.name}.
  There have been ${poolStats.attributes.transactions.h24.buys} buys from ${poolStats.attributes.transactions.h24.buyers} buyers in the last 24 hours in this pool totaling ${parseFloat(poolStats.attributes.volume_usd.h24).toLocaleString([], {
    currency: 'USD',
    style: 'currency',
  })} in volume.
  `;

  // msg links
  const txLink = `
  🔎 [TX](${chain.blockExplorers.default.url}/tx/${trade.attributes.tx_hash}) | `;
  const chartLink = `📈 [Chart](${dex.chartUrl}) | `;
  const rankLink = `🦁 [View all ranks](https://cdn.discordapp.com/attachments/891351589162483732/931878322676322304/finfinfin.png)`;

  // concat it together
  const msg = alert + toTheAnimals + newHolder + rankUp + poolStatsMsg + txLink + chartLink + rankLink;

  // send the message
  await bot.sendMessage(TELEGRAM_CHAT_ID, msg, { parse_mode: 'Markdown', disable_web_page_preview: newRank.name === oldRank.name })

  console.log({ msg, taxUsd });

  return NextResponse.json({ message: msg, tax: taxUsd });
}