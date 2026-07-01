# 케어라벨 혼용률 계산기

스타일별 원단 소요량(YY)을 입력하면 전체 케어라벨 혼용률을 계산하고, 스타일 데이터를 브라우저에 저장/관리/추출하는 정적 웹앱입니다.

## 실행 방법

별도 서버가 필요 없습니다.

1. `index.html` 파일을 브라우저에서 엽니다.
2. GitHub Pages 또는 Cloudflare Pages에 `index.html`, `style.css`, `app.js`, `README.md`를 그대로 배포해도 동작합니다.

XLSX 다운로드는 ExcelJS CDN을 사용합니다. 인터넷 연결이 없으면 CSV 다운로드와 JSON 백업은 그대로 사용할 수 있습니다.

## 사용 방법

1. 상단의 `Style Name`에 스타일명을 입력합니다.
2. 원단 리스트에서 해당 스타일에 사용하는 원단의 `YY`만 입력합니다.
3. `YY`가 빈칸, 0, null이면 계산에서 제외됩니다.
4. 우측 요약 패널에서 Total YY와 최종 혼용률을 확인합니다.
5. `저장` 버튼을 누르면 현재 스타일명과 YY 데이터가 저장됩니다.
6. `현재 스타일 추출` 또는 저장 목록에서 여러 스타일을 체크한 뒤 `선택 스타일 추출`을 눌러 결과 화면을 만듭니다.

## 저장 방식

- 저장소는 브라우저 `localStorage`입니다.
- 같은 브라우저/PC에서 새로고침 후에도 데이터가 유지됩니다.
- 저장 데이터에는 `version` 값이 포함됩니다.
- 최초 실행 시 예시 스타일 `28 EVO PANT`가 자동 생성됩니다. 이 예시는 일반 저장 데이터와 같아서 수정/삭제할 수 있습니다.

## 백업과 복원

- `JSON 백업` 버튼을 누르면 전체 저장 데이터를 `.json` 파일로 다운로드합니다.
- `JSON 복원`에서 백업 파일을 선택하면 기존 저장 데이터를 백업 내용으로 교체합니다.
- localStorage는 브라우저별 저장소이므로 PC 변경, 브라우저 변경, 캐시 삭제 전에 JSON 백업을 권장합니다.

## 추출 기능

- 결과 화면은 스타일별로 별도 섹션을 만듭니다.
- 각 섹션에는 원단별 계산표와 최종 혼용률 요약표가 포함됩니다.
- 최종 혼용률 요약표 아래에는 CARE LABEL preview가 표시됩니다.
- CARE LABEL preview는 계산용 Material 이름을 직접 쓰지 않고 `DB Management > Care Label Mapping`의 표기명을 적용합니다.
- 기본 출력은 US/EU label이며, 옵션에서 INTERNAL label 포함, single line/multi line, warning 표시 여부, US Strict FTC Mode를 바꿀 수 있습니다.
- `인쇄` 버튼으로 결과 화면을 출력할 수 있습니다.
- `CSV 다운로드`는 결과 데이터를 CSV로 저장합니다.
- `XLSX 다운로드`는 ExcelJS가 로드된 경우 스타일이 적용된 엑셀 파일로 저장하며, 스타일별 시트에 CARE LABEL (US)/(EU) 블록을 함께 넣습니다.

## CARE LABEL preview

- CARE LABEL은 Composition 문자열을 파싱하지 않고 최종 Material summary 결과에서 생성합니다.
- 같은 label로 매핑되는 Material은 먼저 합산합니다. 예: `POLYESTER (COATED)`와 `POLYESTER (UNCOATED)`는 US/EU에서 `POLYESTER`로 합산됩니다.
- 0% 항목은 제외하고, 퍼센티지가 높은 순서로 정렬합니다.
- 라벨용 퍼센트는 정수 `%`로 표시하며 Largest Remainder Method로 보정해 합계가 100%가 되게 합니다.
- US 기본값은 `NYLON`, `SPANDEX`, `ARAMID` 등을 사용합니다. `US Strict FTC Mode`를 켜면 5% 미만 항목은 원칙적으로 `OTHER FIBER`로 합산하되, functional significance가 켜진 항목은 유지합니다.
- EU 기본값은 Annex I 명칭 중심으로 `NYLON -> POLYAMIDE`, `SPANDEX -> ELASTANE`, `KEVLAR -> ARAMID`를 적용합니다.
- `custom-warning`은 자동 문구는 만들지만 법적 generic fiber name 적합성을 사용자가 재확인해야 한다는 뜻입니다. 기본값에서 `POLYURETHANE`은 이 경고가 표시됩니다.
- `LEATHER` 같은 `animal-nontextile` 항목은 fibre composition line에서 제외합니다. EU label에는 `Contains non-textile parts of animal origin` note가 표시됩니다.

## 계산 로직

- `Total YY` = 입력된 YY 합계
- 각 원단 `Ratio` = 해당 원단 YY / Total YY
- 각 원단별 소재 비율 = Ratio × 해당 Composition의 소재별 비율
- 최종 혼용률 = 모든 원단의 소재별 비율 합계
- 표시값은 보기 좋게 반올림하지만 내부 계산은 원본 숫자로 유지합니다.

예시 스타일 `28 EVO PANT`의 Total YY는 `3.211`이며 최종 Total은 `100.00%`가 됩니다.
