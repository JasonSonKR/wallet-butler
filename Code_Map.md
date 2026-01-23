# Code Map

## 📂 src/
소스 코드의 메인 디렉토리입니다.
- **main.tsx**: React 앱의 진입점(Entry Point)입니다.
- **App.tsx**: 앱의 메인 레이아웃을 담당하며, 탭 전환 상태와 모달 상태를 관리합니다.

### 📂 components/
UI를 구성하는 리액트 컴포넌트들이 위치합니다.
- **BottomNav.tsx**: 하단 탭 네비게이션 바입니다.
- **CalendarView.tsx**: 메인 화면의 달력 뷰를 렌더링합니다.
- **TransactionList.tsx**: 선택된 날짜의 거래 내역 리스트를 보여줍니다.
 - **TransactionItem.tsx**: 리스트 내의 개별 거래 내역 아이템을 표시합니다.
- **TransactionForm.tsx**: 수입/지출/예산 내역을 입력하고 수정하는 모달 폼입니다.
- **DateActionMenu.tsx**: 날짜를 클릭했을 때 수행할 작업(예산/지출/수입 추가)을 선택하는 메뉴입니다.
- **AssetView.tsx**: 자산 탭의 내용을 담당하며, 자산 현황과 목록을 관리합니다.
- **AnalysisView.tsx**: 분석 탭의 내용을 담당하며, 차트와 낭비 캐릭터를 보여줍니다.
- **BudgetView.tsx**: 예산 탭의 내용을 담당하며, 월별/주차별 예산 현황과 돌발 비용을 분석합니다.
- **ImpulseCharacter.tsx**: 지출 패턴에 따라 반응하는 캐릭터 컴포넌트입니다.

### 📂 lib/
비즈니스 로직과 유틸리티 함수들이 위치합니다.
- **utils.ts**: 금액 포맷팅, 날짜 처리, 상수 데이터 등을 담고 있습니다.
- **recurrence.ts**: 반복 거래(매주, 매월 등)를 생성하는 핵심 로직이 들어있습니다.
- **holidays.ts**: 2024~2033년 대한민국 공휴일 데이터를 관리합니다.

### 📂 store/
전역 상태 관리를 담당합니다.
- **useStore.ts**: Zustand를 사용한 전역 스토어입니다. 거래 내역, 자산 데이터 등을 관리합니다.

### 📂 types/
TypeScript 타입 정의 파일들이 위치합니다.
- **ledger.ts**: Transaction, Asset, RecurrenceRule 등 앱 전반에서 쓰이는 핵심 타입을 정의합니다.

## 📂 루트 파일
- **Code_Map.md**: 현재 파일. 코드 구조를 설명합니다.
- **Decisions.md**: 프로젝트의 주요 기술적 의사결정과 변경 사항을 기록합니다.
- **Project.md**: 프로젝트의 개요, 진행 상황, 목표를 관리합니다.
