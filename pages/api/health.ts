import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  code: number;
  status: string;
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>,
) {
  // Ensure we're dealing with a GET request
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Error handling considered with try/catch
  // for GET requests
  try {
    res.status(200).json({
      code: 200,
      status: 'Ok',
      message: 'Auto PoC API is up and running!',
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
