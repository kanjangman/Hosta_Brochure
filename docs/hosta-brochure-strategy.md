# 호스타 브로셔 — 확장성 있는 리서치 전략

> 용인 남사 **목향농원** 도매 호스타 품종 브로셔 제작을 위한 리서치·데이터·산출물 전략 문서.
> 이 문서는 **구조/전략** 산출물이며, 실제 28종 리서치와 사이트 빌드는 이 전략을 승인한 뒤 Phase 2에서 진행한다.

---

## 1. 개요

### 목표
1. 판매 중인 호스타 28종의 설명 브로셔 제작
2. **한국어 자료를 레퍼런스와 함께** 수집 + **해외 자료** 병행 수집·정리
3. **HTML 카드** 형태로 정리
4. 추후 품종 추가에 대비한 **확장성**

### 확정 사항 (사용자 결정)
| 항목 | 결정 |
|---|---|
| 이번 범위 | **구조/전략 문서** (스키마·소스 목록·워크플로우). 실제 리서치·빌드는 승인 후 |
| 언어 | **한/영 이중언어** (본문 한국어 중심, 각 필드 영문 병기) |
| 이미지 | 카드마다 **슬롯 2개** — ①해외 자료 이미지 **링크**(출처표기) ②농원 **보유 사진 플레이스홀더** |
| 파일 구조 | **데이터(JSON) + 템플릿 분리** |

### 근거
본 전략은 두 건의 실측 소스 조사에 기반한다 — (A) 국문 정보 소스 지형, (B) 해외 권위 소스 지형. 조사에서 확인된 핵심 사실은 각 절에 반영했다.

---

## 2. 산출물 & 파일 구조

```
/
├─ data/
│   ├─ hostas.json          # (Phase 2) 품종 객체 배열 — 실제 데이터
│   └─ sources.json         # ✔ 표준 소스 레지스트리 (본 산출물)
├─ schema/
│   └─ hosta.schema.json    # ✔ 품종 JSON Schema (본 산출물, 검증 가드레일)
├─ template/                # (Phase 2) index.html + render.js + styles.css
├─ assets/
│   └─ placeholder.svg      # (Phase 2) 농원 사진 플레이스홀더
└─ docs/
    └─ hosta-brochure-strategy.md   # ✔ 본 전략 문서 (주 산출물)
```

**확장성 원리:** 카드는 `data/hostas.json`을 읽어 템플릿이 자동 렌더한다. **품종 추가 = 스키마를 통과하는 JSON 객체 1건 append** → 카드 자동 생성. HTML을 손대지 않으므로 28종 → N종 확장 시 렌더 코드 변경이 0이다.

---

## 3. 데이터 스키마

정식 정의는 [`schema/hosta.schema.json`](../schema/hosta.schema.json) (JSON Schema draft 2020-12). 설계 원칙 3가지:

1. **provenance(출처·이력) vs culture/size(성숙 성능) 분리.** 조사 결과 "등록 크기 vs 성숙 크기", "발견 연도 vs 등록 연도"가 소스마다 달랐다. 필드를 나눠 **둘 다 보존**한다(`size.registered_size_note`, `provenance.year_discovered`/`year_registered`).
2. **모든 서술 필드 `_ko` / `_en` 병기** — 이중언어 요구 충족.
3. **`references[]`로 필드별 근거 URL 추적** + `research_status`(draft/verified)로 상태 관리 — "레퍼런스와 함께" 요구와 확장/검증을 지원.

### 필드 요약
| 그룹 | 필드 | 비고 |
|---|---|---|
| 식별 | `id`, `name_ko`, `name_en`, `cultivar`, `aliases_ko`, `genus_ko` | `id`는 slug, `cultivar`는 `Hosta 'X'` 정규 표기 |
| provenance | `hybridizer`, `year_registered`, `year_discovered`, `parentage`, `registry_url` | **AHS Registry 우선** |
| size | `class`(mini~giant), `height_cm[min,max]`, `spread_cm[min,max]`, `registered_size_note` | 성숙치 우선, 등록치 병기 |
| leaf | `color_ko/en`, `variegation`, `substance` | 실질(substance) 두꺼움 → 민달팽이 저항↑ |
| flower | `color_ko/en`, `bloom_season`, `fragrant` | |
| culture | `light_ko/en`, `growth_rate`, `hardiness`, `slug_resistance` | |
| 서술 | `awards[]`, `description_ko/en`, `tags[]` | |
| 이미지 | `images.farm_photo`{src,placeholder,credit}, `images.reference_image`{url,credit,license,source_bucket} | **2슬롯** |
| 추적 | `references[]`{field,source,url}, `research_status` | |

### 예시 (스키마 시연용 — 값은 Phase 2에서 정식 검증)
> ⚠ 아래 준(June) 값은 **스키마 사용법을 보여주기 위한 예시**다. 일부 값(육종가·연도·수상)은 조사에서 확인된 것이나, `research_status:"draft"`로 두고 Phase 2 파일럿에서 2소스 교차·검증 후 `verified`로 승격한다.

```jsonc
{
  "id": "june",
  "name_ko": "준", "name_en": "June",
  "cultivar": "Hosta 'June'",
  "aliases_ko": ["준"],
  "genus_ko": "비비추",
  "provenance": {
    "hybridizer": "Neo Plants Ltd (UK)",
    "year_registered": 1991, "year_discovered": null,
    "parentage": "'Halcyon' 아조변이 (Tardiana Group)",
    "registry_url": "https://www.hostaregistrar.org/search"
  },
  "size": { "class": "medium", "height_cm": [30, 40], "spread_cm": [60, 90],
            "registered_size_note": null },
  "leaf": { "color_ko": "황금색 중앙 + 청록색 가장자리", "color_en": "gold center, blue-green margin",
            "variegation": "medio", "substance": "thick" },
  "flower": { "color_ko": "연보라", "color_en": "lavender", "bloom_season": "mid", "fragrant": false },
  "culture": { "light_ko": "반음지~양지(무늬발색 위해 아침햇빛 권장)", "light_en": "part shade to sun",
               "growth_rate": "medium", "hardiness": "USDA 3-9", "slug_resistance": "high" },
  "awards": ["AHS Hosta of the Year 2001"],
  "description_ko": "…(Phase 2)…", "description_en": "…(Phase 2)…",
  "tags": ["golden", "medium", "sun-tolerant", "popular"],
  "images": {
    "farm_photo": { "src": null, "placeholder": "assets/placeholder.svg", "credit": "목향농원" },
    "reference_image": { "url": null, "credit": null, "license": null, "source_bucket": null }
  },
  "references": [
    { "field": "provenance", "source": "ahs_registry", "url": "https://www.hostaregistrar.org/search" },
    { "field": "awards", "source": "ahga_hoty", "url": "http://www.hostagrowers.org/Hosta_of_the_Year.html" }
  ],
  "research_status": "draft"
}
```

---

## 4. 품종 명명 정규화 테이블 (28종) — 리서치 선행 작업

조사에서 확인된 **명명 함정** 때문에 검색 전에 이 테이블을 확정해야 노이즈가 급감한다. 아래는 사용자 제공 목록을 기준으로 한 초안이며, ⚠ 표시는 Phase 2 리서치 착수 시 **가장 먼저 대조·확정**할 항목이다.

| # | 국문명 | 영문명(원문) | 정규 cultivar | slug `id` | 명명/검증 노트 |
|---|---|---|---|---|---|
| 1 | 골든 스왈로우 | Golden Swallow | Hosta 'Golden Swallow' | golden-swallow | |
| 2 | 과카몰리 | Guacamole | Hosta 'Guacamole' | guacamole | HOTY 2002, 향기종 |
| 3 | 그랜드 프라이즈 | Grand Prize | Hosta 'Grand Prize' | grand-prize | |
| 4 | 그레이트 익스펙테이션 | Great Expectation | Hosta 'Great Expectations' | great-expectations | ⚠ 정규 등록명은 복수형 **'Great Expectations'** 로 표기 확인 필요 |
| 5 | 드림 퀸 | Dream Queen | Hosta 'Dream Queen' | dream-queen | |
| 6 | 라즈베리 선데 | Raspberry Sundae | Hosta 'Raspberry Sundae' | raspberry-sundae | |
| 7 | 레인포레스트 선라이즈 | Rainforest Sunrise | Hosta 'Rainforest Sunrise' | rainforest-sunrise | |
| 8 | 로얄 스탠다드 | Royal Standard | Hosta 'Royal Standard' | royal-standard | 향기종(H. plantaginea 계열) |
| 9 | 로얄리스트 | Loyalist | Hosta 'Loyalist' | loyalist | 'Patriot' 아조변이 계열 |
| 10 | 리버티 | Liberty | Hosta 'Liberty' | liberty | 'Sagae' 아조변이 |
| 11 | 마크 | Mark | Hosta 'Mark' | mark | ⚠ 단음절 인명형 → 검색 노이즈 심함, 한정어 필수 |
| 12 | 버지니아 릴 | Virginina Reel | Hosta 'Virginia Reel' | virginia-reel | ⚠ 원문 오타(Virginina) → **Virginia Reel** 로 정정 |
| 13 | 블루 엔젤 | Blue Angel | Hosta 'Blue Angel' | blue-angel | ⚠ **타속 동명**: 로키향나무 *Juniperus* 'Blue Angel'과 충돌 → '호스타/비비추' 한정어 필수 |
| 14 | 빅 대디 | Big Daddy | Hosta 'Big Daddy' | big-daddy | 대형 청색 |
| 15 | 스테인드 글라스 | Stained Glass | Hosta 'Stained Glass' | stained-glass | HOTY 2006, 'Guacamole' 아조변이, 향기종 |
| 16 | 쏘 스윗 | So Sweet | Hosta 'So Sweet' | so-sweet | 향기종. 국문 표기 '소 스위트'도 |
| 17 | 아이스 앤 파이어 | ICE and Fire → **Fire and Ice** | Hosta 'Fire and Ice' | fire-and-ice | ✅ **확정(사용자 확인 2026-07)**: Hosta 'Fire and Ice'('Patriot'의 아조변이 · 흰 중앙무늬·녹색 테). 원문 'ICE and Fire'는 표기 오류 |
| 18 | 어스 엔젤 | Earth Angel | Hosta 'Earth Angel' | earth-angel | 대형, 'Blue Angel' 아조변이 |
| 19 | 옐로 스플래쉬 림 | Yellow Splash Rim | Hosta 'Yellow Splash Rim' | yellow-splash-rim | |
| 20 | 울버린 | Wolverine | Hosta 'Wolverine' | wolverine | |
| 21 | 준 | June | Hosta 'June' | june | ⚠ 인명형 노이즈. HOTY 2001, 'Halcyon' 아조변이 |
| 22 | 코스트 투 코스트 | Coast to Coast | Hosta 'Coast to Coast' | coast-to-coast | |
| 23 | 패러다임 | Paradigm | Hosta 'Paradigm' | paradigm | HOTY 2007 |
| 24 | 패트리어트 | Patriot | Hosta 'Patriot' | patriot | HOTY 1997, 'Francee' 아조변이 |
| 25 | 퍼스트 프로스트 | First Frost | Hosta 'First Frost' | first-frost | HOTY 2010, 'Halcyon' 아조변이 |
| 26 | 프란시스 윌리엄스 | Frances Williams | Hosta 'Frances Williams' | frances-williams | ⚠ 표기변이(프랜시스/윌리암스), 발견 1936/등록 1986, 인명 노이즈 |
| 27 | 프랑시 | Francee | Hosta 'Francee' | francee | ⚠ 국문 '프랑시'↔'프랜시' 표기변이, 'Patriot'의 모품종 |
| 28 | 할시온 | Halcyon | Hosta 'Halcyon' | halcyon | HOTY(초기), Tardiana Group. 'June'·'First Frost'의 모품종 |

> **범례:** ⚠ = 착수 시 우선 대조. `aliases_ko`에 표기변이를 수록해 검색·매칭에 사용한다. HOTY/아조변이 등 provenance 값은 **Phase 2에서 AHS Registry로 검증 후 확정**한다(위 노트는 조사 기반 초안).

---

## 5. 소스 인벤토리

정식 레지스트리는 [`data/sources.json`](../data/sources.json). 요약:

### 국문 (현지화·유통 정보)
| 우선 | 소스 | 용도 | 신뢰도 |
|---|---|---|---|
| 1 | **플러스가든** `plusgarden.com/plant/{id}` | 국문 유일 **품종 단위** 구조화(국/영/학명·크기·광량·내한성) | 중상 |
| 2 | **KPNI(국가표준식물목록)** + **한국민족문화대백과** | 종 단위 정명·학명 공신력 | 상 |
| 3 | **쇼핑몰**(심폴·엑스플랜트·씨들링 등) | 유통명·포트규격·가격·노지월동 | 중하 |
| 4 | **블로그 + Daum 카페 '비비추를 사랑하는 사람들'** | 실물 잎색 변이·재배 팁 (최대 커뮤니티가 **Daum**) | 중~하 |

### 해외 (provenance·원예 표준 — 국문 공백 보전)
| 필드군 | 1순위 | 2순위 |
|---|---|---|
| 이름·육종가·등록연도·교배·등록형태 | **AHS Registry** (ICRA 권위) | MyHostas |
| 성숙 크기·광량·개화기·성장속도·향 | **Walters Gardens** / **MBG** | NH Hostas |
| 수상(HOTY·AGM) | **AHGA/AHS HOTY 리스트** + Registry | hostalists.org / RHS |
| 민달팽이 저항 | NH Hostas / Walters + 잎 실질 추론 | — |

### 충돌 해결 규칙
- **provenance**(이름·육종가·등록연도·교배·등록형태) → **AHS Registry 우선**
- **성숙 조경 성능**(성숙 H×W·광량·성장·개화) → **Walters/MBG 우선**(육종가 도입치 우대)
- **크기·연도 불일치** → 등록치와 성숙치를 **둘 다 기록**
- 핵심 사실은 2소스 교차, 불일치 시 **AHS Registry가 tie-break**

### 국문 자료 밀도는 극단적으로 불균형
조사 샘플 기준: **준(상)** = 국문만으로 기본 필드 충족 / **블루엔젤(중)** = 유통은 있으나 국문 전용 DB 페이지 부족 + 동명 함정 / **프란시스 윌리엄스(하)** = 국문 실질 자료 거의 전무, 해외 의존. → 카드마다 "국문 우선 → 부족분 해외 보전" 2단계를 개별 적용해야 한다.

---

## 6. 확장성 있는 리서치 워크플로우 (핵심)

### 6.1 품종 1종당 반복 파이프라인 (국문 우선 → 해외 보전)
| 단계 | 작업 | 주 도구 |
|---|---|---|
| 1. 정규화 | 국문명→`Hosta 'Epithet'`→학명 확정, 동명/표기 필터 (§4 테이블) | (선행 테이블) |
| 2. provenance 앵커 | AHS Registry에서 육종가·등록연도·교배·등록형태. MyHostas 교차확인 | WebSearch/WebFetch |
| 3. 원예 보강 | Walters/MBG/NH Hostas에서 성숙 크기·광량·개화기·성장속도·향·민달팽이 저항; 수상은 HOTY 리스트 | WebSearch/WebFetch |
| 4. 국문 현지화 | 플러스가든 국문 필드, 쇼핑몰 유통명·규격, 블로그/Daum 카페 실물색 | **Naver MCP** `search_shop`·`search_blog`·`search_cafearticle`·`search_encyc`(+`search_image`) + WebSearch(Daum) |
| 5. 충돌 해결 | §5 규칙 적용, 등록치·성숙치 병기 | — |
| 6. 이미지 배정 | 안전버킷에서 `reference_image`(URL+크레딧+라이선스); `farm_photo`는 플레이스홀더 | §7 |
| 7. 검증 | 각 필드 `references` 필수, 핵심 사실 2소스 교차, `research_status="verified"` | — |
| 8. 출력 | 스키마 검증 통과 JSON 1건 `data/hostas.json`에 append | ajv/jsonschema |

### 6.2 N종 오케스트레이션 (확장성 실현)
승인 후 **Workflow 도구로 "품종 1개 = 에이전트 1개" 팬아웃(pipeline)** 을 실행한다. 각 에이전트가 6.1의 1~8을 수행해 **스키마 검증 JSON**을 반환하고, 핵심 provenance(육종가·연도·교배)는 **적대적 검증(adversarial verify) 단계**로 별도 에이전트가 교차 반박한다. **품종 리스트만 갈아끼우면 28→N 확장**(렌더 코드 변경 0). 에이전트 도구: NaverSearch MCP(국문) + WebSearch/WebFetch(해외).

```
pipeline(품종목록,
  단계A: 국문+해외 리서치 → 스키마 준수 JSON(draft),
  단계B: provenance 적대적 검증(2~3개 스켑틱) → verified/보류)
→ 검증 통과분만 data/hostas.json 병합
```

---

## 7. 이미지 & 저작권 정책 (상업 브로셔)

**원칙: 사실(fact)은 자유 사용, 사진(photo)만 라이선스 제한.** 카드 본문 텍스트는 Registry+Walters/MBG 사실로 구성하고, 이미지는 아래 경로로만 확보한다.

### 슬롯② `reference_image` — "안전 버킷"에서만 (출처표기 필수)
| 버킷 | 라이선스 | 조건 |
|---|---|---|
| **Wikimedia Commons** | CC BY / BY-SA (파일별) | 파일별 저작자·라이선스 표기. 상업 최안전. 단 커버리지 제한적 |
| **NC State Extension** | 파일별 CC | 미표기 파일은 all-rights-reserved. 확인 후 표기 |
| **Proven Winners** | PW 브로셔 라이선스 | **PW 브랜드 품종에 한정**, 브로셔/POP/광고 허용 |
| **Walters Gardens** | Usage Agreement | 약관 수락 + 사진 크레딧, 월터스 육종 품종 |

### 절대 임베드 금지 (all rights reserved) — 참조용으로만
- **The Hosta Library** — "any public use is prohibited… may result in legal action"
- **NH Hostas 등 소매상 자체 사진**
- **AHS Registry 기여 사진**

### 슬롯① `farm_photo`
목향농원 **자체 촬영**분. 확보 시 슬롯②를 대체하는 것이 저작권상 가장 안전 → **자체 촬영 로드맵 권장**(품종별 성체 1컷 + 잎 클로즈업 1컷).

---

## 8. 실행 로드맵 (승인 후 Phase 2+)

1. ✅ **(완료)** **파일럿 3종**으로 스키마·템플릿·워크플로우 end-to-end 검증: **준(국문 풍부) · 블루엔젤(중간+동명함정) · 프란시스 윌리엄스(국문 희박·해외 의존)** — 모두 verified, `data/hostas.json`에 수록, 카드 렌더 확인.
2. 파일럿 확정 후 **Workflow 팬아웃으로 나머지 25종** 리서치 → `data/hostas.json`.
3. **`template/` 빌드**: `index.html` + `render.js`(JSON 로드→카드 렌더) + `styles.css`. 기능: 한/영 토글, 이미지 2슬롯, 태그 필터, 인쇄용 레이아웃.
4. 이미지: 안전버킷 링크 채우기 + 농원 자체 촬영분 순차 삽입.

---

## 9. 리스크 & 제약 (조사에서 실측)

| 리스크 | 내용 | 대응 |
|---|---|---|
| WebFetch 403 | 국문 원예 사이트 + 주요 해외 상업 도메인 다수가 프록시/봇 차단 | Naver MCP 스니펫 + WebSearch 우회, 심층 시 브라우저(Playwright) |
| Naver MCP 승인 게이트 | plan 모드에서 MCP 호출 차단됨 | 실행 세션에서 사전 승인 (국문 조사의 정답 도구) |
| 저작권 | 위반 시 상업 브로셔 법적 위험 | §7 정책 엄수, 안전버킷/자체촬영만 |
| 국문 밀도 불균형 | 품종별 자료량 극단적 편차 | 일부 카드는 번역된 해외 데이터 비중↑ → 언어 출처 표기 |
| 명명 노이즈 | 타속 동명·인명형·표기변이 | §4 정규화 테이블 선행, `aliases_ko` 활용 |

---

## 10. 소매용 친근 카피 기준 (`retail_copy`)

브로셔는 **두 가지 버전**을 제공한다: **도매·전문**(기존 `description` — 바이어용)과 **소매·영업**(`retail_copy` — 소매 판매자용 별도 버전). 소매·영업 버전의 목적은 ①소매 판매자가 "꼭 사입하고 싶어지는" 이유가 읽히고, ②판매자가 **최종 고객에게 화면을 그대로 보여주며 영업**할 수 있는 것.

### A. 이중 독자 원칙
①소매 판매자(사입 결정) ②최종 소비자(구매 결정). 구조로 분리: 헤드라인·본문은 소비자향, 셀링포인트는 판매자향.

### B. 구조 4요소 (스키마 필드)
| 요소 | 필드 | 규칙 |
|---|---|---|
| 헤드라인 | `headline_ko` | 한 줄 감성 후킹(10~20자). 잎 색·빛·분위기를 시각적으로. 예: "그늘을 금빛으로 밝히는 잎" |
| 본문 | `body_ko` | 2~3문장(90~160자), 친근 존댓말. 감각 묘사(빛·색·계절) + "키우기 쉬워요" 안심 + 놓을 공간 제안 |
| 잘 팔리는 이유 | `selling_points_ko[]` | 판매자향 불릿 2~3개: 수상경력=손님 신뢰, 관리 용이=클레임↓, 지명도=회전율 등 |
| 이런 분께 | `recommend_for_ko` | 구체적 고객 한 줄. 예: "북향 베란다·나무 그늘 화단을 가꾸는 분" |

### B-2. 3톤 구성 — 구매 동기별 (`retail_copy.{warm|practical|premium}`)
손님이 사는 이유에 맞춰 **같은 검증 사실을 다른 각도로 비추는** 3톤. 각 톤은 위 4요소 구조를 동일하게 가진다. 판매자는 화면의 톤 토글(감성/안심/품격)로 눈앞의 손님에 맞게 전환한다.

| 톤 키 | 이름 | 겨냥 고객 | 강조점(근거 필드) |
|---|---|---|---|
| `warm` | 포근·감성형 | 정원 가꾸는 즐거움을 찾는 분 | 빛·색의 그림, 공간 분위기 (`leaf`, `flower`, `culture.light`) |
| `practical` | 실용·안심형 | 원예 초보, 관리 걱정하는 분 | 키우기 쉬움·튼튼함 (`slug_resistance`, `hardiness`, `culture.light`) |
| `premium` | 품격·스토리형 | 선물·가치 중시 고객 | 수상·역사·계보 (`awards`, `provenance`) |

- 판매 화법과 1:1 대응: "관리 어렵나요?" → 안심, "선물할 건데요" → 품격.
- `retail_copy`를 넣는 품종은 **3톤을 모두 채우는 것이 원칙**(토글 빈칸 방지).
- 세 톤 모두 §D 사실 근거 원칙을 동일하게 적용 — 톤은 사실의 "각도"만 바꾼다.

### C. 톤 규칙
- 따뜻한 존댓말. 과장·최상급 남발 금지, 이모지 0~1개.
- **전문용어 → 일상어 변환표**:

| 전문 표현 | 카피 표현 |
|---|---|
| 반음지 | 해가 살짝 드는 그늘 |
| 잎 실질 두꺼움(thick substance) | 도톰한 잎 |
| 민달팽이 저항 높음 | 벌레 걱정이 적어요 |
| 내한성(USDA zone) | 추위에 강해요 / 심어두면 해마다 올라와요 |
| 포컬포인트 | 정원의 주인공 |
| 아조변이(sport) | (카피에서 생략 — 도매 버전 전용) |

### D. 사실 근거 원칙 ★최상위 — 위반 시 카피 반려
- 카피의 **모든 사실적 주장**(색·무늬·크기·빛·튼튼함·수상·역사)은 그 품종의 **references[]로 뒷받침되는 기존 검증 필드에 이미 있는 내용의 재표현만** 허용. **거짓·과장·레퍼런스 없는 새 주장 절대 금지.**
- 필드에 없는 내용이 필요하면 → 먼저 리서치해 references와 함께 필드에 추가한 뒤에만 사용.
- 감성 표현은 사실의 "번역"까지만: `slug_resistance: high` → "벌레 걱정이 적어요"(OK); `fragrant: false`인 품종에 "향기가 좋아요"(금지).
- selling_points도 동일: "수상경력→손님 신뢰"는 `awards`가 있을 때만, 회전율류 주장은 HOTY/인기투표 등 근거 있는 사실로만.
- 작성 후 **카피→필드 대조 체크**(문장 단위로 근거 필드 확인)를 통과해야 함. `retail_copy`는 새 사실이 없으므로 별도 references 불요.

### E. 화면 반영
- 헤더의 **버전 토글**(`도매·전문` / `소매·영업`)로 전환. 소매·영업 버전에서는 친근 카피를 콜아웃으로 크게 보여주고, 내부용 요소(레퍼런스·provenance·검증 배지·전문 설명)는 숨긴다. `retail_copy` 없는 품종은 국문 전문 설명으로 폴백.

---

## 11. 검증 방법 (본 산출물)

- **`schema/hosta.schema.json`**: §3 준(June) 예시 JSON을 JSON Schema 검증기(`ajv` 또는 `python -m jsonschema`)로 통과시켜 스키마 유효성 확인.
- **`data/sources.json`**: 수록 URL이 조사 근거 URL과 일치하는지 스팟 체크.
- **본 문서**: §5·§7의 소스/라이선스 표가 두 조사 리포트 근거와 일치하는지 대조.
- (실제 리서치 정확도 검증은 Phase 2 파일럿 3종에서 end-to-end 수행.)

---

## 부록 A. 조사 도구 메모
- **국문**: `search_shop`(유통명·규격·가격) + `search_blog`·`search_cafearticle`(실물·재배) + `search_encyc`(종 정의) + `search_image`(정찰). 쿼리는 **국문+영문 병기**, '호스타/비비추' 한정어로 동명 제거. 최대 커뮤니티는 Daum → WebSearch로 `cafe.daum.net` 병행.
- **해외**: AHS Registry·Walters는 name→id 해석 단계 필요. `myhostas.be/db/hostas/{Name}`, `plants.ces.ncsu.edu/plants/hosta-{name}/`, `nhhostas.com/products/{name}-hosta`, `hostalibrary.org/{letter}/{name}.html`는 이름-예측 URL로 배치 조회 가능.
