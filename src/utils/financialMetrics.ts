export interface CostedSalesLine {
  quantity: number;
  unitCost: number;
}

export const calculateRecordedCOGS = (
  invoiceItems: readonly (readonly CostedSalesLine[])[]
): { complete: boolean; amount: number | null } => {
  const lines = invoiceItems.flat();
  const complete = lines.every(line =>
    Number.isFinite(line.quantity) &&
    line.quantity > 0 &&
    Number.isFinite(line.unitCost) &&
    line.unitCost > 0
  );

  return {
    complete,
    amount: complete
      ? lines.reduce((total, line) => total + line.unitCost * line.quantity, 0)
      : null
  };
};
