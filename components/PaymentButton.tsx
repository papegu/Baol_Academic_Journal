export default function PaymentButton({ amount, onPay, disabled = false }: { amount: number; onPay: () => void; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={onPay}
      className={`px-4 py-2 rounded text-white ${disabled ? 'bg-brand-gray-300' : 'bg-brand-green-600 hover:bg-brand-green-700'}`}
      aria-disabled={disabled}
    >
      Payer {amount.toFixed(0)} FCFA
    </button>
  );
}
