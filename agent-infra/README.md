# Agent Infra

I run coding agent inside docker container. This way I can have better control over the agent access to resources, install tools that agent needs witohut instaling anything new in my system.


## How to run
* Make sure docker is running. If not `sudo systemctl start docker`
* Build the image and run it
* Find the docker container: `docker ps -a`
* Start your docker container `docker start 9d44`
* Enter it: `docker exec -it 10xdev-agent bash`
