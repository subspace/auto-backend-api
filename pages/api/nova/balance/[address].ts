/**
 * Get balance of address on Nova domain
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { BigNumber, ethers } from 'ethers';
import { PROVIDER } from '../../constants';

type BalanceResponse = {
  address: string;
  balance: string;
};

type ResponseData = {
  code: number;
  status: string;
  result: BalanceResponse;
};

// TODO: Put this function inside `viewNovaBalanceOf` in utils.ts of backend lib.
// NOTE: this function just returns the balance of the given address.
export async function viewNovaBalanceOf(
  provider: ethers.providers.JsonRpcProvider,
  userAddress: string,
): Promise<BigNumber> {
  try {
    const balance = await provider.getBalance(userAddress);
    return balance;
  } catch (error) {
    throw new Error(`Error thrown during viewing balance: ${error}`);
  }
}

export default async function getBalance(
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

    const balance = await viewNovaBalanceOf(PROVIDER, address as string);

    const balanceResponse: BalanceResponse = {
      address: address as string,
      balance: balance.toString(),
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
