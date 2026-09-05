NAME=kban-db
IMAGE=postgres:16

.PHONY: up down setup db

db:
	docker start $(NAME) 2>/dev/null || docker run -d --name $(NAME) \
		-e POSTGRES_USER=postgresql \
		-e POSTGRES_PASSWORD=postgresql \
		-e POSTGRES_DB=kban \
		-p 5433:5432 $(IMAGE)
	@until docker exec $(NAME) pg_isready -U postgresql >/dev/null 2>&1; do sleep 0.5; done

up: db
	npm run dev

down:
	-docker stop $(NAME)

setup: db
	test -f .env || printf 'DATABASE_URL="postgresql://postgresql:postgresql@localhost:5433/kban"\n' > .env
	npm install
	npx prisma generate
	npx prisma db push
