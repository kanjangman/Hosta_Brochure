#!/usr/bin/env python3
"""데이터 빌드/검증 도구 (리서치 파이프라인 8단계).

- data/hostas.json 의 각 품종 객체를 schema/hosta.schema.json 으로 검증
- 통과 시 data/hostas.data.js (window.HOSTA_DATA 미러, file:// 로드용) 생성
- 하나라도 실패하면 오류를 출력하고 종료코드 1

사용: python3 scripts/gen_data.py
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCHEMA = ROOT / "schema" / "hosta.schema.json"
DATA = ROOT / "data" / "hostas.json"
OUT = ROOT / "data" / "hostas.data.js"


def main() -> int:
    try:
        from jsonschema import Draft202012Validator
    except ImportError:
        print("jsonschema 미설치: pip install jsonschema", file=sys.stderr)
        return 2

    schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema)

    data = json.loads(DATA.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        print("data/hostas.json 은 품종 객체의 배열이어야 합니다.", file=sys.stderr)
        return 1

    errors = 0
    ids = {}
    for i, item in enumerate(data):
        label = item.get("id", f"[{i}]")
        for e in validator.iter_errors(item):
            errors += 1
            loc = "/".join(str(p) for p in e.path)
            print(f"  ✗ {label} :: {loc or '(root)'} → {e.message}", file=sys.stderr)
        ids.setdefault(item.get("id"), []).append(i)

    for _id, idxs in ids.items():
        if _id and len(idxs) > 1:
            errors += 1
            print(f"  ✗ 중복 id '{_id}' (인덱스 {idxs})", file=sys.stderr)

    if errors:
        print(f"\n검증 실패: {errors}건", file=sys.stderr)
        return 1

    payload = json.dumps(data, ensure_ascii=False, indent=2)
    OUT.write_text(
        "/* 자동 생성 파일 — 편집 금지. 원본: data/hostas.json (python3 scripts/gen_data.py) */\n"
        "window.HOSTA_DATA = " + payload + ";\n",
        encoding="utf-8",
    )
    verified = sum(1 for x in data if x.get("research_status") == "verified")
    print(f"✓ {len(data)}종 검증 통과 (verified {verified} / draft {len(data)-verified}) → {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
