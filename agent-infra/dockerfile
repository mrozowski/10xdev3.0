FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# -------------------------
# System dependencies
# -------------------------
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    jq \
    unzip \
    build-essential \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common \
    openssh-client \
    nano \
    micro \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# -------------------------
# Node.js 22 with npx
# -------------------------
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm

# -------------------------
# Go 1.23.4
# -------------------------
ENV GO_VERSION=1.23.4

RUN wget https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz \
    && rm -rf /usr/local/go \
    && tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz \
    && rm go${GO_VERSION}.linux-amd64.tar.gz

ENV PATH="/usr/local/go/bin:${PATH}"

# -------------------------
# GitHub CLI
# -------------------------
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update \
    && apt-get install -y gh

# -------------------------
# Copilot CLI (gh extension)
# -------------------------
RUN gh extension install github/gh-copilot || true

# -------------------------
# Create non-root user
# -------------------------
RUN useradd -ms /bin/bash dev

WORKDIR /workspace

USER dev

# -------------------------
# Environment
# -------------------------
ENV PATH="/usr/local/go/bin:${PATH}"
