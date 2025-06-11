ARG VARIANT=latest
FROM oven/bun:${VARIANT}

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get -y install --no-install-recommends \
    ca-certificates \
    git \
    fish \
    && apt-get auto-remove -y \
    && apt-get clean -y 

RUN chsh -s $(which fish) bun \
    && echo 'export PS1="\e[01;32m\u\e[m:\e[01;34m\w\e[m\$ "' >> /home/bun/.bashrc

USER bun

# Setup working directory
WORKDIR /workspaces

# Default shell to fish
ENV SHELL=/usr/bin/fish
