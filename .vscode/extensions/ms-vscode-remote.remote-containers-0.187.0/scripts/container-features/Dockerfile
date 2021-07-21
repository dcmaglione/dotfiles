ARG BASE_IMAGE=debian
FROM $BASE_IMAGE

USER root

ARG GITHUB=false
COPY library-scripts/github-debian.sh /tmp/library-scripts/
RUN if [ "$GITHUB" = "true" ]; then bash /tmp/library-scripts/github-debian.sh; fi

ARG DIND=false
COPY library-scripts/docker-in-docker-debian.sh /tmp/library-scripts/
RUN if [ "$DIND" = "true" ]; then bash /tmp/library-scripts/docker-in-docker-debian.sh; fi

ARG NODEJS=false
COPY library-scripts/node-debian.sh /tmp/library-scripts/
RUN if [ "$NODEJS" != "false" ]; then bash /tmp/library-scripts/node-debian.sh /usr/local/share/nvm "$NODEJS"; fi

ARG IMAGE_USER=root
USER $IMAGE_USER
