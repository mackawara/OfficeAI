stop:
	docker stop officeai-server || true
	docker rm officeai-server || true

clean:
	docker rmi officeai-server || true

build: stop clean
	docker build --no-cache -t officeai-server .

build-cache: stop clean
	docker build -t officeai-server .
run: stop
	docker run --rm --name officeai-server -p 3000:3000 --env-file .env.local officeai-server

run-it: stop
	docker run --rm -it officeai-server sh

prune: stop
	docker system prune -a

push:
	docker tag officeai-server mackawara/officeai-server:latest
	docker push mackawara/officeai-server:latest 