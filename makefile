# Variables 
DOCKER_COMPOSE = docker compose -f docker-compose.yml
REDIS_CONTAINER = redis
DB_CONTAINER = mysql
DB_USER ?= root
DB_PASS ?= 1234
DEV_USER = majumder
DEV_PRIVILEGES_CMD = "CREATE USER IF NOT EXISTS '$(DEV_USER)'@'%' IDENTIFIED BY '$(DB_PASS)'; GRANT ALL PRIVILEGES ON *.* TO '$(DEV_USER)'@'%'; FLUSH PRIVILEGES;"
TIMESTAMP = $(shell date +%Y.%m.%d.%H.%M.%S)

SCHEMA = prisma/schema.mysql.prisma

# Targets
.PHONY: grant-all migrate push reset production grant-permissions super

# [[General]] Set permissions for Prisma files
super:
	sudo chmod -R 777 . && sudo chmod -R 777 ./prisma

# [[MySQL]] Grant full access to the development user
grant-all:
	$(DOCKER_COMPOSE) run --rm -e MYSQL_PWD=$(DB_PASS) $(DB_CONTAINER) \
	mysql -h mysql -u $(DB_USER) -e $(DEV_PRIVILEGES_CMD)

# [[Prisma]] Migrate with timestamp
migrate:
	$(DOCKER_COMPOSE) run --rm $(DB_CONTAINER) bunx prisma migrate dev --name $(TIMESTAMP) --skip-seed --skip-generate --schema=$(SCHEMA)

# [[Prisma]] Push schema to database
push:
	$(DOCKER_COMPOSE) run --rm $(DB_CONTAINER) bunx prisma db push --accept-data-loss --skip-generate --schema=$(SCHEMA)

# [[Prisma]] Local Generate Prisma client
local_generate:
	bunx prisma generate --schema=$(SCHEMA)

# [[Prisma]] Generate Prisma client
generate:
	$(DOCKER_COMPOSE) run --rm $(DB_CONTAINER) bunx prisma generate --schema=$(SCHEMA)

# [[Prisma]] Reset database
reset:
	$(DOCKER_COMPOSE) run --rm $(DB_CONTAINER) bunx prisma migrate reset --force --skip-seed --skip-generate --schema=$(SCHEMA)

# [[Prisma]] Run Prisma seed
seed:
	$(DOCKER_COMPOSE) run --rm $(DB_CONTAINER) bunx prisma db seed --schema=$(SCHEMA)

# [[Prisma]] Migrate for production
production:
	$(DOCKER_COMPOSE) run --rm $(DB_CONTAINER) bunx prisma migrate deploy

# [[Redis]] clear all
redis-clear:
	@echo "Clearing all Redis cache..."
	$(DOCKER_COMPOSE) exec $(REDIS_CONTAINER) redis-cli FLUSHALL

# [[Redis]] restart
redis-restart:
	@echo "Restarting Redis container..."
	$(DOCKER_COMPOSE) restart $(REDIS_CONTAINER)

# [[Redis]] connection check
redis-ping:
	@echo "Pinging Redis to check connection..."
	$(DOCKER_COMPOSE) exec $(REDIS_CONTAINER) redis-cli PING

# [[Redis]] list all keys
redis-keys:
	@echo "Fetching all Redis keys..."
	$(DOCKER_COMPOSE) exec $(REDIS_CONTAINER) redis-cli KEYS '*'

# [[Docker]] Start Application
up:
	$(DOCKER_COMPOSE) up

# [[Docker]] Build and start services
build:
	$(DOCKER_COMPOSE) up --build

# [[Docker]] Start services in detached mode
detach:
	$(DOCKER_COMPOSE) up -d

# [[Docker]] Stop services
down:
	$(DOCKER_COMPOSE) down

# [[Docker]] Rebuild services
rebuild:
	$(DOCKER_COMPOSE) up --build

# [[Docker]] Install dependencies in the container
install:
	$(DOCKER_COMPOSE) exec $(DB_CONTAINER) bun install

# [[Docker]] View container logs
logs:
	$(DOCKER_COMPOSE) logs -f $(DB_CONTAINER)

# [[Docker]] Restart services
restart:
	$(DOCKER_COMPOSE) restart

# [[Docker]] Execute a shell in the container
exec:
	$(DOCKER_COMPOSE) exec $(DB_CONTAINER) sh

# [[Docker]] Remove orphaned containers
remove-orphans:
	$(DOCKER_COMPOSE) down --remove-orphans

# [[Docker]] Remove all resources for current app
flush:
	@echo "Cleaning up the resources..."
	$(DOCKER_COMPOSE) down --volumes --remove-orphans
	@docker system prune -f --volumes
	@echo "Cleanup completed."

# [[Docker]] Check container status
status:
	@docker ps | grep $(DB_CONTAINER) || echo "Container $(DB_CONTAINER) is not running."

# [[Docker]] Show container size
size:
	@docker ps --size | grep $(DB_CONTAINER) || echo "Container is not running."