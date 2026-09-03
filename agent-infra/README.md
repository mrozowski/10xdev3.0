# Agent Infra

I run coding agent inside docker container. This way I can have better control over the agent access to resources, install tools that agent needs without changing anything on my system.


## How to run
* Make sure docker is running. If not `sudo systemctl start docker`
* Build the image and run it: `docker-compose up --build`
* Find the docker container: `docker ps -a`
* Start your docker container `docker start <container_id>`
* Enter it: `docker exec -it <container_id> bash`
* Or enter `docker exec -it -u root <container_id> bash` if you need root access to install / update packages



## Useful stuff

* `/10x-lesson`: Add a new lesson/rule for agent
* `npx @przeprogramowani/10x-cli@latest auth` - authenticate
