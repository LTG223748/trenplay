FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && \
    apt-get install -y curl build-essential pkg-config libssl-dev git

# Install Rust for x86_64 (not ARM!)
ENV RUST_VERSION=1.72.1
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain none
ENV PATH="/root/.cargo/bin:${PATH}"

# Install x86_64 toolchain and add SBF target
RUN rustup toolchain install ${RUST_VERSION}-x86_64-unknown-linux-gnu && \
    rustup default ${RUST_VERSION}-x86_64-unknown-linux-gnu && \
    rustup target add bpfel-unknown-unknown --toolchain ${RUST_VERSION}-x86_64-unknown-linux-gnu

# Install Solana CLI
RUN curl -sSfL https://release.anza.xyz/v1.18.20/solana-install-init.sh | bash -s - v1.18.20
ENV PATH="/root/.local/share/solana/install/active_release/bin:/root/.cargo/bin:${PATH}"

# Install Anchor
RUN cargo install --git https://github.com/coral-xyz/anchor --locked --force

WORKDIR /project


