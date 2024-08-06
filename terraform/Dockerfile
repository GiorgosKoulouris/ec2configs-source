FROM hashicorp/terraform:latest

RUN mkdir /app
WORKDIR /app
COPY entrypoint.sh /app

RUN mkdir /providers /configs
COPY ./_providers/* /providers
RUN cd /providers && terraform providers mirror .
COPY ./.terraformrc /root

LABEL maintainer="George Koulouris <gkoulouris@thecanopener.com>"
LABEL version="1.0.0"
LABEL project="EC2 Configs"

ENTRYPOINT ["./entrypoint.sh"]