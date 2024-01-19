/**
 * API endpoint: `/api/pay/ids/[user]`
 * Get the requested pay ids for sender/receiver
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { BigNumber, ethers, Contract } from 'ethers';
import { PROVIDER, SENDERS_TREASURY_ADDRESS } from '../../constants';

// Import the SendersTreasury ABI from the JSON file
import SendersTreasuryJson from '../.././abi/SendersTreasury.json';
const abi = SendersTreasuryJson.abi;

interface ResponseData {
  code: number;
  status: string;
  result: BigNumber[];
}

interface PayIdsResult {
  payIds?: BigNumber[];
  error?: string;
}

// get the requested pay ids for sender/receiver
export async function getRequestedPayIds(
  senderOrReceiver: string
): Promise<PayIdsResult> {
  try {
    const sendersTreasuryContract: Contract = new ethers.Contract(
      SENDERS_TREASURY_ADDRESS,
      abi,
      PROVIDER
    );

    const requestedPayIds: BigNumber[] =
      await sendersTreasuryContract.getRequestedPayIdsOf(senderOrReceiver);

    return { payIds: requestedPayIds };
  } catch (error) {
    return { error: `Internal Server Error: ${error}` };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>
) {
  // Ensure we're dealing with a GET request
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { user } = req.query;

    const result = await getRequestedPayIds(user as string);
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.status(200).json({
      code: 200,
      status: 'Ok',
      result: result.payIds,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
