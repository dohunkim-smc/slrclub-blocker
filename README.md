# SLRCLUB 작성자 안보기

설치: GitHub의 Code → Download ZIP으로 다운로드한 뒤 ZIP을 압축 해제 → Chrome에서 chrome://extensions 열기 → 개발자 모드 켜기 → ‘압축해제된 확장 프로그램을 로드합니다’ → manifest.json이 있는 slrclub-blocker 폴더 선택 → SLRCLUB 게시판 새로고침.

작성자 옆 ‘이새끼 글 안보기’를 누르면 해당 data-xuid를 저장하고 같은 작성자의 모든 게시글 행을 현재 화면에서 제거합니다. 다음 방문에도 적용됩니다. 동적으로 추가된 행도 검사합니다.

확장 프로그램 아이콘을 누르면 data-xuid 목록에서 차단을 해제할 수 있습니다. 해제한 뒤 게시판을 새로고침하세요. 서버의 게시글은 삭제하지 않습니다. 차단 목록은 Chrome 로컬 저장소에만 저장하며 외부 전송하지 않습니다.

검사 선택자: #bbs_list > tbody > tr > td.list_name > span[data-xuid]
18번째 행에 한정하지 않습니다. 닉네임이 바뀌어도 data-xuid가 같으면 차단됩니다. 사이트 구조 또는 data-xuid가 바뀌면 수정이 필요합니다.
