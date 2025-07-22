stop:
	docker stop officeai || true
	docker rm officeai || true

clean:
	docker rmi officeai || true

build: stop clean
	docker build --no-cache -t officeai .

build-cache: stop clean
	docker build -t officeai .
run: stop
	docker run --rm --name officeai -p 3000:3000 --env-file .env.local officeai

run-it: stop
	docker run --rm -it officeai sh

prune: stop
	docker system prune -a

push:
	docker tag officeai mackawara/officeai:latest
	docker push mackawara/officeai:latest 