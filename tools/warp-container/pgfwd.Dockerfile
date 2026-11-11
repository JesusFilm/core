FROM alpine:3.20
RUN apk add --no-cache socat
COPY pgfwd.sh /pgfwd.sh
ENTRYPOINT ["/bin/sh", "/pgfwd.sh"]
