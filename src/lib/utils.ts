import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount);
}

// 금액을 한글로 변환하는 함수
export function numberToKorean(number: number): string {
  if (number === 0) return '';
  
  // 음수 처리 및 안전성 확보
  let inputNumber = Math.abs(number);
  const unitWords    = ['', '만', '억', '조', '경'];
  const splitUnit    = 10000;
  let resultString   = '';

  for (let i = 0; i < unitWords.length; i++) {
    const unitResult = inputNumber % splitUnit;
    inputNumber = Math.floor(inputNumber / splitUnit);

    if (unitResult > 0) {
      resultString = String(unitResult) + unitWords[i] + resultString;
    }
    if (inputNumber === 0) break;
  }

  return resultString + '원';
}

export const CATEGORIES = ['식비', '카페/간식', '쇼핑', '교통', '주거/통신', '의료/건강', '문화/여가', '교육', '저축/투자', '기타'] as const;
export const INCOME_CATEGORIES = ['고정 수입', '비고정 수입'] as const;

export const ALLOCATION_LABELS: Record<string, string> = {
  INVEST_SAFE: '안정 투자',
  INVEST_AGGRESSIVE: '공격 투자',
  LIVING: '생활비',
  EVENT: '경조사/비정기', // 명칭 변경
};

export const FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: '매주',
  BIWEEKLY: '2주마다',
  MONTHLY: '매월',
  QUARTERLY: '분기마다',
  SEMIANNUAL: '반기마다',
  ANNUAL: '매년',
};
