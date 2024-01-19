/**
 * API endpoint: `/api/nova/balance/[address]`
 * Get balance of address on Nova domain
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { BigNumber, ethers } from 'ethers';
import { PROVIDER } from '../../constants';

interface BalanceResult {
  balance?: BigNumber;
  error?: string;
}

interface BalanceResponse {
  address: string;
  balance: string;
};

interface ResponseData {
  code: number;
  status: string;
  result: BalanceResponse;
};

// TODO: Put this function inside `viewNovaBalanceOf` in utils.ts of backend lib.
// NOTE: this function just returns the balance of the given address.
export async function viewNovaBalanceOf(
  provider: ethers.providers.JsonRpcProvider,
  userAddress: string,
): Promise<BalanceResult> {
  try {
    const balance = await provider.getBalance(userAddress);
    return {balance};
  } catch (error) {
    return {error: `Internal Server Error: ${error}`};
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>,
) {
  // Ensure we're dealing with a GET request
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { address } = req.query;

    const result = await viewNovaBalanceOf(PROVIDER, address as string);

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    const balanceResponse: BalanceResponse = {
      address: address as string,
      balance: result.balance.toString(),
    };
    res.status(200).json({
      code: 200,
      status: 'Ok',
      result: balanceResponse,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
