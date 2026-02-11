module.exports = {
  apps: [
    {
      name: "donakawa-api",

      // ✅ 프로젝트 루트 (여기 기준으로 dist/.env 찾음)
      cwd: "/opt/app/donakawa/current",

      // ✅ 운영은 빌드 결과물 실행
      script: "dist/index.js",

      // ✅ 멀티코어 무중단 클러스터
      instances: "1",
      exec_mode: "fork",

      // ✅ 기본 안정성 옵션
      autorestart: true,
      max_restarts: 10,
      min_uptime: "30s",
      kill_timeout: 5000,

      // ✅ 운영에서는 watch 끄기
      watch: false,

      // ✅ 로그
      merge_logs: true,
      time: true,

      // ✅ .env 자동 로드 (코드에서 dotenv/config 안 써도 됨)
      // - .env 파일은 /srv/myapp/.env 에 있어야 함
      env_file: ".env",

      // ✅ Node 옵션
      // - source map 기반으로 stack trace 보기 좋게
      node_args: "--enable-source-maps",

      // 환경변수(추가로 오버라이드 가능)
      env: {
        NODE_ENV: "dev",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
