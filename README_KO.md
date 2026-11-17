# KICK KICK SKIP v09 — 수정본

## 적용 내용
- 사이트 공통 헤더: ABOUT US / SHOP / GRAPHICS + 마이페이지·장바구니·포토부스 아이콘. 좌우 간격은 화면 크기에 따라 변경.
- 전달받은 `banner.svg`로 메인 배너 교체. 중앙 디자인의 비율을 지키고 양옆 파란 공간이 늘거나 줄어듦. 배너 높이 축소.
- 쇼핑 페이지의 폭과 좌우 여백 반응형 변경.
- 마이페이지의 왼쪽 프로필 스케치북에 고정 비율 적용. 결제 요약 스케치북은 세로로 이미지가 강제 늘어나지 않게 배경 비율 유지.
- 포토부스 HOME 크기 축소/좌측 이동, 영상 레이어 클리핑, 3초 카운트다운.
- Supabase Storage 업로드 + 실제 사진 페이지로 연결되는 QR 지원. 기존 Python API 서버 방식도 유지.

## 중요: QR이 실제로 작동하려면
GitHub Pages는 사진 저장을 지원하지 않습니다. 다음 둘 중 하나를 연결해야 합니다.

### A. Supabase Storage 연결 (GitHub Pages에 권장)
1. Supabase 프로젝트 생성 후 Storage에서 공개(public) 버킷 `photobooth`를 만듭니다.
2. Storage 정책에서 `photobooth` 버킷에 `anon` 사용자의 **INSERT만** 허용하는 정책을 만듭니다. 공개 버킷은 이미지 URL을 가진 누구든 파일을 읽을 수 있습니다. UPDATE/DELETE/LIST 권한은 공개하지 마세요.
3. `js/photo-config.js`의 `url`, `anonKey`에 프로젝트 URL 및 **publishable / anon 키**를 입력합니다. 절대로 service_role 키를 넣지 마세요.
4. 완성 파일을 HTTPS 기반 GitHub Pages에 업로드한 후 카메라 사용 → 촬영 → QR을 휴대폰으로 스캔해 점검합니다.

Supabase SQL Editor 정책 예시(프로젝트와 버킷 구성을 확인한 후 실행):
```sql
create policy "kks_photobooth_anon_upload"
on storage.objects for insert to anon
with check (
  bucket_id = 'photobooth'
  and (storage.extension(name) = 'jpg')
);
```
운영 전 업로드 남용 방지를 위해 rate limit, CAPTCHA, 저장 용량 모니터링이 필요합니다. 파일은 자동 삭제되지 않으므로 Supabase 측에서 정기 삭제 작업을 **별도로** 설정하세요. QR로 공유할 사진에 사전 동의 안내를 넣는 것도 권장합니다.

### B. 기존 Python 서버
서버가 공개 HTTPS 주소에 배포되어 있고 `KKS_PUBLIC_URL=https://...` 가 설정돼 있어야 QR이 나옵니다. 기존 `server.py` 방식은 유지했습니다. GitHub Pages에만 배포하면 Python 서버는 실행되지 않습니다.

## 주의
- Supabase 프로젝트 URL과 publishable key가 입력되어 있습니다. **SUPABASE_SETUP.sql을 Supabase SQL Editor에서 한 번 실행해야** 버킷과 업로드 정책이 준비됩니다. 파일을 GitHub Pages에도 배포해야 합니다.
- 실제 카메라와 QR을 통한 휴대폰 다운로드는 사용자가 공개 HTTPS로 배포하고 Storage를 연결한 후 실기기로 테스트해야 합니다.
- 전시를 위해 짧은 보관 주기가 필요하다면 Supabase 삭제 자동화 작업을 별도 설정해야 합니다.
- ZIP의 `assets` 원본은 유지했습니다.

## v09 Supabase 연결 완료판 안내
- `js/photo-config.js`에 전달받은 프로젝트 URL 및 공개용 publishable key를 입력했습니다.
- `sb_publishable_` 키는 JWT가 아니므로 Authorization Bearer 헤더를 제거하고 `apikey`로 전송합니다.
- **필수:** Supabase Dashboard → SQL Editor에서 ZIP에 포함된 `SUPABASE_SETUP.sql` 실행 후 GitHub Pages에 배포하세요. 현재 이 채팅은 사용자의 Supabase 계정에 대한 SQL 실행 권한이 없어 제가 대신 실행할 수 없습니다.
- 사진 저장 완료 시 QR이 생성되며, 연결 실패 시 오류와 재시도 버튼이 나타납니다.
- 촬영 결과 화면은 30초 후 종료되므로 현장 네트워크를 테스트하세요. 파일은 자동으로 만료/삭제되지 않습니다.
