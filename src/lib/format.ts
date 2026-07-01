export const formatMoney = (amount: number) => {
  return `$${amount.toLocaleString('ru-RU')}`;
};
