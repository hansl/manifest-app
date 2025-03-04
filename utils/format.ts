import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import BigNumber from 'bignumber.js';

import env from '@/config/env';
import { TokenAmount } from '@/utils';
import { shiftDigits } from '@/utils/maths';

import { denomToAsset } from './ibc';

const SUFFIXES: [TokenAmount, string][] = [
  [new BigNumber(1e18), 'QT'],
  [new BigNumber(1e15), 'Q'],
  [new BigNumber(1e12), 'T'],
  [new BigNumber(1e9), 'B'],
  [new BigNumber(1e6), 'M'],
];

export function formatLargeNumber(num: TokenAmount, significantDigits = 0): string {
  if (num.isZero()) return '0';

  for (const [n, s] of SUFFIXES) {
    if (num.gte(n)) {
      return `${num.div(n).toFixed(2)}${s}`;
    }
  }

  return num.toFixed(significantDigits);
}

export function formatDenom(denom: string): string {
  const assetInfo = denomToAsset(env.chain, denom);

  // Fallback to cleaning the denom if no assetInfo
  let cleanDenom = denom.replace(/^factory\/[^/]+\//, '');

  // Skip cleaning for IBC denoms as they should be resolved via assetInfo
  if (cleanDenom.startsWith('ibc/')) {
    cleanDenom = assetInfo?.display.toUpperCase() ?? cleanDenom;
  } else if (cleanDenom.startsWith('u')) {
    cleanDenom = cleanDenom.slice(1).toUpperCase();
  }

  return cleanDenom;
}

export function formatAmount(amount: string, denom: string, metadata?: MetadataSDKType[]) {
  const meta = metadata?.find(m => m.base === denom);
  const exponent = Number(meta?.denom_units[1]?.exponent) || 6;
  return shiftDigits(amount, -exponent);
}
