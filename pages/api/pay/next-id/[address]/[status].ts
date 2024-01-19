/* eslint-disable indent */
/**
 * API endpoint: `/api/pay/next-id/[address]/[status]`
 * Get the next requested pay id for sender/receiver with given status
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { BigNumber, Contract, ethers } from 'ethers';

// Import the SendersTreasury ABI from the JSON file
import SendersTreasuryJson from '../../../abi/SendersTreasury.json';
import { PROVIDER, SENDERS_TREASURY_ADDRESS } from '../../../constants';
const abi = SendersTreasuryJson.abi;

interface ResponseData {
  code: number;
  status: string;
  result: BigNumber;
}

// copied from solidity contract
// variants start from 1.
enum PayRequestStatus {
  REQUESTED = 1,
  SIGNED,
  DONE,
}

interface PayRequest {
  status: PayRequestStatus; // 1: requested payment, 2: signed requested payment, 3: payment done
  sender: string;
  receiver: string;
  amount: BigNumber;
  signature: string;
}

interface PayIdResult {
  payId?: BigNumber;
  error?: string;
}

// get the next requested pay id for sender/receiver with given status
export async function getNextPayIdFor(
  address: string,
  status: PayRequestStatus
): Promise<PayIdResult> {
  try {
    const sendersTreasuryContract: Contract = new ethers.Contract(
      SENDERS_TREASURY_ADDRESS,
      abi,
      PROVIDER
    );

    const requestedPayIds: BigNumber[] =
      await sendersTreasuryContract.getRequestedPayIdsOf(address);

    let payId: BigNumber = BigNumber.from(0);

    // get the next pay id that matches with the status code
    for (const pid of requestedPayIds) {
      const payRequest: PayRequest =
        await sendersTreasuryContract.getPaymentRequest(pid);

      if (payRequest.status === status) {
        payId = pid;
        break;
      }
    }

    return { payId };
  } catch (error) {
    return { error: `Internal Server Error: ${error}` };
  }
}

function toPayRequestStatus(status: string): PayRequestStatus | undefined {
  switch (status) {
    case 'REQUESTED':
      return PayRequestStatus.REQUESTED;
    case 'SIGNED':
      return PayRequestStatus.SIGNED;
    case 'DONE':
      return PayRequestStatus.DONE;
    default:
      return undefined;
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
    const { address, status } = req.query;

    if (toPayRequestStatus(status as string) === undefined) {
      res.status(400).json({ error: `Invalid status: ${status}` });
    }

    const result = await getNextPayIdFor(
      address as string,
      toPayRequestStatus(status as string)
    );

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    if (result.payId.toNumber() === 0) {
      res.status(404).json({
        error: 'No Pay Id found',
      });
    }

    res.status(200).json({
      code: 200,
      status: 'Ok',
      result: result.payId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: 'Internal Server Error' });
  }
}
