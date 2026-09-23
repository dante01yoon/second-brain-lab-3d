# Second Brain Lab 3D

[English](README.md) · **한국어**

현재 Obsidian 보관함의 Markdown 노트와 실제 내부 링크를 3D로 둘러보는 플러그인입니다. 점이나 왼쪽 제목을 누르면 내용을 읽을 수 있고, **Obsidian에서 열기**를 누르면 원본 파일이 열립니다. 그래프의 점과 선은 파일·링크를 나타냅니다. 사람의 뇌나 AI의 생각을 측정한 그림은 아닙니다.

[AI Second Brain Lab 실습 저장소](https://github.com/dante01yoon/ai-second-brain-lab)의 3D 화면을 Obsidian 안으로 옮겼습니다. 예시 보관함, Codex·Claude Code Hook 실습, 선택형 로컬 Laya 실험은 기존 저장소에 있습니다. 이 플러그인은 **현재 보관함을 읽는 3D 뷰어**입니다.

## 설치와 사용

커뮤니티 디렉터리에 등록된 뒤에는 **설정 → 커뮤니티 플러그인 → 탐색**에서 **Second Brain Lab 3D**를 찾아 설치하고 켜면 됩니다. 등록 전에는 같은 버전의 [GitHub 릴리스](https://github.com/dante01yoon/second-brain-lab-3d/releases)에서 `main.js`, `manifest.json`, `styles.css`를 내려받아 `<보관함>/.obsidian/plugins/second-brain-lab/`에 넣고 Obsidian을 다시 열어 플러그인을 켤 수 있습니다.

왼쪽 리본 아이콘이나 명령 팔레트의 **Open 3D view**로 화면을 엽니다. 드래그로 회전하고 스크롤로 확대합니다. 노트를 고른 뒤 오른쪽에서 내용을 확인하거나 원본을 엽니다. **설정 → Second Brain Lab 3D**에서 한국어 화면, 표시할 폴더, 노트 수 한도를 고를 수 있습니다. 기본 한도는 1,000개이며 넘는 노트 수는 화면에 표시됩니다.

## 범위와 개인정보

플러그인은 Obsidian의 Vault API로 Markdown을 읽고 메타데이터 캐시에서 내부 링크를 가져옵니다. 노트를 수정하거나 AI 대화를 저장하지 않습니다. Hook·Laya를 실행하지 않고, 외부 서버에 보관함 자료를 보내지 않습니다. 계정·결제·사용량 수집도 없습니다. 노트 안에 사용자가 이미 넣은 링크를 여는 동작에는 Obsidian의 일반 동작이 적용됩니다.

노드 위치는 폴더 묶음을 둘러보기 위한 배치입니다. 거리 자체가 의미 유사도를 뜻하지 않습니다. 큰 보관함에서는 폴더 필터나 노트 수 한도를 조절하세요. 첫 버전은 Obsidian 데스크톱 1.13.7 이상에서 지원합니다.

개발과 검증: `npm ci` 다음 `npm run check`. 원본 코드는 MIT 라이선스입니다.
