# Second Brain Lab 3D

[English](README.md) · **한국어**

현재 Obsidian 보관함의 Markdown 노트와 실제 내부 링크를 3D로 둘러보는 플러그인입니다. 점이나 왼쪽 제목을 누르면 내용을 읽을 수 있고, **Obsidian에서 열기**를 누르면 원본 파일이 열립니다. 그래프의 점과 선은 파일·링크를 나타냅니다. 사람의 뇌나 AI의 생각을 측정한 그림은 아닙니다.

[AI Second Brain Lab 실습 저장소](https://github.com/dante01yoon/ai-second-brain-lab)의 3D 화면을 Obsidian 안으로 옮겼습니다. 예시 보관함, Codex·Claude Code Hook 실습, 선택형 로컬 Laya 실험은 기존 저장소에 있습니다. 이 플러그인은 **현재 보관함을 읽는 3D 뷰어**입니다.

## 실제 화면

Obsidian 데스크톱 1.13.7에서 공개 실습 보관함의 복사본(노트 37개, 링크 60개)을 열어 촬영했습니다. 별도 브라우저 뷰어가 아니라 Obsidian 안에서 실행한 화면입니다.

![Obsidian 안의 Second Brain Lab 3D 그래프와 선택한 React 노트](docs/screenshots/obsidian-3d-graph.png)

그래프에서 노트를 고르고 **Open note**를 누르면 Obsidian의 원본 Markdown 파일로 이동합니다.

![Obsidian에서 열린 React useEffect 노트](docs/screenshots/obsidian-open-note.png)

[커뮤니티 플러그인 활성화 화면](docs/screenshots/obsidian-enabled.jpg) · [언어와 폴더 설정 화면](docs/screenshots/obsidian-settings.jpg)

## 설치와 사용

**2026-09-23 기준:** [커뮤니티 등록 페이지](https://community.obsidian.md/plugins/second-brain-lab)는 열렸지만 자동 심사 중이라 **Add to Obsidian** 버튼이 비활성화돼 있습니다. 심사가 끝나 버튼이 켜지면 **설정 → 커뮤니티 플러그인 → 탐색**에서 **Second Brain Lab 3D**를 검색해 설치하고 활성화하면 됩니다. 현재 바로 써보려면 아래 수동 설치를 따라주세요.

1. Obsidian 데스크톱 **1.13.7 이상**에서 3D로 볼 보관함을 엽니다.
2. [GitHub 릴리스 0.1.0](https://github.com/dante01yoon/second-brain-lab-3d/releases/tag/0.1.0)의 **Assets**에서 `main.js`, `manifest.json`, `styles.css` **세 파일을 각각** 받습니다. `Source code (zip)`은 설치 파일이 아닙니다.
3. Obsidian **설정 → 커뮤니티 플러그인**을 엽니다. **Installed plugins** 제목 옆 폴더 아이콘을 누르면 이 보관함의 `.obsidian/plugins` 폴더가 열립니다. 이 안에 `second-brain-lab` 폴더를 만듭니다.
4. 받은 세 파일을 `<보관함>/.obsidian/plugins/second-brain-lab/`에 넣습니다. 세 파일이 그 폴더 바로 아래에 있어야 합니다.
5. Obsidian을 다시 연 뒤 **설정 → 커뮤니티 플러그인 → Installed plugins**에서 **Second Brain Lab 3D**를 켭니다. 보이지 않으면 파일명과 폴더 위치, 제한 모드(Restricted mode), Obsidian 버전을 확인하세요.

왼쪽 리본의 3D 아이콘을 누르거나 명령 팔레트(`Cmd/Ctrl+P`)에서 **Second Brain Lab 3D: Open 3D view**를 찾습니다. 드래그로 회전하고 스크롤로 확대합니다. 왼쪽 검색창에 노트 제목을 입력하고 결과를 누르면 내용을 볼 수 있습니다. **Obsidian에서 열기**를 누르면 원본 Markdown 파일로 이동합니다. **설정 → Second Brain Lab 3D → Interface language → Korean**에서 한국어 화면을 고를 수 있고, 폴더 필터와 노트 수 한도도 바꿀 수 있습니다. 기본 한도는 1,000개이며 넘는 노트 수는 화면에 표시됩니다.

## 범위와 개인정보

플러그인은 Obsidian의 Vault API로 Markdown을 읽고 메타데이터 캐시에서 내부 링크를 가져옵니다. 노트를 수정하거나 AI 대화를 저장하지 않습니다. Hook·Laya를 실행하지 않고, 외부 서버에 보관함 자료를 보내지 않습니다. 계정·결제·사용량 수집도 없습니다. 노트 안에 사용자가 이미 넣은 링크를 여는 동작에는 Obsidian의 일반 동작이 적용됩니다.

노드 위치는 폴더 묶음을 둘러보기 위한 배치입니다. 거리 자체가 의미 유사도를 뜻하지 않습니다. 큰 보관함에서는 폴더 필터나 노트 수 한도를 조절하세요. 첫 버전은 Obsidian 데스크톱 1.13.7 이상에서 지원합니다. 3D 화면에는 MIT 라이선스의 [Three.js](https://threejs.org/)를 사용하며, 배포 파일에 저작권·라이선스 고지를 넣었습니다.

개발과 검증: `npm ci` 다음 `npm run check`. 원본 코드는 MIT 라이선스입니다.
