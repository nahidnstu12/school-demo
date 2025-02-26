FROM oven/bun:1.2.3

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --backend=copyfile
COPY . .

RUN bunx prisma generate --schema=prisma/schema.mysql.prisma

ENV NEXT_TELEMETRY_DISABLED 1

CMD bun --bun run dev
