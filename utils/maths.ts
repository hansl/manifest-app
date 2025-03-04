import BigNumber from 'bignumber.js';

import { TokenAmount } from '@/utils/types';

export const shiftDigits = (
  num: TokenAmount,
  places: number,
  decimalPlaces?: number
): TokenAmount => {
  try {
    const result = new BigNumber(num)
      .shiftedBy(places)
      .decimalPlaces(decimalPlaces ?? 6, BigNumber.ROUND_DOWN);

    if (result.isNaN()) {
      console.warn(`Calculation resulted in NaN: ${num}, ${places}`);
      return '0';
    }

    return result.toString();
  } catch (error) {
    console.error(`Error in shiftDigits: ${error}`);
    return '0';
  }
};

export const parseNumberToBigInt = (v: string, maxDigits: number = 6) => {
  const amount = new BigNumber(v);
  if (!amount.isFinite()) {
    console.error(`Invalid input passed to parseNumberToBigInt: ${v}`);
    return BigInt(0);
  }
  const precision = new BigNumber(10).pow(maxDigits);

  // Round to maxDigits decimal places before converting to base units
  const roundedAmount = amount.toFixed(maxDigits);
  const b = new BigNumber(roundedAmount).times(precision).toFixed(0);

  return BigInt(b);
};

export const calculateIsUnsafe = (
  newPower: string | number,
  currentPower: string | number,
  totalVP: string | number
): boolean => {
  const newVP = BigInt(Number.isNaN(Number(newPower)) ? 0 : newPower);
  const currentVP = BigInt(Number.isNaN(Number(currentPower)) ? 0 : currentPower);
  const totalVPBigInt = BigInt(Number.isNaN(Number(totalVP)) ? 0 : totalVP);

  if (totalVPBigInt === 0n) {
    return newVP !== currentVP;
  }

  const currentPercentage = (currentVP * 100n) / totalVPBigInt;
  const newPercentage = (newVP * 100n) / totalVPBigInt;

  const changePercentage =
    newPercentage > currentPercentage
      ? newPercentage - currentPercentage
      : currentPercentage - newPercentage;

  return changePercentage > 30n;
};
