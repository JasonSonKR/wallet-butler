import { Transaction, RecurrenceRule } from '../types/ledger';

// 날짜 문자열(YYYY-MM-DD)을 Date 객체로 변환 (UTC 문제 방지용)
const parseDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// Date 객체를 YYYY-MM-DD 문자열로 변환
const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// 해당 날짜가 해당 월의 "몇 번째 요일"인지 계산
// 예: 1일~7일 사이의 월요일 -> 첫 번째 월요일 (1 반환)
const getNthWeekday = (date: Date) => {
  const day = date.getDate();
  return Math.ceil(day / 7);
};

export const generateRecurringTransactions = (
  baseTransaction: Omit<Transaction, 'id'>,
  rule: RecurrenceRule
): Omit<Transaction, 'id'>[] => {
  const transactions: Omit<Transaction, 'id'>[] = [];
  const start = parseDate(rule.startDate);
  const end = parseDate(rule.endDate);
  
  // 고유 ID 생성 (crypto API 지원 시 사용, 아니면 기존 방식)
  const recurrenceId = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).slice(2, 11);

  let current = new Date(start);
  
  // 안전장치: 최대 생성 개수 제한 (브라우저 멈춤 방지, 약 5년치 주간 데이터 정도)
  // 사용자가 2099년까지 설정해도, 실제로는 300개까지만 생성하고 멈추도록 함 (성능 이슈)
  // 필요하다면 이 제한을 늘릴 수 있습니다.
  const MAX_ITERATIONS = 500; 
  let count = 0;

  while (current <= end && count < MAX_ITERATIONS) {
    let shouldAdd = false;

    switch (rule.frequency) {
      case 'WEEKLY':
      case 'BIWEEKLY':
      case 'QUARTERLY':
      case 'SEMIANNUAL':
      case 'ANNUAL':
        shouldAdd = true;
        break;
      case 'MONTHLY':
        if (rule.weekNumbers && rule.weekNumbers.length > 0) {
          // 매월 특정 주차(N번째 요일)인지 확인
          const nthWeekday = getNthWeekday(current);
          if (rule.weekNumbers.includes(nthWeekday)) {
            shouldAdd = true;
          }
        } else {
          // 주차 선택 없으면 매월 같은 날짜
          shouldAdd = true;
        }
        break;
    }

    if (shouldAdd) {
      transactions.push({
        ...baseTransaction,
        date: formatDate(current),
        recurrenceId,
      });
      count++;
    }

    // 날짜 증가 로직
    switch (rule.frequency) {
      case 'WEEKLY':
        current.setDate(current.getDate() + 7);
        break;
      case 'BIWEEKLY':
        current.setDate(current.getDate() + 14);
        break;
      case 'MONTHLY':
        if (rule.weekNumbers && rule.weekNumbers.length > 0) {
          // 주차 선택 모드: 다음 주 같은 요일로 이동하여 다시 검사
          // (예: 1주차 월요일 -> 2주차 월요일 -> ... -> 다음달 1주차 월요일)
          current.setDate(current.getDate() + 7); 
        } else {
          // 단순 매월 (같은 날짜)
          current.setMonth(current.getMonth() + 1);
        }
        break;
      case 'QUARTERLY':
        current.setMonth(current.getMonth() + 3);
        break;
      case 'SEMIANNUAL':
        current.setMonth(current.getMonth() + 6);
        break;
      case 'ANNUAL':
        current.setFullYear(current.getFullYear() + 1);
        break;
    }
  }

  return transactions;
};
