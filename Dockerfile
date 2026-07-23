FROM nginx:1.29-alpine

COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx *.schema.json /usr/share/nginx/html/
COPY --chown=nginx:nginx nodes/ /usr/share/nginx/html/nodes/

RUN chmod 0444 /etc/nginx/nginx.conf

USER nginx

EXPOSE 8080

ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
