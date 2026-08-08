// No official Midtrans SDK is used here — their REST API is simple enough
// that a thin fetch wrapper avoids an extra dependency (CLAUDE.md: no
// dependencies we don't need).

const SNAP_BASE_URL = "https://app.sandbox.midtrans.com/snap/v1";

function getServerKey(): string {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key) throw new Error("MIDTRANS_SERVER_KEY is not set");
  return key;
}

function authHeader(): string {
  // Midtrans Basic Auth: base64(ServerKey + ":"), no password.
  return "Basic " + Buffer.from(`${getServerKey()}:`).toString("base64");
}

export interface CreateSnapTransactionParams {
  orderId: string;
  grossAmount: number;
  customerEmail?: string;
  finishRedirectUrl: string;
}

export interface SnapTransaction {
  token: string;
  redirect_url: string;
}

/** Creates a Snap transaction (sandbox) and returns its hosted payment
 * page URL. We use the plain redirect flow rather than embedding Snap.js,
 * to keep the widget/dashboard free of a third-party script. */
export async function createSnapTransaction(
  params: CreateSnapTransactionParams
): Promise<SnapTransaction> {
  const res = await fetch(`${SNAP_BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.grossAmount,
      },
      customer_details: params.customerEmail
        ? { email: params.customerEmail }
        : undefined,
      callbacks: { finish: params.finishRedirectUrl },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data?.error_messages?.join(", ") ?? "Gagal membuat transaksi Midtrans."
    );
  }
  return data as SnapTransaction;
}
